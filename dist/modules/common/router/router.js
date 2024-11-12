"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routers = void 0;
const app_module_1 = require("../../app.module");
const menu_module_1 = require("../../menu/menu.module");
exports.Routers = [
    {
        path: '/api',
        module: app_module_1.AppModule,
        children: [
            {
                path: '/menu',
                module: menu_module_1.MenuModule,
            },
        ],
    },
];
//# sourceMappingURL=router.js.map