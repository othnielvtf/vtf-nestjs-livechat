# NestJS LiveChat Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

A scalable and maintainable WebSocket-based live chat backend built with NestJS. This application provides real-time communication capabilities with features like room management, private messaging, typing indicators, and more. Looking for the frontend? Can clone and set it up here https://github.com/othnielvtf/vtf-nestjs-frontend

## Features

- **Real-time Communication**: Instant message delivery using WebSockets (Socket.IO)
- **Room Management**: Create, join, and leave chat rooms
- **User Presence**: Track online users and their activities
- **Typing Indicators**: Show when users are typing
- **Message History**: Access previous messages when joining a room
- **Scalable Architecture**: Modular design for easy extension

## Project Structure

```
src/
├── chat/                  # Chat module
│   ├── dto/               # Data Transfer Objects
│   │   ├── create-message.dto.ts
│   │   └── join-room.dto.ts
│   ├── entities/          # Entity definitions
│   │   ├── message.entity.ts
│   │   └── room.entity.ts
│   ├── chat.gateway.ts    # WebSocket gateway
│   ├── chat.service.ts    # Business logic
│   └── chat.module.ts     # Module definition
├── users/                 # Users module
│   └── entities/          # User entity definitions
│       └── user.entity.ts
├── shared/                # Shared resources
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication guards
│   └── interceptors/      # Request/response interceptors
├── app.module.ts          # Main application module
├── app.controller.ts      # Main HTTP controller
├── app.service.ts         # Main service
└── main.ts                # Application entry point
```

## WebSocket Events

### Client to Server Events

- `join_room`: Join a chat room
- `leave_room`: Leave a chat room
- `send_message`: Send a message to a room
- `typing`: Indicate user is typing
- `get_active_rooms`: Get list of active rooms
- `get_room_users`: Get users in a specific room

### Server to Client Events

- `user_joined`: Notification when a user joins a room
- `user_left`: Notification when a user leaves a room
- `new_message`: New message received in a room
- `user_typing`: Notification when a user is typing
- `room_history`: History of messages in a room

## Installation

```bash
$ npm install
```

## Running the App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment to Railway

### Deploy via Railway Dashboard

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Select "Deploy from GitHub"
4. Connect your GitHub account and select this repository
5. Railway will automatically detect the NestJS application and deploy it using the configuration files


#### Files Excluded from Deployment (`.railwayignore`)

The following files and directories are excluded from deployment:
- `.git`
- `node_modules`
- Various log and environment files

### Environment Variables

The application uses the following environment variables that you should configure in Railway:

- `PORT`: The port on which the application will run (Railway sets this automatically)
- `CORS_ORIGIN`: (Optional) Set this to your frontend URL to restrict CORS access
- Add any database connection strings or other environment-specific variables as needed

### Accessing Your Deployed Application

Once deployed, Railway will provide you with a URL to access your application. You can use this URL as the WebSocket server URL in your frontend application.

### Monitoring and Logs

Railway provides built-in monitoring and logging capabilities:

1. Navigate to your project in the Railway dashboard
2. Click on the "Deployments" tab to view deployment history
3. Click on a specific deployment to view logs and metrics
4. Use the "Metrics" tab to monitor resource usage

## Client Integration Example

```javascript
// Using Socket.IO client
const socket = io('http://localhost:3000');

// Join a room
socket.emit('join_room', { roomId: 'room1', username: 'John' });

// Send a message
socket.emit('send_message', { roomId: 'room1', content: 'Hello everyone!' });

// Listen for new messages
socket.on('new_message', (message) => {
  console.log(`${message.username}: ${message.content}`);
});

// Indicate typing status
socket.emit('typing', { roomId: 'room1', isTyping: true });

// Listen for typing indicators
socket.on('user_typing', ({ username, isTyping }) => {
  console.log(`${username} is ${isTyping ? 'typing...' : 'not typing'}`);
});

// Leave a room
socket.emit('leave_room', { roomId: 'room1' });
```

## Future Enhancements

- User authentication and authorization
- Persistent message storage with database integration
- Encryption of messages
- File sharing capabilities
- Read receipts
- Message reactions
- Direct messaging between users

## License

This project is [MIT licensed](LICENSE).
