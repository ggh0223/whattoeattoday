import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as puppeteer from 'puppeteer';
import * as moment from 'moment';
import { error } from 'console';

@Injectable()
export class MenuService {
  constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) {}

  SOURCES = [
    'https://www.instagram.com/iganepork',
    'https://www.instagram.com/the.siktak',
    'https://pf.kakao.com/_xgUVZn/posts',
  ];
  @Cron('0 */5 10,11 * * 1-5')
  //   @Cron('0 */1 * * * 1-5')
  async handleCrolling() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (
      true ||
      (hours === 10 && minutes >= 30) ||
      (hours === 11 && minutes <= 30)
    ) {
      // Your logic to fetch data
      console.log('Fetching data...');
      this.sendCrollingStstus(
        `${moment().format('YYYY-MM-DD HH:mm:ss')} : start crolling`,
      );
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
      this.sendCrollingStstus(crollingTarget);

      if (crollingTarget.length > 0) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
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
          } else {
            restaraunt = null;
            title = '동천한식뷔페';
            type = 'Kakao';
          }
          console.log('login status', isLogin);
          let retry = 3; // 재시도 횟수
          if (!isLogin) {
            while (retry > 0) {
              try {
                await this.instaLogin(page); // 로그인 시도
                isLogin = true; // 성공하면 isLogin 업데이트
                break; // 성공 시 루프 종료
              } catch (error) {
                retry--; // 실패 시 재시도 횟수 감소
                console.error(`로그인 실패, 남은 횟수: ${retry}`, error);
                if (retry === 0) {
                  this.sendCrollingStstus(
                    '로그인 실패: 최대 재시도 횟수를 초과했습니다.',
                  );
                  continue;
                }
              }
            }
          }
          this.sendCrollingStstus(restaraunt);

          const { data, error } = await this[`crolling${type}`](
            page,
            restaraunt,
          );
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
            isLogin = true; // 성공하면 isLogin 업데이트
          } catch (error) {
            console.log('error in save menu : ', error);
            this.sendCrollingStstus(error);
            continue;
          }
        }
        this.sendCrollingStstus(
          `${moment().format('YYYY-MM-DD HH:mm:ss')} : finish crolling`,
        );
        await browser.close();
      } else {
        console.log('데이터 수집 완료');
      }
    }
  }

  async instaLogin(page) {
    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'domcontentloaded',
    });

    // 이미 로그인 상태인지 확인
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('nav img[alt*="프로필"]');
    });

    if (isLoggedIn) {
      console.log('Already logged in. Navigating to profile page...');
      return; // 로그인 절차를 건너뜀
    }

    console.log('Not logged in. Proceeding with login process...');

    // username 입력 필드가 로드될 때까지 대기
    await page.waitForSelector('input[name="username"]', { visible: true });
    await page.waitForSelector('input[name="password"]', { visible: true });

    // 로그인 정보 입력
    const INSTAGRAM_USERNAME = 'ggh0223';
    const INSTAGRAM_PASSWORD = 'Rlarbgus1!';

    await page.type('input[name="username"]', INSTAGRAM_USERNAME, {
      delay: 50,
    });
    await page.type('input[name="password"]', INSTAGRAM_PASSWORD, {
      delay: 50,
    });

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    // 탐색 완료까지 대기
    try {
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 60000,
      });
    } catch (error) {
      console.warn('Navigation timeout. Proceeding anyway...');
    }

    // "로그인 정보를 저장하시겠어요?" 버튼의 선택자
    // "로그인 정보를 저장하시겠어요?" 버튼 대기 및 클릭
    const saveInfoButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((button) => button.textContent.includes('정보 저장'));
    });

    if (saveInfoButton) {
      console.log('Save login info button found. Clicking...');
      await saveInfoButton.click();
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } catch (error) {
        console.warn('Navigation timeout after saving login info.');
      }
    } else {
      console.log('Save login info button not found. Skipping...');
    }

    console.log('Login completed!');
  }

  async crollingInsta(page, target) {
    try {
      // 로그인 후 크롤링할 페이지 열기
      const profileUrl = `https://www.instagram.com/${target}`;
      await page.goto(profileUrl, {
        waitUntil: 'networkidle2',
      });

      // 게시글 이미지 URL 가져오기
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
      const filteringData = data.filter(
        (img) =>
          img.src.startsWith('https://scontent-ssn1-1.cdninstagram.com') &&
          (regex1.test(img.alt) || img.alt.includes('더식탁_유타워한식뷔페')),
      );
      console.log('필터링 이미지 리스트 :', filteringData);
      if (Array.isArray(filteringData) && filteringData.length < 2) {
        throw new Error('이미지를 가져오는데 실패했습니다.');
      }
      return { data: filteringData[0].src, error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: error };
    }
  }

  async crollingKakao(page) {
    try {
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

      console.log('Image URLs:', imageUrl);

      return { data: imageUrl, error: null };
    } catch (error) {
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
      axios
        .post(
          'https://whattoeattoday-server.vercel.app/api/menu/check/crolling',
          {
            status: status,
          },
        )
        .catch((error) => {
          console.log('errer');
        });
    } catch (error) {
      console.log('error');
    }
  }
}
