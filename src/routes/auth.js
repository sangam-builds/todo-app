import express from 'express';
import {
  googleLogin,
  googleCallback,
  getCurrentUser,
  logout
} from '../controllers/auth.js';

const router = express.Router();

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
