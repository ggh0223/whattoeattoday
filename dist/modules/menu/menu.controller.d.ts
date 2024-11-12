import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    create(createMenuDto: CreateMenuDto): string;
    findAll(): Promise<any[]>;
    findOne(id: string): string;
    update(id: string, updateMenuDto: UpdateMenuDto): string;
    remove(id: string): string;
}
