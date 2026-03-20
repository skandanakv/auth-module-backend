import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import otpService from '../services/otpService';
import tokenService from '../services/tokenService';
import emailService from '../services/emailService';
import { validate, registerSchema, loginSchema, verifyOTPSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from '../utils/validators';
import { formatSuccessResponse, isAccountLocked, getUnlockTimeRemaining } from '../utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ACCOUNT_LOCKOUT } from '../utils/constants';
import jwt from 'jsonwebtoken';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(registerSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { name, email, phone, password } = validation.data as any;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError(ERROR_MESSAGES.EMAIL_EXISTS, 409);
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw new AppError(ERROR_MESSAGES.PHONE_EXISTS, 409);
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'user',
      emailVerified: false,
      phoneVerified: false,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null
    });

    const otpResult = await otpService.generateAndSendOTP(user._id.toString(), email);
    if (!otpResult.success) {
      throw new AppError(otpResult.message, 500);
    }

    res.status(201).json(
      formatSuccessResponse(SUCCESS_MESSAGES.REGISTERED, {
        userId: user._id,
        email: user.email,
        message: 'OTP sent to your email. Please verify to complete registration.'
      })
    );

  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(verifyOTPSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { userId, otp } = validation.data as any;

    const otpResult = await otpService.verifyOTP(userId, otp);

    if (!otpResult.success) {
      throw new AppError(otpResult.message, 400);
    }

    res.status(200).json(
      formatSuccessResponse(SUCCESS_MESSAGES.OTP_VERIFIED, {
        message: 'You can now login with your credentials'
      })
    );

  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(loginSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { email, password } = validation.data as any;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!user.emailVerified) {
      throw new AppError(ERROR_MESSAGES.EMAIL_NOT_VERIFIED, 403);
    }

    if (isAccountLocked(user.lockedUntil)) {
      const remainingMinutes = getUnlockTimeRemaining(user.lockedUntil);
      throw new AppError(
        `${ERROR_MESSAGES.ACCOUNT_LOCKED} Try again in ${remainingMinutes} minutes`,
        423
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= ACCOUNT_LOCKOUT.MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(
          Date.now() + ACCOUNT_LOCKOUT.LOCK_TIME_MINUTES * 60 * 1000
        );
      }

      await user.save();
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    const accessToken = tokenService.generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );

    const refreshToken = tokenService.generateRefreshToken(user._id.toString());

    await tokenService.saveRefreshToken(user._id.toString(), refreshToken);

    res.status(200).json(
      formatSuccessResponse(SUCCESS_MESSAGES.LOGIN_SUCCESS, {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      })
    );

  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(refreshTokenSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { refreshToken: token } = validation.data as any;

    const verification = tokenService.verifyRefreshToken(token);
    if (!verification.valid) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, 401);
    }

    const isValid = await tokenService.isRefreshTokenValid(token);
    if (!isValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, 401);
    }

    const payload = verification.payload;
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    const newAccessToken = tokenService.generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );

    res.status(200).json(
      formatSuccessResponse(SUCCESS_MESSAGES.TOKEN_REFRESHED, {
        accessToken: newAccessToken,
        expiresIn: 900
      })
    );

  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(forgotPasswordSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { email } = validation.data as any;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json(
        formatSuccessResponse('If email exists, reset link sent', {})
      );
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const emailResult = await emailService.sendPasswordResetEmail(email, resetLink);

    if (!emailResult) {
      throw new AppError('Failed to send reset email', 500);
    }

    res.status(200).json(
      formatSuccessResponse('If email exists, reset link sent', {})
    );

  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(resetPasswordSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { resetToken, newPassword } = validation.data as any;

    let payload: any;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET || 'default_secret');
    } catch (error) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, 401);
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    user.password = newPassword;
    await user.save();

    const RefreshToken = require('../models/RefreshToken').default;
    await RefreshToken.updateMany(
      { userId: user._id },
      { isRevoked: true }
    );

    res.status(200).json(
      formatSuccessResponse(SUCCESS_MESSAGES.PASSWORD_RESET, {
        message: 'Password reset successful. Please login with new password.'
      })
    );

  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(refreshTokenSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { refreshToken: token } = validation.data as any;

    const verification = tokenService.verifyRefreshToken(token);
    if (!verification.valid) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, 401);
    }

    await tokenService.revokeRefreshToken(token);

    res.status(200).json(
      formatSuccessResponse(SUCCESS_MESSAGES.LOGOUT_SUCCESS, {})
    );

  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    const userData = await User.findById(user.userId);

    if (!userData) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    res.status(200).json(
      formatSuccessResponse('User retrieved successfully', {
        user: {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          emailVerified: userData.emailVerified,
          phoneVerified: userData.phoneVerified,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        }
      })
    );

  } catch (error) {
    next(error);
  }



  
};

export const loginWithOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validate(forgotPasswordSchema, req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const { email } = validation.data as any;

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (isAccountLocked(user.lockedUntil)) {
      const remainingMinutes = getUnlockTimeRemaining(user.lockedUntil);
      throw new AppError(
        `${ERROR_MESSAGES.ACCOUNT_LOCKED} Try again in ${remainingMinutes} minutes`,
        423
      );
    }

    const otpResult = await otpService.generateAndSendOTP(user._id.toString(), email);
    if (!otpResult.success) {
      throw new AppError(otpResult.message, 500);
    }

    res.status(200).json(
      formatSuccessResponse('OTP sent to email', {
        userId: user._id,
        message: 'Enter OTP to login'
      })
    );

  } catch (error) {
    next(error);
  }
};