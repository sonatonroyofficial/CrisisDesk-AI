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
import { requireAdmin } from '../middlewares/auth';
import { reportCreationLimiter } from '../middlewares/rateLimiter';

const router = Router();

// POST /api/reports - Create a report (Rate limited)
router.post('/', reportCreationLimiter, validate(createReportSchema), createReport);

// GET /api/reports - List reports with filters
router.get('/', getReports);

// GET /api/reports/:id - Get a report by ID
router.get('/:id', getReportById);

// PATCH /api/reports/:id/status - Update report status (Protected by Admin Auth)
router.patch('/:id/status', requireAdmin, validate(updateStatusSchema), updateReportStatus);

// DELETE /api/reports/:id - Delete a report (Protected by Admin Auth)
router.delete('/:id', requireAdmin, deleteReport);

export default router;
