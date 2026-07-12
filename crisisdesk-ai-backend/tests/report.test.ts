import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import Report from '../src/models/Report';

// Define DB Connection URL for testing
const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/crisisdesk_test';

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  try {
    await mongoose.connection.db?.collection('reports').deleteMany({});
  } catch (err) {
    // Ignore if collection not created
  }
  await mongoose.disconnect();
});

describe('CrisisDesk-AI Reports API Tests', () => {
  let createdReportId: string;
  let adminToken: string;

  // Pre-fetch admin login token
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = loginRes.body.data.token;
  });

  // 1. POST /api/reports (Success)
  it('should successfully create a new emergency report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        description: 'Gas pipeline leak reported near Sector 4 market.',
        location: 'Sector 4 Market',
        name: 'Jane Doe',
        contact: '+8801900000009',
        language: 'en',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.description).toBe('Gas pipeline leak reported near Sector 4 market.');
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.category).toBe('utility');
    expect(res.body.data.urgency).toBe('critical');

    createdReportId = res.body.data._id;
  });

  // 2. POST /api/reports (Validation Failure)
  it('should fail with 400 when description or location is missing', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        name: 'Jane Doe',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Description and location are required.');
  });

  // 3. GET /api/reports/:id (Success)
  it('should fetch report details by a valid ID', async () => {
    const res = await request(app).get(`/api/reports/${createdReportId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdReportId);
  });

  // 4. GET /api/reports/:id (Failure - 404)
  it('should return 404 for a non-existent report ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/reports/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Report not found.');
  });

  // 5. PATCH /api/reports/:id/status (Failure - Unauthorized)
  it('should deny access to update status without a Bearer token', async () => {
    const res = await request(app)
      .patch(`/api/reports/${createdReportId}/status`)
      .send({ status: 'assigned' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized.');
  });

  // 6. PATCH /api/reports/:id/status (Success - Authorized)
  it('should allow status update when authorized as admin', async () => {
    const res = await request(app)
      .patch(`/api/reports/${createdReportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('resolved');
  });

  // 7. GET /api/reports/stats/summary (Metrics shape validation)
  it('should return statistical summary with correct keys', async () => {
    const res = await request(app).get('/api/reports/stats/summary');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalReports');
    expect(res.body.data).toHaveProperty('criticalReports');
    expect(res.body.data).toHaveProperty('pendingReports');
    expect(res.body.data).toHaveProperty('resolvedReports');
    expect(res.body.data).toHaveProperty('categoryBreakdown');
    expect(res.body.data).toHaveProperty('urgencyBreakdown');
  });
});
