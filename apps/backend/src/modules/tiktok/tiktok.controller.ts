import { Controller, Get, Post, Body } from '@nestjs/common';
import { TikTokService } from './tiktok.service';

@Controller('tiktok')
export class TikTokController {
  constructor(private readonly tikTokService: TikTokService) {}

  @Get('config')
  getConfig() {
    return this.tikTokService.getConfig();
  }

  @Post('config')
  updateConfig(@Body() config: { username: string; spinCommand: string; giftTrigger: string }) {
    return this.tikTokService.updateConfig(config);
  }

  @Post('reconnect')
  reconnect() {
    return this.tikTokService.reconnect();
  }
}