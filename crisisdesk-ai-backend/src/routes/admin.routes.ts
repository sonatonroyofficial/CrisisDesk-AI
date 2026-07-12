import { Router } from 'express';
import { login } from '../controllers/admin.controller';

const router = Router();

// POST /api/admin/login
router.post('/login', login);

export default router;
