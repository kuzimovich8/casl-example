import { HttpException, HttpStatus } from '@nestjs/common';

export interface ValidationErrors {
  [key: string]: string | string[];
}

export class ValidationException extends HttpException {
  constructor(
    validationErrors: ValidationErrors,
    message = 'Validation failed',
    error = 'Bad Request',
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({ error, message, statusCode, validationErrors }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
