import { Router } from 'express';
import { 
  createReport, 
  getReports, 
  getReportById, 
  updateReportStatus, 
  deleteReport 
} from '../controllers/report.controller';
import { validate } from '../middlewares/validate';
import { createReportSchema, updateStatusSchema } from '../validators/report.schema';

const router = Router();

// POST /api/reports - Create a report
router.post('/', validate(createReportSchema), createReport);

// GET /api/reports - List reports with filters
router.get('/', getReports);

// GET /api/reports/:id - Get a report by ID
router.get('/:id', getReportById);

// TODO: protect with admin auth in Phase 8
// PATCH /api/reports/:id/status - Update report status
router.patch('/:id/status', validate(updateStatusSchema), updateReportStatus);

// TODO: protect with admin auth in Phase 8
// DELETE /api/reports/:id - Delete a report
router.delete('/:id', deleteReport);

export default router;
