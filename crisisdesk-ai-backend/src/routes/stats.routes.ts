import { Router } from 'express';
import { getSummary } from '../controllers/stats.controller';

const router = Router();

// GET /api/reports/stats/summary
router.get('/summary', getSummary);

export default router;
