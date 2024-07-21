// filters/jsonapi-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-var-requires */
const JSONAPIError = require('jsonapi-serializer').Error;

@Catch()
export class JsonApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      status: `${status}`,
      title: exception['message'] ?? 'Internal server Error',
      detail:
        exception instanceof HttpException && exception.getResponse()
          ? (exception.getResponse() as any).message
          : null,
    };

    const jsonApiError = new JSONAPIError(errorResponse);
    response.status(status).json(jsonApiError);
  }
}
