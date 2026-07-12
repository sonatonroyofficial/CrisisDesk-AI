import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate req.body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // Pass validation error to centralized errorHandler middleware
      next(error);
    }
  };
}
export default validate;
