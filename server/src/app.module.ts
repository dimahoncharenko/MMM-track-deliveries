import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';

import { config } from './config/config';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '..', '.env'),
      isGlobal: true,
      load: [config],
    }),
    HttpModule.register({
      global: true,
    }),
    TrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
