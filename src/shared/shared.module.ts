import { Module } from '@nestjs/common';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WsAuthGuard],
  exports: [WsAuthGuard],
})
export class SharedModule {}
