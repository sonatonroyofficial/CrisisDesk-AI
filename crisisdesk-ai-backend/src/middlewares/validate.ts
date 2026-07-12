import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/ApiResponse';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate req.body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Check if either 'description' or 'location' validation failed
        const hasDescOrLocError = error.issues.some(issue => 
          issue.path.includes('description') || issue.path.includes('location')
        );

        if (hasDescOrLocError) {
          return res.status(400).json(errorResponse("Description and location are required."));
        }

        // Fallback to the first issue message
        const firstMessage = error.issues[0]?.message || "Validation error";
        return res.status(400).json(errorResponse(firstMessage));
      }
      
      return res.status(400).json(errorResponse("Invalid request body"));
    }
  };
}
export default validate;
