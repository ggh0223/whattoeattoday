import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as puppeteer from 'puppeteer';
import * as moment from 'moment';

@Injectable()
export class MenuService {
  constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) {}

  SOURCES = [
    'https://www.instagram.com/iganepork',
    'https://www.instagram.com/the.siktak',
    'https://pf.kakao.com/_xgUVZn/posts',
  ];
  @Cron('0 */5 10,11 * * 1-5')
  async handleCrolling() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if ((hours === 10 && minutes >= 30) || (hours === 11 && minutes <= 30)) {
      // Your logic to fetch data
      console.log('Fetching data...');
      const crollingTarget = [];
      // check data existing
      for (let i = 0; i < this.SOURCES.length; i++) {
        const source = this.SOURCES[i];
        const data = await this.findBySource(source);
        if (data && Array.isArray(data) && data.length > 0) {
          continue;
        } else {
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
              if (data.length < 2) {
                console.log(data);
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
          } else {
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
      // 페이지 내의 console.log를 Node.js 콘솔에 출력하도록 설정
      page.on('console', (msg) => {
        for (let i = 0; i < msg.args().length; ++i) {
          console.log(`${i}: ${msg.args()[i]}`);
        }
      });

      await page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2',
      });
      // username 입력 필드가 로드될 때까지 대기
      await page.waitForSelector('input[name="username"]', { visible: true });
      await page.waitForSelector('input[name="password"]', { visible: true });

      // 로그인 정보 입력
      const INSTAGRAM_USERNAME = 'ggh0223';
      const INSTAGRAM_PASSWORD = 'rlarbgus1!';

      await page.type('input[name="username"]', INSTAGRAM_USERNAME, {
        delay: 100,
      });
      await page.type('input[name="password"]', INSTAGRAM_PASSWORD, {
        delay: 100,
      });

      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // "로그인 정보를 저장하시겠어요?" 버튼의 선택자
      const saveInfoButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find((button) =>
          button.textContent?.includes('정보 저장'),
        );
      });
      console.log('saveInfoButton', saveInfoButton);
      if (saveInfoButton) {
        console.log('Save login info button found. Clicking...');
        await saveInfoButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } else {
        console.log('Save login info button not found. Skipping...');
      }

      // 로그인 후 크롤링할 페이지 열기
      const profileUrl = `https://www.instagram.com/${target}`;
      await page.goto(profileUrl, {
        waitUntil: 'domcontentloaded',
      });

      // 게시글 이미지 URL 가져오기
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
    } catch (error) {
      console.log(error);
      return { data: null, error: error };
    }
  }

  async crollingKakao(browser) {
    const page = await browser.newPage();

    await page.goto('https://pf.kakao.com/_xgUVZn/posts', {
      waitUntil: 'networkidle2',
      // timeout: 60000,
    });

    const imageUrl = await page.evaluate(() => {
      // area_card 클래스를 가진 요소를 선택
      const areaCard = document.querySelector('.area_card .wrap_fit_thumb');
      if (areaCard) {
        // style 속성에서 background-image URL 추출
        const style = areaCard.getAttribute('style');
        const urlMatch = style.match(/url\("(.+?)"\)/);
        return urlMatch ? urlMatch[1] : null; // URL이 있으면 반환
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
}
