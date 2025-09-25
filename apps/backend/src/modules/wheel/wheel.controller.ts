import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { WheelService } from './wheel.service';
import { EventsGateway } from '../events/events.gateway';

@Controller('wheels')
export class WheelController {
  constructor(
    private readonly wheelService: WheelService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post()
  async create(@Body() body: { name: string; description?: string }) {
    return this.wheelService.createWheel(body.name, body.description);
  }

  @Get()
  async findAll() {
    return this.wheelService.getAllWheels();
  }

  @Post(':id/segments')
  async addSegment(
    @Param('id') id: string,
    @Body() body: { label: string; color: string; probability: number },
  ) {
    return this.wheelService.addSegment(+id, body.label, body.color, body.probability);
  }

  @Get(':id/spins')
  async getSpins(@Param('id') id: string) {
    return this.wheelService.getWheelSpins(+id);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.wheelService.getWheel(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name: string; description?: string }) {
    return this.wheelService.updateWheel(+id, body.name, body.description);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.wheelService.deleteWheel(+id);
  }

  @Post(':id/spin')
  async spin(@Param('id') id: string) {
    const wheel = await this.wheelService.getWheel(+id);
    if (!wheel) throw new Error('Wheel not found');
    const result = this.wheelService.spinWheel(wheel.segments);
    await this.wheelService.recordSpin(+id, result);
    
    // Emitir evento por WebSocket
    this.eventsGateway.emitSpinResult({ 
      wheelId: +id, 
      result, 
      wheelName: wheel.name,
      timestamp: new Date(),
      source: 'manual'
    });
    
    return { result };
  }

  @Post('trigger-spin')
  async triggerSpin(@Body() body: { userId?: string; triggerType?: string }) {
    // Usar la Ruleta de Premios (ID 20) si existe y tiene segmentos
    let wheel = await this.wheelService.getWheel(20);
    
    // Si no existe o no tiene segmentos, usar cualquier ruleta disponible
    if (!wheel || !wheel.segments || wheel.segments.length === 0) {
      const wheels = await this.wheelService.getAllWheels();
      wheel = wheels.find(w => w.segments && w.segments.length > 0);
    }
    
    if (!wheel) throw new Error('No wheel available');
    const result = this.wheelService.spinWheel(wheel.segments);
    await this.wheelService.recordSpin(wheel.id, result, body.userId, body.triggerType);
    
    // Emitir evento por WebSocket con información del usuario
    this.eventsGateway.emitSpinResult({ 
      wheelId: wheel.id, 
      result, 
      wheelName: wheel.name,
      timestamp: new Date(),
      source: 'tiktok',
      userId: body.userId,
      triggerType: body.triggerType
    });
    
    return { result };
  }

  @Put(':wheelId/segments/:segmentId')
  async updateSegment(
    @Param('wheelId') wheelId: string,
    @Param('segmentId') segmentId: string,
    @Body() body: { label?: string; color?: string; probability?: number },
  ) {
    return this.wheelService.updateSegment(+segmentId, body.label, body.color, body.probability);
  }

  @Delete(':wheelId/segments/:segmentId')
  async deleteSegment(
    @Param('wheelId') wheelId: string,
    @Param('segmentId') segmentId: string,
  ) {
    return this.wheelService.deleteSegment(+segmentId);
  }
}