import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('spin')
  handleSpin(@MessageBody() data: any): void {
    // Emit spin event to all clients
    this.server.emit('spin', data);
  }

  emitSpinResult(result: any) {
    this.server.emit('spinResult', result);
  }
}