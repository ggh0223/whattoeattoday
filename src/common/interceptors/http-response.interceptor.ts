import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { STATUS_MESSAGE_KEY } from 'src/common/decorators/http-message.decorator';

export interface Response<T> {
  result: boolean;
  status: number;
  message: string;
  data?: T;
}

@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = response.statusCode;
    const message = this.reflector.get<string>(
      STATUS_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        const returnObj: Response<T> = {
          result: this.validateResponse(data),
          status: status,
          message: message ?? 'No message',
        };
        if (returnObj.result) returnObj.data = data;

        console.log(`[${request.method}] ${request.url} : Success`);

        return returnObj;
      }),
    );
  }

  private validateResponse(data: T): boolean {
    if (Array.isArray(data)) return !!data.length;
    if (typeof data === 'undefined') return false;
    if (data === null) return false;
    return true;
  }
}
