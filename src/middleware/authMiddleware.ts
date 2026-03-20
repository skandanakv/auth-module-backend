import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/tokenService';
import { ERROR_MESSAGES } from '../utils/constants';

/**
 * Auth Middleware - Verify JWT token on protected routes
 * 
 * FLOW:
 * 1. Check if Authorization header exists
 * 2. Extract token from "Bearer <token>"
 * 3. Verify token using tokenService
 * 4. If valid → attach user to req.user, call next()
 * 5. If invalid → send 401 Unauthorized
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get Authorization header
    // Format: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
    const authHeader = req.headers.authorization;

    // Check if header exists
    // WHY? Without token, can't verify user
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED
      });
    }

    // Extract token from "Bearer <token>"
    // WHY split? Authorization header has format "Bearer <token>"
    // [0] = "Bearer", [1] = actual token
    const token = authHeader.split(' ')[1];

    // Check if token exists after split
    if (!token) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED
      });
    }

    // Verify token using tokenService
    // WHY? Check if signature is valid and not expired
    const verification = tokenService.verifyAccessToken(token);

    // If token invalid
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN
      });
    }

    // Token is valid! Extract user data from token payload
    // WHAT is payload? { userId, email, role } stored inside token
    const payload = verification.payload;

    // Attach user to request object
    // WHY? Controllers can access req.user to get current user info
    // EXAMPLE: In controller: const userId = req.user.userId
    (req as any).user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    // Call next() to continue to controller
    // WHY? Middleware chain - move to next middleware or controller
    next();

  } catch (error) {
    // If any error during verification
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN
    });
  }
};

/**
 * Authorization Middleware - Check user role
 * 
 * USAGE:
 * app.delete('/users/:id', authMiddleware, authorizeRole('admin'), deleteUser);
 * Only admin role can call this route
 */
export const authorizeRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user from request (attached by authMiddleware)
      const user = (req as any).user;

      // Check if user has required role
      // WHY? Different users have different permissions
      // EXAMPLE: Only admin can delete users
      if (user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Only ${requiredRole} can access this resource`
        });
      }

      // Role matches, continue to controller
      next();

    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }
  };
};