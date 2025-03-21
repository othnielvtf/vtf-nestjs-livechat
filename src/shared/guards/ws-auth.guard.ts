import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    
    try {
      // Check if the client has authentication data
      // This could be a token, user ID, or any other auth mechanism
      const userId = client.handshake.auth?.userId;
      
      if (!userId) {
        this.logger.warn('Unauthorized WebSocket connection attempt');
        throw new WsException('Unauthorized');
      }
      
      // Store user ID in socket data for later use
      client.data.userId = userId;
      
      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      return false;
    }
  }
}
