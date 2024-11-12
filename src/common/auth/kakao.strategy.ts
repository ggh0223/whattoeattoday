// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Profile, Strategy } from 'passport-kakao';

// @Injectable()
// export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
//   constructor(private readonly configService: ConfigService) {
//     super({
//       // 여기 적어준 정보를 가지고 카카오 서버에 POST /oauth/token 요청이 날아갑니다.
//       clientID: configService.get('KAKAO_CLIENT_ID'),
//       clientSecret: configService.get('KAKAO_CLIENT_SECRET'),
//       callbackURL: `${configService.get('DOMAIN')}/api/auth/callback/kakao`,
//       scope: 'profile_nickname profile_image account_email',
//     });
//   }

//   async validate(
//     // POST /oauth/token 요청에 대한 응답이 담깁니다.
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile,
//     done: (error: any, user?: any, info?: any) => void,
//   ) {
//     try {
//       const { _json, username } = profile;
//       const user = {
//         social_id: _json.id,
//         name: username,
//         email: _json.kakao_account.email,
//         profile_image: _json.properties.profile_image,
//         thumbnail_image: _json.properties.thumbnail_image,
//       };
//       done(null, user);
//     } catch (error) {
//       done(error);
//     }
//   }
// }
