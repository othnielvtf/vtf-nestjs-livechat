import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsAuthGuard } from '../shared/guards/ws-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      // Check for auth credentials
      const userId = client.handshake.auth?.userId;
      const username = client.handshake.auth?.username;
      
      if (!userId || !username) {
        // For public channels, we might allow anonymous connections
        // but we'll log it for tracking purposes
        this.logger.warn(`Anonymous connection: ${client.id}`);
        return;
      }
      
      // Store user info in socket data for later use
      client.data.userId = userId;
      client.data.username = username;
      
      this.logger.log(`Authenticated user connected: ${username} (${userId})`);
    } catch (error) {
      this.logger.error(`Error during connection: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    try {
      // Get username if available
      const username = client.data?.username || await this.chatService.getUsernameByClientId(client.id);
      if (username) {
        this.logger.log(`User disconnected: ${username}`);
      }
      
      // Remove from all rooms
      this.chatService.removeUserFromAllRooms(client.id);
    } catch (error) {
      this.logger.error(`Error during disconnection: ${error.message}`);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinRoomDto: JoinRoomDto,
  ) {
    try {
      const { roomId, auth, channel_data } = joinRoomDto;
      const username = client.data.username || joinRoomDto.username;
      
      // Check if this is a private or presence channel
      const isPrivateChannel = roomId.startsWith('private-');
      const isPresenceChannel = roomId.startsWith('presence-');
      
      // For private and presence channels, verify auth data
      if ((isPrivateChannel || isPresenceChannel) && !auth) {
        this.logger.warn(`Authentication required for channel: ${roomId}`);
        throw new WsException('Authentication required for private or presence channels');
      }
      
      // For presence channels, verify channel_data
      if (isPresenceChannel && !channel_data) {
        this.logger.warn(`Channel data required for presence channel: ${roomId}`);
        throw new WsException('Channel data required for presence channels');
      }
      
      // Log the authentication attempt
      if (isPrivateChannel || isPresenceChannel) {
        this.logger.log(`Authenticated join for channel: ${roomId}`);
      }
      
      // Add user to room
      await this.chatService.joinRoom(client.id, roomId, username);
      
      // Join the Socket.IO room
      client.join(roomId);
      
      // Notify room about new user
      this.server.to(roomId).emit('user_joined', {
        username,
        timestamp: new Date(),
        roomId,
      });
      
      // Send room history to the user
      const roomHistory = await this.chatService.getRoomMessages(roomId);
      client.emit('room_history', roomHistory);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: { roomId: string },
  ) {
    const username = await this.chatService.getUsernameByClientId(client.id);
    
    // Remove user from room
    await this.chatService.leaveRoom(client.id, roomId);
    
    // Leave the Socket.IO room
    client.leave(roomId);
    
    // Notify room about user leaving
    this.server.to(roomId).emit('user_left', {
      username,
      timestamp: new Date(),
      roomId,
    });
    
    return { success: true };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const { roomId, content } = createMessageDto;
    
    // Get username from client ID
    const username = await this.chatService.getUsernameByClientId(client.id);
    
    if (!username) {
      return { success: false, message: 'You must join a room first' };
    }
    
    // Save message
    const message = await this.chatService.createMessage({
      ...createMessageDto,
      username,
      clientId: client.id,
    });
    
    // Broadcast message to room
    this.server.to(roomId).emit('new_message', message);
    
    return { success: true, message };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId, isTyping }: { roomId: string; isTyping: boolean },
  ) {
    const username = await this.chatService.getUsernameByClientId(client.id);
    
    // Broadcast typing status to room (except sender)
    client.to(roomId).emit('user_typing', {
      username,
      isTyping,
      roomId,
    });
    
    return { success: true };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('get_active_rooms')
  async handleGetActiveRooms() {
    const rooms = await this.chatService.getActiveRooms();
    return { success: true, rooms };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('get_room_users')
  async handleGetRoomUsers(@MessageBody() { roomId }: { roomId: string }) {
    const users = await this.chatService.getRoomUsers(roomId);
    return { success: true, users };
  }
}
