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
exports.HttpRequestInterceptor = void 0;
const common_1 = require("@nestjs/common");
const util_service_1 = require("../util.service");
let HttpRequestInterceptor = class HttpRequestInterceptor {
    constructor() { }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        console.log(`[${(0, util_service_1.getNow)()}] Request : \n`, {
            path: request.url,
            method: request.method,
            body: request.body,
            query: request.query,
            params: request.params,
        });
        return next.handle();
    }
};
exports.HttpRequestInterceptor = HttpRequestInterceptor;
exports.HttpRequestInterceptor = HttpRequestInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HttpRequestInterceptor);
//# sourceMappingURL=http-request.interceptor.js.map