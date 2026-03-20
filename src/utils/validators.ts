import { z } from 'zod';
import { PATTERNS } from './constants';

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(PATTERNS.PHONE, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

/**
 * OTP verification schema
 */
export const verifyOTPSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

/**
 * Generic validation function
 */
export const validate = (schema: z.ZodSchema, data: any) => {
  try {
    const result = schema.parse(data);
    return { valid: true, data: result, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        data: null,
        error: 'Validation failed'
      };
    }
    return { valid: false, data: null, error: 'Unknown validation error' };
  }
};
