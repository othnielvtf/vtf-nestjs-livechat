import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly appKey: string;
  private readonly appSecret: string;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private usersService: UsersService
  ) {
    // In a real application, these would be loaded from environment variables
    this.appKey = this.configService.get<string>('PUSHER_APP_KEY', 'app-key');
    this.appSecret = this.configService.get<string>('PUSHER_APP_SECRET', 'app-secret');
  }
  
  /**
   * Authenticate a user and return a JWT token
   * @param username Username
   * @param password Password
   * @returns JWT token and user information
   */
  async login(username: string, password: string) {
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { username: user.username, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    };
  }
  
  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Authenticate a private channel
   * @param socketId The socket ID of the connection
   * @param channelName The channel name to authenticate
   * @param userData Optional user data for presence channels
   * @returns Authentication signature
   */
  authenticateChannel(
    socketId: string,
    channelName: string,
    userData?: Record<string, any>,
  ): { auth: string; channel_data?: string } {
    if (!socketId || !channelName) {
      throw new Error('Socket ID and channel name are required');
    }

    // Check if it's a private or presence channel
    const isPrivateChannel = channelName.startsWith('private-');
    const isPresenceChannel = channelName.startsWith('presence-');

    if (!isPrivateChannel && !isPresenceChannel) {
      throw new Error('Only private or presence channels require authentication');
    }

    // For presence channels, user data is required
    if (isPresenceChannel && !userData) {
      throw new Error('User data is required for presence channels');
    }

    let stringToSign = `${socketId}:${channelName}`;
    let channelData: string | undefined;

    // For presence channels, add user data
    if (isPresenceChannel && userData) {
      channelData = JSON.stringify(userData);
      stringToSign = `${stringToSign}:${channelData}`;
    }

    // Create HMAC signature
    const signature = createHmac('sha256', this.appSecret)
      .update(stringToSign)
      .digest('hex');

    // Format auth string (appKey:signature)
    const auth = `${this.appKey}:${signature}`;

    return channelData ? { auth, channel_data: channelData } : { auth };
  }

  /**
   * Verify if a user has permission to access a channel
   * This is where you would implement your authorization logic
   */
  async canAccessChannel(
    userId: string,
    channelName: string,
  ): Promise<boolean> {
    // Example implementation - customize based on your requirements
    this.logger.log(`Checking access for user ${userId} to channel ${channelName}`);
    
    // First, check if the user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn(`User ${userId} not found`);
      return false;
    }
    
    // For private channels starting with 'private-user-'
    if (channelName.startsWith('private-user-')) {
      const targetUserId = channelName.replace('private-user-', '');
      return userId === targetUserId;
    }
    
    // For private room channels
    if (channelName.startsWith('private-room-')) {
      const roomId = channelName.replace('private-room-', '');
      // Check if user is a member of the room
      // This would typically involve a database check
      return true; // Replace with actual logic
    }
    
    // For presence channels
    if (channelName.startsWith('presence-')) {
      // Similar logic to private channels
      return true; // Replace with actual logic
    }
    
    // For testing purposes, allow access to all private channels
    if (channelName.startsWith('private-')) {
      this.logger.log(`Allowing access to test channel: ${channelName}`);
      return true;
    }
    
    return false;
  }
}
