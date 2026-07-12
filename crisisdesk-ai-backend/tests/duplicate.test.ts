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

describe('CrisisDesk-AI Duplicate Detection API Tests', () => {
  it('should flag the second report as duplicate when descriptions overlap > 60% at same location', async () => {
    // 1. Submit first report
    const res1 = await request(app)
      .post('/api/reports')
      .send({
        description: 'Large tree fell blocking road in Gulshan.',
        location: 'Gulshan-2 Circle',
        name: 'Sajid',
        contact: '+8801900000001',
        language: 'en',
      });

    expect(res1.status).toBe(201);
    expect(res1.body.data.possibleDuplicate).toBe(false);
    expect(res1.body.data.matchedReportId).toBeNull();
    const firstReportId = res1.body.data._id;

    // 2. Submit second similar report (matching normalized location and > 60% word overlap)
    const res2 = await request(app)
      .post('/api/reports')
      .send({
        description: 'Large tree fell blocking road in Gulshan. Heavy traffic jam here.',
        location: '   gulshan-2 circle   ', // testing casing/trim normalization
        name: 'Rahim',
        contact: '+8801900000002',
        language: 'en',
      });

    expect(res2.status).toBe(201);
    expect(res2.body.data.possibleDuplicate).toBe(true);
    expect(res2.body.data.matchedReportId).toBe(firstReportId);
  });
});
