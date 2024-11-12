import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { DatabaseModule } from '../common/database/database.module'; // Adjust the path as necessary

@Module({
    imports:[DatabaseModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
