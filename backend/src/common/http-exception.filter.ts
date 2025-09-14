import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Check the context type
    const contextType = host.getType<GqlContextType>();

    // Handle GraphQL context
    if (contextType === 'graphql') {
      // For GraphQL, we just rethrow the exception to let Apollo handle it
      throw exception;
    }

    // Handle HTTP context
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest<Request>() as any;

    // Check if res.status is a function
    if (!res || typeof res.status !== 'function') {
      throw exception;
    }

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

    return res.status(status).json(responseBody);
  }
}
