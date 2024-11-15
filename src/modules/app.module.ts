import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/modules/common/database/database.entity';

import { CommonModule } from './common/common.module';
import { MenuModule } from './menu/menu.module';


@Module({
  imports: [
    CommonModule,
    // TypeOrmModule.forFeature(entities),
    MenuModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
