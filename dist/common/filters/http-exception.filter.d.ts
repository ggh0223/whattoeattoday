import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class HttpExceptionFilter<T = any> implements ExceptionFilter<T> {
    catch(exception: T, host: ArgumentsHost): void;
    private getErrorMessage;
}
