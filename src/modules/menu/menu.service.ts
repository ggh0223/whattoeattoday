import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MenuService {
    constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) {}

  async getData() {
    const { data, error } = await this.supabase.from('your_table').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  create(createMenuDto: CreateMenuDto) {
    return 'This action adds a new menu';
  }

  async findAll() {
    const { data, error } = await this.supabase.from('menus').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} menu`;
  }

  update(id: number, updateMenuDto: UpdateMenuDto) {
    return `This action updates a #${id} menu`;
  }

  remove(id: number) {
    return `This action removes a #${id} menu`;
  }
}
