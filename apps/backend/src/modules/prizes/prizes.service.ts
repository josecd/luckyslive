import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PrizesService {
  constructor(private prisma: PrismaService) {}

  async getPrizes() {
    return this.prisma.prize.findMany();
  }

  async createPrize(name: string, value: string) {
    return this.prisma.prize.create({
      data: { name, value },
    });
  }
}