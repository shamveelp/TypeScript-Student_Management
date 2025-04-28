import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  // Handle validation errors from Mongoose
  if (err.name === 'ValidationError') {
    res.status(400).render('error', {
      title: 'Validation Error',
      message: err.message,
      error: err
    });
    return;
  }

  // Handle duplicate key errors from MongoDB
  if ((err as any).code === 11000) {
    res.status(400).render('error', {
      title: 'Duplicate Error',
      message: 'A record with that data already exists',
      error: err
    });
    return;
  }

  // Generic error response
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};