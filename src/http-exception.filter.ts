
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiException } from './exception/api.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    const message =
      typeof body === 'string'
        ? body
        : (body as { message?: string | string[] }).message;

    // 7주차: ApiException이면 상세 에러 코드 사용
    // 기존 예외는 6주차 COMMON 코드 유지
    const code =
      exception instanceof ApiException
        ? exception.code
        : `COMMON${status}`;

    response.status(status).json({
      isSuccess: false,
      code,
      message: Array.isArray(message)
        ? message[0]
        : (message ?? exception.message),
      result: null,
    });
  }
}
