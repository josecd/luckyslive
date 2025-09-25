import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { WheelService } from '../wheel/wheel.service';

const { WebcastPushConnection } = require('tiktok-live-connector');

@Injectable()
export class TikTokService {
  private tiktokConnection: any;
  private config = {
    username: process.env.TIKTOK_USERNAME || 'testuser',
    spinCommand: '!spin',
    giftTrigger: 'Rose'
  };

  constructor(private eventsGateway: EventsGateway, private wheelService: WheelService) {
    // No conectar automáticamente - esperar configuración manual
    console.log('TikTok service initialized - waiting for manual connection');
  }

  private isConnecting = false;

  private async initializeTikTokConnection() {
    if (this.isConnecting) {
      console.log('Already connecting to TikTok, skipping...');
      return;
    }

    this.isConnecting = true;
    this.tiktokConnection = new WebcastPushConnection(this.config.username);

    this.tiktokConnection.connect().then(() => {
      console.log(`Connected to TikTok Live for user: ${this.config.username}`);
      this.isConnecting = false;
    }).catch((err: any) => {
      console.error('Failed to connect to TikTok Live', err);
      this.isConnecting = false;
    });

    this.tiktokConnection.on('chat', async (data: any) => {
      console.log(`Chat: ${data.comment}`);
      if (data.comment === this.config.spinCommand) {
        console.log(`🎯 Spin command detected: ${data.comment}`);
        await this.triggerSpin();
      }
    });

    this.tiktokConnection.on('gift', async (data: any) => {
      console.log(`Gift: ${data.giftName}`);
      if (data.giftName === this.config.giftTrigger) {
        console.log(`🎁 Gift trigger detected: ${data.giftName}`);
        await this.triggerSpin();
      }
    });
  }

  private async triggerSpin() {
    try {
      // Intentar primero con la ruleta ID 1, si no existe usar la primera disponible
      let wheel = await this.wheelService.getWheel(1);
      if (!wheel || wheel.segments.length === 0) {
        const wheels = await this.wheelService.getAllWheels();
        wheel = wheels.find(w => w.segments && w.segments.length > 0);
      }
      
      if (wheel && wheel.segments.length > 0) {
        const result = this.wheelService.spinWheel(wheel.segments);
        await this.wheelService.recordSpin(wheel.id, result);
        
        // Emitir evento completo por WebSocket
        this.eventsGateway.emitSpinResult({ 
          wheelId: wheel.id, 
          result, 
          wheelName: wheel.name,
          timestamp: new Date(),
          source: 'tiktok' // Indicar que viene de TikTok
        });
        
        console.log(`Spin result from TikTok: ${result} (Wheel: ${wheel.name})`);
      } else {
        console.log('No wheel found or wheel has no segments');
      }
    } catch (error) {
      console.error('Error triggering spin:', error);
    }
  }

  getConfig() {
    return this.config;
  }

  updateConfig(newConfig: { username: string; spinCommand: string; giftTrigger: string }) {
    this.config = { ...this.config, ...newConfig };
    console.log('TikTok config updated:', this.config);
    // No reconectar automáticamente - solo cuando se llame explícitamente desde admin
    return this.config;
  }

  async reconnect() {
    if (this.tiktokConnection) {
      this.tiktokConnection.disconnect();
    }

    // Solo conectar si hay un username válido configurado
    if (this.config.username && this.config.username !== 'testuser' && this.config.username.trim() !== '') {
      await this.initializeTikTokConnection();
      return { message: 'Reconnecting to TikTok...' };
    } else {
      return { message: 'No valid username configured. Please set a TikTok username in the admin panel.' };
    }
  }
}