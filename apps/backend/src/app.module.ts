import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { WheelModule } from './modules/wheel/wheel.module';
import { EventsModule } from './modules/events/events.module';
import { TikTokModule } from './modules/tiktok/tiktok.module';
import { PrizesModule } from './modules/prizes/prizes.module';

@Module({
  imports: [
    AuthModule,
    WheelModule,
    EventsModule,
    TikTokModule,
    PrizesModule,
  ],
})
export class AppModule {}