# CrisisDesk AI Backend

CrisisDesk AI is an emergency-report triage and analytics system designed to process citizen reports (in English, Bangla, or mixed languages) and automatically classify them by category, urgency, and summary details using the Gemini AI API. It performs Jaccard-similarity-based duplicate checks, provides full CRUD endpoints for reporting, compiles analytics metrics, and exposes interactive Swagger OpenAPI documentation.

## Tech Stack
- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Validation:** Zod
- **API Docs:** Swagger UI & swagger-jsdoc
- **Testing:** Jest & Supertest
- **Containerization:** Docker & Docker Compose
- **AI Engine:** Google Gemini AI API (`gemini-3.5-flash`)

---

## Directory Structure
```text
crisisdesk-ai-backend/
├── src/
│   ├── app.ts                  # Application entrypoint & Express setup
│   ├── config/
│   │   ├── db.ts               # Database connection setup
│   │   └── env.ts              # Strongly-typed environment variables validation
│   ├── controllers/
│   │   ├── admin.controller.ts # Admin auth controller
│   │   ├── report.controller.ts# Reports CRUD controller
│   │   └── stats.controller.ts # Aggregation metrics controller
│   ├── docs/
│   │   └── swagger.ts          # OpenAPI specs definition
│   ├── middlewares/
│   │   ├── auth.ts             # JWT authentication gate
│   │   ├── errorHandler.ts     # Centralized error handler
│   │   ├── rateLimiter.ts      # Global & report endpoint rate limiters
│   │   └── validate.ts         # Generic Zod validation validator
│   ├── models/
│   │   └── Report.ts           # Mongoose Report schema & indexes
│   ├── routes/
│   │   ├── admin.routes.ts     # Admin authentication routes
│   │   ├── report.routes.ts    # Reports CRUD routes
│   │   └── stats.routes.ts     # Analytics summary routes
│   ├── services/
│   │   ├── ai.service.ts       # Gemini API classification & fallback handler
│   │   └── duplicate.service.ts# Word-overlap duplicate check service
│   ├── utils/
│   │   └── ApiResponse.ts      # Standard response helpers
│   └── validators/
│       └── report.schema.ts    # Zod schemas for input validation
├── tests/
│   ├── duplicate.test.ts       # Jaccard check integration tests
│   └── report.test.ts          # Reports CRUD integration tests
├── Dockerfile                  # Multi-stage production container setup
├── docker-compose.yml          # Persistent MongoDB & API stack setup
├── jest.config.js              # Test suite configuration
├── tsconfig.json               # TypeScript compiler options
└── package.json                # Project dependencies and scripts
```

---

## Deployment (Render)

Deploying the CrisisDesk AI backend to Render takes only a few minutes. Follow these exact steps:

1. **Host Repository:** Ensure your repository is pushed to GitHub.
2. **Create Web Service:**
   - Log into your [Render Dashboard](https://dashboard.render.com).
   - Click **New** -> **Web Service**.
   - Connect your GitHub account and select your `CrisisDesk-AI` repository.
3. **Configure Settings:**
   - **Name:** `crisisdesk-ai-backend` (or a name of your choice).
   - **Region:** Choose the region closest to your users.
   - **Branch:** `main`
   - **Root Directory:** `crisisdesk-ai-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. **Environment Variables:**
   Under the **Environment** tab, click **Add Environment Variable** and add the following required keys:
   - `PORT`: `3000` (or leave empty to let Render handle it automatically)
   - `MONGODB_URI`: *Your MongoDB Atlas cluster connection string*
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
   - `JWT_SECRET`: *A secure random string for signing JWT tokens*
   - `ADMIN_USERNAME`: `admin` (or your preferred admin username)
   - `ADMIN_PASSWORD`: `admin123` (or your preferred admin password)
5. **Deploy:** Click **Deploy Web Service**. Render will automatically run the build script, compile TypeScript, start the production server, and provision your live HTTPS URL.

- Deployed API URL Placeholder: `https://<my-render-url>.onrender.com`
- Deployed Swagger Docs Placeholder: `https://<my-render-url>.onrender.com/api-docs`

---

## Setup & Running Locally

### Prerequisites
- Node.js (v20 or higher)
- Local MongoDB instance running on `mongodb://127.0.0.1:27017`

### 1. Installation
Navigate into the backend project folder and install the dependencies:
```bash
cd crisisdesk-ai-backend
npm install
```

### 2. Configure Environment
Create a `.env` file in `crisisdesk-ai-backend/` based on `.env.example`:
```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/crisisdesk
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Run Automated Tests
To run the full Jest integration and duplicate detection tests:
```bash
npm test
```

---

## Setup & Running with Docker

You can run the API along with a persistent MongoDB database in isolated containers.

1. Ensure Docker Desktop is installed and running.
2. Build and start the compose stack:
   ```bash
   docker compose up --build -d
   ```
3. The API will be available at `http://localhost:3000` and will connect automatically to the persistent MongoDB container.

---

## API Endpoints List

### 1. Health Check
- **Endpoint:** `GET /health`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok"
    }
  }
  ```

### 2. Admin Authentication
- **Endpoint:** `POST /api/admin/login`
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 3. Submit Report
- **Endpoint:** `POST /api/reports`
- **Request Body:**
  ```json
  {
    "description": "Short circuit in the electric transformer near House 12. Sparking heavily.",
    "location": "Banani Road 11",
    "name": "Arif",
    "contact": "+8801711111111",
    "language": "en"
  }
  ```
- **Response (210 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a53b321ccc774477019f6df",
      "description": "Short circuit in the electric transformer near House 12. Sparking heavily.",
      "location": "Banani Road 11",
      "name": "Arif",
      "contact": "+8801711111111",
      "language": "en",
      "category": "utility",
      "urgency": "critical",
      "summary": "An electrical transformer is short circuiting and sparking heavily near House 12.",
      "suggestedAction": "Request immediate grid isolation and deploy fire services to secure the perimeter.",
      "confidence": 0.95,
      "possibleDuplicate": false,
      "matchedReportId": null,
      "status": "pending",
      "createdAt": "2026-07-12T15:30:41.939Z",
      "updatedAt": "2026-07-12T15:30:41.939Z"
    }
  }
  ```

### 4. Fetch All Reports (With Filters)
- **Endpoint:** `GET /api/reports`
- **Query Parameters:** `category`, `urgency`, `status`, `search` (casing-insensitive search on description/location), `from`, `to` (date range), `page`, `limit` (pagination).
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "reports": [ ... ],
      "total": 12,
      "page": 1,
      "limit": 20
    }
  }
  ```

### 5. Fetch Report Details
- **Endpoint:** `GET /api/reports/:id`
- **Response:**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### 6. Update Report Status (Admin Only)
- **Endpoint:** `PATCH /api/reports/:id/status`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "status": "resolved"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### 7. Delete Report (Admin Only)
- **Endpoint:** `DELETE /api/reports/:id`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Report deleted successfully."
    }
  }
  ```

### 8. Analytics Summary
- **Endpoint:** `GET /api/reports/stats/summary`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalReports": 3,
      "criticalReports": 1,
      "pendingReports": 1,
      "resolvedReports": 1,
      "categoryBreakdown": {
        "medical": 1,
        "fire": 0,
        "accident": 1,
        "crime": 0,
        "flood": 0,
        "utility": 1,
        "public_service": 0,
        "infrastructure": 0,
        "other": 0
      },
      "urgencyBreakdown": {
        "low": 0,
        "medium": 1,
        "high": 1,
        "critical": 1
      }
    }
  }
  ```

---

## Interactive OpenAPI / Swagger Documentation

Interactive documentation is fully configured and updated. You can browse, inspect schemas, and make sample requests directly from your browser by visiting:

`http://localhost:3000/api-docs`
