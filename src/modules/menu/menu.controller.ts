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

import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import puppeteer from 'puppeteer-extra';
import * as moment from 'moment';
import { error } from 'console';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

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

  @Get('test')
  async startCrolling(@Req() req) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    return this.menuService.instaLogin(page);
  }
}
