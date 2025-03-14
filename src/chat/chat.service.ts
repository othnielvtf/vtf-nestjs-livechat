import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  
  // In-memory storage (in a real app, you'd use a database)
  private messages: Message[] = [];
  private rooms: Map<string, Room> = new Map();
  private userRooms: Map<string, Set<string>> = new Map(); // clientId -> Set of roomIds
  private clientToUser: Map<string, User> = new Map(); // clientId -> User

  async createMessage(createMessageDto: CreateMessageDto & { username: string; clientId: string }): Promise<Message> {
    const { roomId, content, username, clientId } = createMessageDto;
    
    // Create message
    const message: Message = {
      id: Date.now().toString(),
      content,
      username,
      roomId,
      clientId,
      timestamp: new Date(),
    };
    
    // Save message
    this.messages.push(message);
    
    // Limit message history (optional)
    const roomMessages = this.messages.filter(m => m.roomId === roomId);
    if (roomMessages.length > 100) {
      // Keep only the last 100 messages per room
      const messagesToRemove = roomMessages.slice(0, roomMessages.length - 100);
      this.messages = this.messages.filter(m => !messagesToRemove.includes(m));
    }
    
    return message;
  }

  async joinRoom(clientId: string, roomId: string, username: string): Promise<void> {
    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        name: roomId, // You can customize room names
        users: new Set(),
        createdAt: new Date(),
      });
    }
    
    // Add user to room
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.add(clientId);
    }
    
    // Add room to user's rooms
    if (!this.userRooms.has(clientId)) {
      this.userRooms.set(clientId, new Set());
    }
    const userRooms = this.userRooms.get(clientId);
    if (userRooms) {
      userRooms.add(roomId);
    }
    
    // Store user info
    this.clientToUser.set(clientId, { id: clientId, username });
    
    this.logger.log(`User ${username} joined room ${roomId}`);
  }

  async leaveRoom(clientId: string, roomId: string): Promise<void> {
    // Remove user from room
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(clientId);
      
      // Remove room if empty
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    // Remove room from user's rooms
    const userRooms = this.userRooms.get(clientId);
    if (userRooms) {
      userRooms.delete(roomId);
      
      // Clean up if user has no rooms
      if (userRooms.size === 0) {
        this.userRooms.delete(clientId);
        this.clientToUser.delete(clientId);
      }
    }
  }

  async removeUserFromAllRooms(clientId: string): Promise<void> {
    const userRooms = this.userRooms.get(clientId);
    if (userRooms) {
      // Leave all rooms
      for (const roomId of userRooms) {
        await this.leaveRoom(clientId, roomId);
      }
    }
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return this.messages
      .filter(message => message.roomId === roomId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getUsernameByClientId(clientId: string): Promise<string | null> {
    const user = this.clientToUser.get(clientId);
    return user ? user.username : null;
  }

  async getActiveRooms(): Promise<{ id: string; name: string; userCount: number }[]> {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      userCount: room.users.size,
    }));
  }

  async getRoomUsers(roomId: string): Promise<{ username: string }[]> {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room.users)
      .map(clientId => {
        const user = this.clientToUser.get(clientId);
        return user ? { username: user.username } : null;
      })
      .filter((user): user is { username: string } => user !== null);
  }
}
