import { MenuService } from './menu.service';
import { ConfigService } from '@nestjs/config';
export declare class MenuController {
    private readonly menuService;
    private readonly configService;
    constructor(menuService: MenuService, configService: ConfigService);
    getMenu(): Promise<any[]>;
    startCrolling(req: any): Promise<void>;
}
