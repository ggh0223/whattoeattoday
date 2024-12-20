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
  getMenu() {
    return this.menuService.findAll();
  }

  @Post('check/crolling')
  checkCrolling(@Body() body) {
    console.log(body);
    return true;
  }

  //   @Get('crolling')
  //   startCrolling(@Req() req) {
  //     console.log(req.headers['Authorization']);
  //     if (
  //       req.headers['Authorization'] !==
  //       `Bearer ${this.configService.get<string>('CRON_SECRET')}`
  //     ) {
  //       throw new UnauthorizedException('비인가 요청');
  //     }
  //     return this.menuService.handleCrolling();
  //   }
}
