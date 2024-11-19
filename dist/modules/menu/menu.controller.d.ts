import { MenuService } from './menu.service';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    getMenu(): Promise<any[]>;
    checkCrolling(source: any): Promise<void>;
}
