import { AppModule } from 'src/modules/app.module';
import { MenuModule } from 'src/modules/menu/menu.module';

export const Routers = [
  {
    path: '/api',
    module: AppModule,
    children: [
      {
        path: '/',
        module: MenuModule,
      },
    ],
  },
];
