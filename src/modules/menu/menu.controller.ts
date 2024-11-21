import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ConfigService } from '@nestjs/config';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getMenu(@Req() req) {
    if (
      req.headers.get('Authorization') !==
      `Bearer ${this.configService.get<string>('SUPABASE_URL')}`
    ) {
      throw new UnauthorizedException('비인가 요청');
    }
    return this.menuService.handleCrolling();
  }
}
