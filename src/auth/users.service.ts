import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// In a real application, this would be stored in a database
const USERS = [
  {
    id: 'user123',
    username: 'john_doe',
    password: '$2b$10$MHNcgS7bMH0KqhGhmJ6GHeVDg7jUOZQSNAJNQlxB2SdSVu.99t.3O', // 'password123'
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: 'user456',
    username: 'user1',
    password: '$2b$10$MHNcgS7bMH0KqhGhmJ6GHeVDg7jUOZQSNAJNQlxB2SdSVu.99t.3O', // 'password123'
    name: 'User One',
    email: 'user1@example.com',
  },
];

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = USERS.find(user => user.id === id);
    if (!user) return null;
    
    // Remove password from the returned user object
    const { password, ...result } = user;
    return result;
  }
  
  async findByUsername(username: string): Promise<User | null> {
    return USERS.find(user => user.username === username) || null;
  }
  
  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    
    // Remove password from the returned user object
    const { password: _, ...result } = user;
    return result;
  }
  
  // For testing purposes, this method generates a hashed password
  async generateHash(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
