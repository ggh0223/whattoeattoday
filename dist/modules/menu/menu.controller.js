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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
const config_1 = require("@nestjs/config");
let MenuController = class MenuController {
    constructor(menuService, configService) {
        this.menuService = menuService;
        this.configService = configService;
    }
    getMenu() {
        return this.menuService.findAll();
    }
    startCrolling(req) {
        console.log(req.headers.get('Authorization!'));
        if (req.headers.get('Authorization') !==
            `Bearer ${this.configService.get('CRON_SECRET')}`) {
            throw new common_1.UnauthorizedException('비인가 요청');
        }
        return this.menuService.handleCrolling();
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Get)('crolling'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "startCrolling", null);
exports.MenuController = MenuController = __decorate([
    (0, common_1.Controller)('menu'),
    __metadata("design:paramtypes", [menu_service_1.MenuService,
        config_1.ConfigService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map