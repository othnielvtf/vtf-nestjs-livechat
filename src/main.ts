import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  const corsOrigins = ['http://localhost:3000', 'http://localhost:8080'];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Set global prefix (optional)
  app.setGlobalPrefix('api');
  
  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`CORS enabled for: ${corsOrigins.join(', ')}`);
  logger.log('CORS headers: Content-Type, Authorization');
}
bootstrap();
