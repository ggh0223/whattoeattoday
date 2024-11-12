import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { getNow } from 'src/common/util.service';

@Injectable()
export class HttpRequestInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    console.log(`[${getNow()}] Request : \n`, {
      path: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
    });

    // request.user = {
    //     userid: 1,
    // };

    return next.handle();
  }
}
