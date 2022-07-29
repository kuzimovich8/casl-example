import { ValidationPipe, ValidationError, UnprocessableEntityException } from '@nestjs/common';

const errorsArrayToResponse = (errors: ValidationError[]) =>
  errors.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.property]: curr.constraints ? Object.values(curr.constraints)[0] : errorsArrayToResponse(curr.children),
    }),
    {},
  );

export const getDefaultValidationPipe = () =>
  new ValidationPipe({
    transform: true,
    stopAtFirstError: true,
    disableErrorMessages: true,
    exceptionFactory: (errors) =>
      new UnprocessableEntityException({
        statusCode: 422,
        message: 'Unprocessable Entity',
        validationErrors: errorsArrayToResponse(errors),
      }),
  });
