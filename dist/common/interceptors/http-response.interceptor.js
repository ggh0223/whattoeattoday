"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const http_message_decorator_1 = require("../decorators/http-message.decorator");
let HttpResponseInterceptor = class HttpResponseInterceptor {
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status = response.statusCode;
        const message = this.reflector.get(http_message_decorator_1.STATUS_MESSAGE_KEY, context.getHandler());
        return next.handle().pipe((0, operators_1.map)((data) => {
            const returnObj = {
                result: this.validateResponse(data),
                status: status,
                message: message ?? 'No message',
            };
            if (returnObj.result)
                returnObj.data = data;
            console.log(`[${request.method}] ${request.url} : Success`);
            return returnObj;
        }));
    }
    validateResponse(data) {
        if (Array.isArray(data))
            return !!data.length;
        if (typeof data === 'undefined')
            return false;
        if (data === null)
            return false;
        return true;
    }
};
exports.HttpResponseInterceptor = HttpResponseInterceptor;
exports.HttpResponseInterceptor = HttpResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], HttpResponseInterceptor);
//# sourceMappingURL=http-response.interceptor.js.map