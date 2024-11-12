import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class MenuService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getData(): Promise<any[]>;
    create(createMenuDto: CreateMenuDto): string;
    findAll(): Promise<any[]>;
    findOne(id: number): string;
    update(id: number, updateMenuDto: UpdateMenuDto): string;
    remove(id: number): string;
    fetchInstagramPosts(): Promise<any>;
    fetchKakaoPosts(): Promise<any>;
}
