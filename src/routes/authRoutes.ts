import { Router } from 'express';
import {
  register,
  verifyOTP,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  getUser
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { loginWithOTP } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/login-otp', loginWithOTP);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getUser);

export default router;
