import { SupabaseClient } from '@supabase/supabase-js';
export declare class MenuService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    SOURCES: string[];
    handleCrolling(): Promise<void>;
    crollingInsta(browser: any, target: any): Promise<any>;
    crollingKakao(browser: any): Promise<any>;
    checkCrolling(source: any): Promise<void>;
    saveMenu(menu: any): Promise<any[]>;
    findAll(): Promise<any[]>;
    findBySource(source: any): Promise<any[]>;
}
