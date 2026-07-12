import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CrisisDesk AI API Documentation',
      version: '1.0.0',
      description: 'API specifications for CrisisDesk AI backend emergency classification system.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Report: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6a53b321ccc774477019f6df' },
            description: { type: 'string', example: 'A huge tree fell onto the main road blocking traffic.' },
            location: { type: 'string', example: 'Banani, Road 11' },
            name: { type: 'string', example: 'Sajid Hasan' },
            contact: { type: 'string', example: '+8801900000001' },
            language: { type: 'string', enum: ['bn', 'en', 'unknown'], example: 'en' },
            category: { type: 'string', example: 'infrastructure' },
            urgency: { type: 'string', example: 'medium' },
            summary: { type: 'string', example: 'A large tree has fallen and blocked the main road on Road 11 in Banani...' },
            suggestedAction: { type: 'string', example: 'Dispatch municipal emergency crews to clear the tree...' },
            confidence: { type: 'number', example: 0.95 },
            possibleDuplicate: { type: 'boolean', example: false },
            matchedReportId: { type: 'string', nullable: true, example: null },
            status: { type: 'string', enum: ['pending', 'in_review', 'assigned', 'resolved', 'rejected'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-07-12T15:30:41.939Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-07-12T15:30:41.939Z' },
          },
        },
        StatsSummary: {
          type: 'object',
          properties: {
            totalReports: { type: 'number', example: 3 },
            criticalReports: { type: 'number', example: 1 },
            pendingReports: { type: 'number', example: 1 },
            resolvedReports: { type: 'number', example: 1 },
            categoryBreakdown: {
              type: 'object',
              properties: {
                medical: { type: 'number', example: 1 },
                fire: { type: 'number', example: 0 },
                accident: { type: 'number', example: 1 },
                crime: { type: 'number', example: 0 },
                flood: { type: 'number', example: 0 },
                utility: { type: 'number', example: 1 },
                public_service: { type: 'number', example: 0 },
                infrastructure: { type: 'number', example: 0 },
                other: { type: 'number', example: 0 },
              },
            },
            urgencyBreakdown: {
              type: 'object',
              properties: {
                low: { type: 'number', example: 0 },
                medium: { type: 'number', example: 1 },
                high: { type: 'number', example: 1 },
                critical: { type: 'number', example: 1 },
              },
            },
          },
        },
      },
    },
    paths: {
      '/api/admin/login': {
        post: {
          summary: 'Admin login endpoint',
          description: 'Authenticate administrator credentials and receive signed JWT.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Successful authentication',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWlu...' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
            },
          },
        },
      },
      '/api/reports': {
        post: {
          summary: 'Submit a new citizen report',
          description: 'Submits a report, which classifies category/urgency via Gemini AI and runs local duplicate checks.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['description', 'location'],
                  properties: {
                    description: { type: 'string', example: 'A huge tree fell onto the main road blocking traffic.' },
                    location: { type: 'string', example: 'Banani, Road 11' },
                    name: { type: 'string', example: 'Sajid Hasan' },
                    contact: { type: 'string', example: '+8801900000001' },
                    language: { type: 'string', example: 'en' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Report created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Report' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation failed',
            },
          },
        },
        get: {
          summary: 'List reports with query filters',
          description: 'Retrieve lists of reports by category, urgency, status, search, and date range.',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'urgency', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: {
              description: 'Query success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          reports: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
                          total: { type: 'number', example: 1 },
                          page: { type: 'number', example: 1 },
                          limit: { type: 'number', example: 20 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/reports/{id}': {
        get: {
          summary: 'Fetch report details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Report details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Report' },
                    },
                  },
                },
              },
            },
            404: { description: 'Report not found' },
          },
        },
        delete: {
          summary: 'Delete report by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Delete confirmation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          deleted: { type: 'boolean', example: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            404: { description: 'Report not found' },
          },
        },
      },
      '/api/reports/{id}/status': {
        patch: {
          summary: 'Update report status',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['pending', 'in_review', 'assigned', 'resolved', 'rejected'], example: 'resolved' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Report' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            404: { description: 'Report not found' },
          },
        },
      },
      '/api/reports/stats/summary': {
        get: {
          summary: 'Get report metrics summary breakdown',
          description: 'Retrieve statistical counters and distributions for categories and urgencies.',
          responses: {
            200: {
              description: 'Aggregated summary stats',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/StatsSummary' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
export default setupSwagger;
