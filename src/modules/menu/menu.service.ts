import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios'

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

  
async fetchInstagramPosts() {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const response = await axios.get(
      `https://graph.instagram.com/v18.0/me/media?fields=id,caption,media_type,media_url,timestamp&access_token=${accessToken}`
    );
    
    return response.data.data.map(post => ({
      source: 'instagram',
      title: post.caption?.slice(0, 100) || 'Instagram Post',
      content: post.caption || '',
      imageUrls: [post.media_url],
      createdAt: new Date(post.timestamp)
    }));
  }
  
  async fetchKakaoPosts() {
    const accessToken = process.env.KAKAO_ACCESS_TOKEN;
    const channelId = process.env.KAKAO_CHANNEL_ID;
    const response = await axios.get(
      `https://kapi.kakao.com/v2/api/talk/channels/${channelId}/feed`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    return response.data.items.map(post => ({
      source: 'kakao',
      title: post.content.slice(0, 100),
      content: post.content,
      imageUrls: post.image_urls || [],
      createdAt: new Date(post.created_at)
    }));
  }
}
