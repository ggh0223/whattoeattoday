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
const puppeteer_extra_1 = require("puppeteer-extra");
const moment = require("moment");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer_extra_1.default.use(StealthPlugin());
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
            this.sendCrollingStstus(`${moment().format('YYYY-MM-DD HH:mm:ss')} : start crolldjing`);
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
                const browser = await puppeteer_extra_1.default.launch({ headless: true });
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
                    let retry = 3;
                    if (!isLogin) {
                        while (retry > 0) {
                            try {
                                await this.instaLogin(page);
                                isLogin = true;
                                break;
                            }
                            catch (error) {
                                retry--;
                                console.error(`로그인 실패, 남은 횟수: ${retry}`, error);
                                if (retry === 0) {
                                    this.sendCrollingStstus('로그인 실패: 최대 재시도 횟수를 초과했습니다.');
                                    continue;
                                }
                            }
                        }
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
                        isLogin = true;
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
            timeout: 60000,
        });
        const isLoggedIn = await page.evaluate(() => {
            return !!document.querySelector('nav img[alt*="프로필"]');
        });
        if (isLoggedIn) {
            console.log('Already logged in. Navigating to profile page...');
            return;
        }
        console.log('Not logged in. Proceeding with login process...');
        await page.waitForSelector('input[name="username"]', { visible: true });
        await page.waitForSelector('input[name="password"]', { visible: true });
        const INSTAGRAM_USERNAME = 'ggh0223';
        const INSTAGRAM_PASSWORD = 'Rlarbgus1!';
        await page.type('input[name="username"]', INSTAGRAM_USERNAME, {
            delay: 50,
        });
        await page.type('input[name="password"]', INSTAGRAM_PASSWORD, {
            delay: 50,
        });
        await page.click('button[type="submit"]');
        try {
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 60000,
            });
        }
        catch (error) {
            console.warn('Navigation timeout. Proceeding anyway...');
        }
        const saveInfoButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find((button) => button.textContent.includes('정보 저장'));
        });
        if (saveInfoButton) {
            console.log('Save login info button found. Clicking...');
            await saveInfoButton.click();
            try {
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
            }
            catch (error) {
                console.warn('Navigation timeout after saving login info.');
            }
        }
        else {
            console.log('Save login info button not found. Skipping...');
        }
        console.log('Login completed!');
    }
    async crollingInsta(page, target) {
        try {
            const profileUrl = `https://www.instagram.com/${target}`;
            await page.goto(profileUrl, {
                waitUntil: 'networkidle2',
            });
            const data = await page.evaluate((target) => {
                const images = Array.from(document.querySelectorAll('img'));
                return images.map((img) => {
                    return {
                        src: img.src,
                        alt: img.alt,
                    };
                });
            });
            console.log('원본 이미지 리스트 :', data);
            const regex1 = /^Photo by 이가네흑돼지 on [A-Za-z]+ \d{2}, \d{4}\. 간판/;
            const filteringData = data.filter((img) => img.src.startsWith('https://scontent-ssn1-1.cdninstagram.com') &&
                (regex1.test(img.alt) || img.alt.includes('더식탁_유타워한식뷔페')));
            console.log('필터링 이미지 리스트 :', filteringData);
            if (Array.isArray(filteringData) && filteringData.length < 2) {
                throw new Error('이미지를 가져오는데 실패했습니다.');
            }
            return { data: filteringData[0].src, error: null };
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
            console.log('Image URLs:', imageUrl);
            return { data: imageUrl, error: null };
        }
        catch (error) {
            console.log(error);
            return { data: null, error: error };
        }
    }
    async checkCrolling(source) {
        const browser = await puppeteer_extra_1.default.launch({ headless: true });
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
        const { data: existingData, error: existingError } = await this.supabase
            .from('menus')
            .select('id')
            .like('imageUrl', `%${url}%`);
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
        try {
            axios_1.default
                .post('https://whattoeattoday-server.vercel.app/api/menu/check/crolling', {
                status: status,
            })
                .catch((error) => {
                console.log('errer');
            });
        }
        catch (error) {
            console.log('error');
        }
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], MenuService);
//# sourceMappingURL=menu.service.js.map