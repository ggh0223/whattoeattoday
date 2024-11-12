import { AppModule } from 'src/modules/app.module';
import { MenuModule } from 'src/modules/menu/menu.module';
export declare const Routers: {
    path: string;
    module: typeof AppModule;
    children: {
        path: string;
        module: typeof MenuModule;
    }[];
}[];
