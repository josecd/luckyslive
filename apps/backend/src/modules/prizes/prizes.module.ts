import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrizesController } from './prizes.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [PrizesService, PrismaService],
  controllers: [PrizesController],
  exports: [PrizesService],
})
export class PrizesModule {}