import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsOptional()
  username?: string;
  
  @IsString()
  @IsOptional()
  auth?: string;
  
  @IsString()
  @IsOptional()
  channel_data?: string;
}
