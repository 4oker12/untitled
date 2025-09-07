import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest<Request>() as any;

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttp ? (exception as HttpException).message : 'Internal server error';

    const responseBody: any = {
      statusCode: status,
      message,
      path: req?.url ?? '',
      timestamp: new Date().toISOString(),
    };

    // include validation details if present
    if (isHttp) {
      const resp: any = (exception as HttpException).getResponse?.();
      if (resp && typeof resp === 'object' && Array.isArray(resp.message)) {
        responseBody.errors = resp.message;
      }
    }

    res.status(status).json(responseBody);
  }
}
