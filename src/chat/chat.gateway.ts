import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // You can add authentication logic here
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.chatService.removeUserFromAllRooms(client.id);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinRoomDto: JoinRoomDto,
  ) {
    const { roomId, username } = joinRoomDto;
    
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
  }

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

  @SubscribeMessage('get_active_rooms')
  async handleGetActiveRooms() {
    const rooms = await this.chatService.getActiveRooms();
    return { success: true, rooms };
  }

  @SubscribeMessage('get_room_users')
  async handleGetRoomUsers(@MessageBody() { roomId }: { roomId: string }) {
    const users = await this.chatService.getRoomUsers(roomId);
    return { success: true, users };
  }
}
