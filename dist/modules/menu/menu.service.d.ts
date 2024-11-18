import { SupabaseClient } from '@supabase/supabase-js';
export declare class MenuService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    onModuleInit(): Promise<void>;
    handleKakaoCrolling(): Promise<void>;
    handleInstaCrolling(): Promise<void>;
    crollingInsta(browser: any, target: any): Promise<any>;
    crollingKakao(browser: any): Promise<any>;
    saveMenu(menu: any): Promise<any[]>;
    findAll(): Promise<any[]>;
}
