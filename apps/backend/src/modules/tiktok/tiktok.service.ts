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
    
    try {
      this.tiktokConnection = new WebcastPushConnection(this.config.username);

      await this.tiktokConnection.connect();
      console.log(`Connected to TikTok Live for user: ${this.config.username}`);
      this.isConnecting = false;
    } catch (err: any) {
      console.error('Failed to connect to TikTok Live', err);
      this.isConnecting = false;
      
      // Manejar errores específicos
      if (err.message && err.message.includes('user_not_found')) {
        throw new Error(`TikTok user "${this.config.username}" not found. Please check the username and ensure the user exists and is currently live streaming.`);
      } else if (err.message && err.message.includes('room_id')) {
        throw new Error(`Unable to find live stream for user "${this.config.username}". Make sure the user is currently live streaming.`);
      } else {
        throw new Error(`Failed to connect to TikTok: ${err.message}`);
      }
    }

    this.tiktokConnection.on('chat', async (data: any) => {
      console.log(`Chat: ${data.comment}`);
      if (data.comment === this.config.spinCommand) {
        console.log(`🎯 Spin command detected: ${data.comment} from ${data.uniqueId}`);
        await this.triggerSpin(data.uniqueId, 'chat');
      }
    });

    this.tiktokConnection.on('gift', async (data: any) => {
      console.log(`Gift: ${data.giftName}`);
      if (data.giftName === this.config.giftTrigger) {
        console.log(`🎁 Gift trigger detected: ${data.giftName} from ${data.uniqueId}`);
        await this.triggerSpin(data.uniqueId, 'gift');
      }
    });
  }

  private async triggerSpin(userId: string, triggerType: 'chat' | 'gift') {
    try {
      // Usar la Ruleta de Premios (ID 20) si existe y tiene segmentos
      let wheel = await this.wheelService.getWheel(20);
      
      // Si no existe o no tiene segmentos, usar cualquier ruleta disponible
      if (!wheel || !wheel.segments || wheel.segments.length === 0) {
        const wheels = await this.wheelService.getAllWheels();
        wheel = wheels.find(w => w.segments && w.segments.length > 0);
      }
      
      if (wheel && wheel.segments && wheel.segments.length > 0) {
        const result = this.wheelService.spinWheel(wheel.segments);
        await this.wheelService.recordSpin(wheel.id, result, userId, triggerType);
        
        // Emitir evento completo por WebSocket
        this.eventsGateway.emitSpinResult({ 
          wheelId: wheel.id, 
          result, 
          wheelName: wheel.name,
          timestamp: new Date(),
          source: 'tiktok',
          userId: userId,
          triggerType: triggerType // 'chat' o 'gift'
        });
        
        console.log(`Spin result from TikTok: ${result} (Wheel: ${wheel.name}, User: ${userId}, Trigger: ${triggerType})`);
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
      try {
        await this.initializeTikTokConnection();
        return { message: 'Reconnecting to TikTok...' };
      } catch (error) {
        console.error('Error during reconnection:', error);
        return { message: `Error connecting to TikTok: ${error.message}. Please check the username and try again.` };
      }
    } else {
      return { message: 'No valid username configured. Please set a TikTok username in the admin panel.' };
    }
  }
}