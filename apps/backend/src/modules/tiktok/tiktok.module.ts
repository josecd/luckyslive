import { Module } from '@nestjs/common';
import { TikTokService } from './tiktok.service';
import { TikTokController } from './tiktok.controller';
import { EventsModule } from '../events/events.module';
import { WheelModule } from '../wheel/wheel.module';

@Module({
  imports: [EventsModule, WheelModule],
  controllers: [TikTokController],
  providers: [TikTokService],
  exports: [TikTokService],
})
export class TikTokModule {}