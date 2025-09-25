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
      timestamp: new Date() 
    });
    
    return { result };
  }

  @Post('trigger-spin')
  async triggerSpin() {
    const wheel = await this.wheelService.getWheel(1);
    if (!wheel) throw new Error('Wheel not found');
    const result = this.wheelService.spinWheel(wheel.segments);
    await this.wheelService.recordSpin(1, result);
    
    // Emitir evento por WebSocket
    this.eventsGateway.emitSpinResult({ 
      wheelId: 1, 
      result, 
      wheelName: wheel.name,
      timestamp: new Date() 
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