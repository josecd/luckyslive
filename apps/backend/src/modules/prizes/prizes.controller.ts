import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrizesService } from './prizes.service';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Get()
  async getAll() {
    return this.prizesService.getPrizes();
  }

  @Post()
  async create(@Body() body: { name: string; value: string }) {
    return this.prizesService.createPrize(body.name, body.value);
  }
}