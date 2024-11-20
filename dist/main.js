"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
const core_2 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const http_response_interceptor_1 = require("./common/interceptors/http-response.interceptor");
const http_request_interceptor_1 = require("./common/interceptors/http-request.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const swagger_1 = require("./common/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
    });
    const reflector = new core_2.Reflector();
    app.useGlobalInterceptors(new http_request_interceptor_1.HttpRequestInterceptor(), new http_response_interceptor_1.HttpResponseInterceptor(reflector));
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    (0, swagger_1.setupSwagger)(app);
    await app.listen(3000, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map