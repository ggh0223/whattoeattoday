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
const schedule_1 = require("@nestjs/schedule");
const puppeteer = require("puppeteer");
const moment = require("moment");
let MenuService = class MenuService {
    constructor(supabase) {
        this.supabase = supabase;
        this.SOURCES = [
            'https://www.instagram.com/iganepork',
            'https://www.instagram.com/the.siktak',
            'https://pf.kakao.com/_xgUVZn/posts',
        ];
    }
    async handleCrolling() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if ((hours === 10 && minutes >= 30) || (hours === 11 && minutes <= 30)) {
            console.log('Fetching data...');
            this.sendCrollingStstus(`${moment().format('YYYY-MM-DD HH:mm:ss')} : start crolling`);
            const crollingTarget = [];
            for (let i = 0; i < this.SOURCES.length; i++) {
                const source = this.SOURCES[i];
                const data = await this.findBySource(source);
                if (data && Array.isArray(data) && data.length > 0) {
                    continue;
                }
                else {
                    crollingTarget.push(source);
                }
            }
            console.log('check', crollingTarget);
            this.sendCrollingStstus(crollingTarget);
            if (crollingTarget.length > 0) {
                const browser = await puppeteer.launch({ headless: true });
                const page = await browser.newPage();
                let isLogin = false;
                for (let i = 0; i < crollingTarget.length; i++) {
                    const domain = crollingTarget[i];
                    console.log('domain', domain);
                    let restaraunt, type, title;
                    if (domain.includes('instagram')) {
                        const map = {
                            iganepork: '이가네',
                            'the.siktak': '더 식탁',
                        };
                        const parts = domain.split('/');
                        restaraunt = parts[parts.length - 1];
                        title = map[restaraunt];
                        type = 'Insta';
                    }
                    else {
                        restaraunt = null;
                        title = '동천한식뷔페';
                        type = 'Kakao';
                    }
                    console.log('login status', isLogin);
                    if (!isLogin) {
                        await this.instaLogin(page);
                        isLogin = true;
                    }
                    this.sendCrollingStstus(restaraunt);
                    const { data, error } = await this[`crolling${type}`](page, restaraunt);
                    if (error) {
                        console.log(error);
                        continue;
                    }
                    if (data.length < 2) {
                        console.log(data);
                        continue;
                    }
                    const menu = {
                        title: title,
                        content: '',
                        imageUrl: data,
                        source: domain,
                    };
                    try {
                        const savedMenu = await this.saveMenu(menu);
                        console.log('savedMenu', savedMenu);
                        this.sendCrollingStstus(savedMenu);
                    }
                    catch (error) {
                        console.log('error in save menu : ', error);
                        this.sendCrollingStstus(error);
                        continue;
                    }
                }
                this.sendCrollingStstus(`${moment().format('YYYY-MM-DD HH:mm:ss')} : finish crolling`);
                await browser.close();
            }
            else {
                console.log('데이터 수집 완료');
            }
        }
    }
    async instaLogin(page) {
        await page.goto('https://www.instagram.com/accounts/login/', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('input[name="username"]', { visible: true });
        await page.waitForSelector('input[name="password"]', { visible: true });
        const INSTAGRAM_USERNAME = 'ggh0223';
        const INSTAGRAM_PASSWORD = 'rlarbgus1!';
        await page.type('input[name="username"]', INSTAGRAM_USERNAME, {
            delay: 100,
        });
        await page.type('input[name="password"]', INSTAGRAM_PASSWORD, {
            delay: 100,
        });
        await page.click('button[type="submit"]');
        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 60000,
        });
        const saveInfoButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find((button) => button.textContent?.includes('정보 저장'));
        });
        console.log('saveInfoButton', saveInfoButton);
        if (saveInfoButton) {
            console.log('Save login info button found. Clicking...');
            await saveInfoButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
        else {
            console.log('Save login info button not found. Skipping...');
        }
    }
    async crollingInsta(page, target) {
        try {
            const profileUrl = `https://www.instagram.com/${target}`;
            await page.goto(profileUrl, {
                waitUntil: 'networkidle2',
            });
            const data = await page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                console.log(images);
                return images
                    .map((img) => {
                    console.log(img);
                    return {
                        src: img.src,
                        alt: img.alt,
                    };
                })
                    .filter((img) => img.src.startsWith('https://'));
            });
            console.log('Image URLs:', data);
            if (Array.isArray(data) && data.length < 2) {
                throw new Error('이미지를 가져오는데 실패했습니다.');
            }
            return { data: data[1].src, error: null };
        }
        catch (error) {
            console.log(error);
            return { data: null, error: error };
        }
    }
    async crollingKakao(page) {
        try {
            await page.goto('https://pf.kakao.com/_xgUVZn/posts', {
                waitUntil: 'networkidle2',
            });
            const imageUrl = await page.evaluate(() => {
                const areaCard = document.querySelector('.area_card .wrap_fit_thumb');
                if (areaCard) {
                    const style = areaCard.getAttribute('style');
                    const urlMatch = style.match(/url\("(.+?)"\)/);
                    return urlMatch ? urlMatch[1] : null;
                }
                return null;
            });
            console.log('Image URL:', imageUrl);
            return { data: imageUrl, error: null };
        }
        catch (error) {
            console.log(error);
            return { data: null, error: error };
        }
    }
    async checkCrolling(source) {
        const browser = await puppeteer.launch({ headless: true });
        const { data, error } = await this.crollingInsta(browser, source);
        if (error) {
            console.log(error);
            await browser.close();
        }
        if (data.length < 2) {
            console.log(data);
            await browser.close();
        }
        const menu = {
            title: source,
            content: '',
            imageUrl: data[1].src,
            source: `https://www.instagram.com/${source}`,
        };
        const savedMenu = await this.saveMenu(menu);
        console.log(savedMenu);
        await browser.close();
    }
    async saveMenu(menu) {
        const url = menu.imageUrl.split('?')[0];
        console.log(url);
        const { data: existingData, error: existingError } = await this.supabase
            .from('menus')
            .select('id')
            .like('imageUrl', `%${url}%`);
        console.log(existingData);
        if (existingError) {
            throw new Error(existingError.message);
        }
        if (existingData.length > 0) {
            throw new Error('이미 존재하는 식단입니다.');
        }
        const { data, error } = await this.supabase
            .from('menus')
            .insert([menu])
            .select();
        console.log(data, error);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
    async findAll() {
        const today = moment().format('YYYY-MM-DD 00:00:00');
        const { data, error } = await this.supabase
            .from('menus')
            .select('*')
            .gt('created_at', today);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
    async findBySource(source) {
        const today = moment().format('YYYY-MM-DD 00:00:00');
        const { data, error } = await this.supabase
            .from('menus')
            .select('*')
            .eq('source', source)
            .gt('created_at', today);
        if (error) {
            return null;
        }
        return data;
    }
    sendCrollingStstus(status) {
        axios_1.default.post('https://whattoeattoday-server.vercel.app/api/menu/check/crolling', {
            status: status,
        });
    }
};
exports.MenuService = MenuService;
__decorate([
    (0, schedule_1.Cron)('0 */5 10,11 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuService.prototype, "handleCrolling", null);
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], MenuService);
//# sourceMappingURL=menu.service.js.map