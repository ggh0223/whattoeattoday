import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpResponseInterceptor } from 'src/common/interceptors/http-response.interceptor';
import { HttpRequestInterceptor } from './common/interceptors/http-request.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { setupSwagger } from 'src/common/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  }); // Enable CORS

  const reflector = new Reflector();
  app.useGlobalInterceptors(
    new HttpRequestInterceptor(),
    new HttpResponseInterceptor(reflector),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  setupSwagger(app);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
