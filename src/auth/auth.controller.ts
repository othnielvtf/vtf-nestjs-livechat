import { Controller, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

interface ChannelAuthDto {
  socket_id: string;
  channel_name: string;
  user_id?: string;
  user_info?: Record<string, any>;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('channel')
  async authenticateChannel(@Body() authDto: ChannelAuthDto) {
    try {
      const { socket_id, channel_name, user_id, user_info } = authDto;
      
      // Validate required fields
      if (!socket_id || !channel_name) {
        throw new UnauthorizedException('Socket ID and channel name are required');
      }

      // Check if the channel requires authentication
      if (!channel_name.startsWith('private-') && !channel_name.startsWith('presence-')) {
        throw new UnauthorizedException('Only private or presence channels require authentication');
      }

      // For presence channels, user data is required
      const isPresenceChannel = channel_name.startsWith('presence-');
      
      if (isPresenceChannel && (!user_id || !user_info)) {
        throw new UnauthorizedException('User ID and user info are required for presence channels');
      }

      // Check if the user has permission to access the channel
      // In a real app, you would get the user ID from the session/token
      if (user_id) {
        const hasAccess = await this.authService.canAccessChannel(user_id, channel_name);
        if (!hasAccess) {
          throw new UnauthorizedException('Access to channel denied');
        }
      }

      // Prepare user data for presence channels
      let userData: Record<string, any> | undefined;
      
      if (isPresenceChannel && user_id && user_info) {
        userData = {
          user_id,
          user_info,
        };
      }

      // Generate authentication signature
      const authResponse = this.authService.authenticateChannel(
        socket_id,
        channel_name,
        userData,
      );

      return authResponse;
    } catch (error) {
      this.logger.error(`Channel authentication failed: ${error.message}`, error.stack);
      throw new UnauthorizedException(error.message);
    }
  }
}
