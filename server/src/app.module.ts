import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    TrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
