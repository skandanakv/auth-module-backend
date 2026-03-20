import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}


export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  let statusCode = 500; // Internal server error
  let message = 'Something went wrong';
  let details = null;


  console.error('❌ Error:', {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack
  });


  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  }


  else if (error.name === 'ZodError') {
    statusCode = 400; // Bad request
    message = error.errors[0]?.message || 'Validation failed';
    details = error.errors;
  }


  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  else if (error.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(error.keyPattern)[0]; // email, phone, etc
    message = `${field} already exists`;
  }


  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // 6️⃣ Default errors (unknown)
  else {
    statusCode = error.statusCode || 500;
    message = error.message || 'Internal server error';
  }


  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { details }), // Only show details in dev
    timestamp: new Date().toISOString()
  });
};


export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Throw 404 error
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};