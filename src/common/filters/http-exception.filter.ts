import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { getNow } from 'src/common/util.service';
import { TypeORMError } from 'typeorm';

@Catch()
export class HttpExceptionFilter<T = any> implements ExceptionFilter<T> {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception instanceof HttpException ? exception.getStatus() : 500;
        const message = this.getErrorMessage(exception);

        response.status(status).json({
            statusCode: status,
            timestamp: getNow(),
            path: request.url,
            message: message,
        });
    }

    private getErrorMessage(exception: T): string {
        console.error(exception);
        if (exception instanceof HttpException) {
            return exception.message;
        }
        if (exception instanceof TypeORMError) {
            return exception.message;
        }
        return 'Internal Server Error';
    }
}

/**
 * All exceptions will be refered from next.
 * https://docs.nestjs.com/exception-filters
 */
