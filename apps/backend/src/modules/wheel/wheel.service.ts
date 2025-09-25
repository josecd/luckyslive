import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class WheelService {
  constructor(private prisma: PrismaService) {}

  async createWheel(name: string, description?: string, userId: number = 1) {
    return this.prisma.wheel.create({
      data: { name, description, userId },
    });
  }

  async addSegment(wheelId: number, label: string, color: string, probability: number) {
    return this.prisma.segment.create({
      data: { wheelId, label, color, probability },
    });
  }

  async getAllWheels() {
    return this.prisma.wheel.findMany({
      include: { segments: true },
    });
  }

  async getWheel(id: number) {
    return this.prisma.wheel.findUnique({
      where: { id },
      include: { segments: true },
    });
  }

  async updateWheel(id: number, name: string, description?: string) {
    return this.prisma.wheel.update({
      where: { id },
      data: { name, description },
    });
  }

  async deleteWheel(id: number) {
    // Primero eliminar los segmentos asociados
    await this.prisma.segment.deleteMany({
      where: { wheelId: id },
    });
    
    // Luego eliminar los spins asociados
    await this.prisma.spin.deleteMany({
      where: { wheelId: id },
    });
    
    // Finalmente eliminar la ruleta
    return this.prisma.wheel.delete({
      where: { id },
    });
  }

  spinWheel(segments: { label: string; probability: number }[]): string {
    const totalProbability = segments.reduce((sum, seg) => sum + seg.probability, 0);
    let random = Math.random() * totalProbability;
    for (const segment of segments) {
      random -= segment.probability;
      if (random <= 0) {
        return segment.label;
      }
    }
    return segments[segments.length - 1].label;
  }

  async recordSpin(wheelId: number, result: string, userId?: string, triggerType?: string) {
    return this.prisma.spin.create({
      data: { 
        wheelId, 
        result,
        userId,
        triggerType
      },
    });
  }

  async getWheelSpins(wheelId: number) {
    return this.prisma.spin.findMany({
      where: { wheelId },
      orderBy: { timestamp: 'desc' },
      take: 10, // Limitar a los últimos 10 giros
    });
  }

  async updateSegment(segmentId: number, label?: string, color?: string, probability?: number) {
    return this.prisma.segment.update({
      where: { id: segmentId },
      data: {
        ...(label !== undefined && { label }),
        ...(color !== undefined && { color }),
        ...(probability !== undefined && { probability }),
      },
    });
  }

  async deleteSegment(segmentId: number) {
    return this.prisma.segment.delete({
      where: { id: segmentId },
    });
  }
}