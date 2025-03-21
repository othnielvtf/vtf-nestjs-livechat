import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    try {
      // Check for JWT token in handshake auth
      const token = client.handshake.auth?.token;
      const userId = client.handshake.auth?.userId;
      
      // If we have a token, verify it
      if (token) {
        try {
          const payload = await this.authService.verifyToken(token);
          // Store user info from token in socket data
          client.data.userId = payload.sub;
          client.data.username = payload.username;
          this.logger.log(`Authenticated socket connection via JWT: ${payload.username} (${payload.sub})`);
          return true;
        } catch (error) {
          this.logger.warn(`Invalid JWT token: ${error.message}`);
          throw new WsException('Invalid authentication token');
        }
      }
      
      // Fallback to userId-based auth for backward compatibility
      if (userId) {
        // Store user ID in socket data for later use
        client.data.userId = userId;
        this.logger.log(`Authenticated socket connection via userId: ${userId}`);
        return true;
      }
      
      // For public channels or endpoints that don't require auth
      const data = context.switchToWs().getData();
      if (data && data.roomId && !data.roomId.startsWith('private-') && !data.roomId.startsWith('presence-')) {
        this.logger.log(`Allowing public channel access: ${data.roomId}`);
        return true;
      }
      
      this.logger.warn('Unauthorized WebSocket connection attempt');
      throw new WsException('Unauthorized');
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      return false;
    }
  }
}
