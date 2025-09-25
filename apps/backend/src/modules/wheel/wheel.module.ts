import { Module } from '@nestjs/common';
import { WheelService } from './wheel.service';
import { WheelController } from './wheel.controller';
import { PrismaService } from '../../prisma.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [WheelService, PrismaService],
  controllers: [WheelController],
  exports: [WheelService],
})
export class WheelModule {}