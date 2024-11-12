import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import entities from 'src/modules/common/database/database.entity';
import { createClient } from '@supabase/supabase-js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'SUPABASE',
      useFactory: (configService: ConfigService) => {
        return createClient(
          configService.get<string>('SUPABASE_URL'),
          configService.get<string>('SUPABASE_KEY'),
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE'],
})
export class DatabaseModule {}
