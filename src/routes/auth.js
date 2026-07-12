import express from 'express';
import { getAuthConfig } from '../controllers/auth.js';

const router = express.Router();

router.get('/config', getAuthConfig);

export default router;
