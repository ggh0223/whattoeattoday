"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const axios_1 = require("axios");
let MenuService = class MenuService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getData() {
        const { data, error } = await this.supabase.from('your_table').select('*');
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
    create(createMenuDto) {
        return 'This action adds a new menu';
    }
    async findAll() {
        const { data, error } = await this.supabase.from('menus').select('*');
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
    findOne(id) {
        return `This action returns a #${id} menu`;
    }
    update(id, updateMenuDto) {
        return `This action updates a #${id} menu`;
    }
    remove(id) {
        return `This action removes a #${id} menu`;
    }
    async fetchInstagramPosts() {
        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
        const response = await axios_1.default.get(`https://graph.instagram.com/v18.0/me/media?fields=id,caption,media_type,media_url,timestamp&access_token=${accessToken}`);
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
        const response = await axios_1.default.get(`https://kapi.kakao.com/v2/api/talk/channels/${channelId}/feed`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data.items.map(post => ({
            source: 'kakao',
            title: post.content.slice(0, 100),
            content: post.content,
            imageUrls: post.image_urls || [],
            createdAt: new Date(post.created_at)
        }));
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], MenuService);
//# sourceMappingURL=menu.service.js.map