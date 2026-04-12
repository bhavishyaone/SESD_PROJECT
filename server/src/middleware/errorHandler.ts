import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const errorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Mongoose specific validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered.';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
