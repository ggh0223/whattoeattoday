import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, //우리 어플리케이션의 어디서나 config 모듈에 접근할 수 있다는 것
            //process.env.NODE_ENV === 'dev'일때 .env.dev파일을 사용하겠다는 뜻
            envFilePath: '.env',
            // ignoreEnvFile: process.env.NODE_ENV === 'prod',
            //서버에 deply 할 때 환경변수 파일을 사용하지 않는다는 것
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppConfigModule {}
