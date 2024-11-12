import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AppRouterModule } from './router/router.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, AppRouterModule],
  controllers: [],
  providers: [],
})
export class CommonModule {}
