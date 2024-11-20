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
            if (crollingTarget.length > 0) {
                const browser = await puppeteer.launch({ headless: true });
                for (let i = 0; i < crollingTarget.length; i++) {
                    const domain = crollingTarget[i];
                    console.log('domain', domain);
                    if (domain.includes('instagram')) {
                        const restaraunts = ['이가네', '더 식탁'];
                        const instagram = ['iganepork', 'the.siktak'];
                        const browser = await puppeteer.launch({ headless: true });
                        for (let i = 0; i < restaraunts.length - 1; i++) {
                            const res = restaraunts[i];
                            console.log(i, res);
                            const { data, error } = await this.crollingInsta(browser, res);
                            if (error) {
                                console.log(error);
                                continue;
                            }
                            const menu = {
                                title: res,
                                content: '',
                                imageUrl: data[1].src,
                                source: `https://www.instagram.com/${instagram[i]}`,
                            };
                            const savedMenu = await this.saveMenu(menu);
                            console.log('savedMenu', savedMenu);
                        }
                    }
                    else {
                        const data = await this.crollingKakao(browser);
                        const menu = {
                            title: `동천한식뷔페`,
                            content: '',
                            imageUrl: data,
                            source: 'https://pf.kakao.com/_xgUVZn/posts',
                        };
                        const savedMenu = await this.saveMenu(menu);
                        console.log('savedMenu', savedMenu);
                    }
                }
                await browser.close();
            }
        }
    }
    async crollingInsta(browser, target) {
        try {
            const page = await browser.newPage();
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
            return { data: data, error: null };
        }
        catch (error) {
            console.log(error);
            return { data: null, error: error };
        }
    }
    async crollingKakao(browser) {
        const page = await browser.newPage();
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
        return imageUrl;
    }
    async checkCrolling(source) {
        const browser = await puppeteer.launch({ headless: true });
        const data = await this.crollingInsta(browser, source);
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
        const { data: existingData, error: existingError } = await this.supabase
            .from('menus')
            .select('id')
            .eq('imageUrl', menu.imageUrl);
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
};
exports.MenuService = MenuService;
__decorate([
    (0, schedule_1.Cron)('0 */2 10,11 * * 1-5'),
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