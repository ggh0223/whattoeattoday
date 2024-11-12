import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AppService } from './app.service';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Controller()
export class AppController {
  constructor() {}

  @Get('/fb/oauth')
  async facebookOauth() {
    return true
  }
}
