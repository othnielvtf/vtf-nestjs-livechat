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
- **Authentication**: Secure private and presence channels with Pusher-compatible authentication

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── auth.controller.ts # Authentication controller
│   ├── auth.service.ts    # Authentication service
│   └── auth.module.ts     # Module definition
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
├── config/                # Configuration module
│   └── config.module.ts   # Configuration settings
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

scripts/
├── generate-keys.js       # Script to generate auth keys
└── serve-example.js       # Script to serve example client

examples/
└── client-auth-example.html # Example client with authentication
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

Use Node.js 22.22.3+, 24.15.0+, or 26+ (see `engines` in `package.json`).
These minimums come from the development toolchain. The application runtime
remains on NestJS 11. The CLI uses version 12, while the project's generators
stay on version 11 for compatibility with TypeScript 5.
The pnpm package extension gives those generators Chokidar 4, keeping their
watcher separate from the CLI's Chokidar 5.

```bash
$ npm install
```

### Dependency security

The NestJS runtime and testing packages stay on version 11, with a minimum of
11.2.8 to include the patched HTTP routing dependency. Nest's Express adapter
still pins Multer 2.4.0, so a scoped override selects Multer 2.5.x or later in
the 2.x line to fix
[GHSA-q7qp-rjg7-q26m](https://github.com/advisories/GHSA-q7qp-rjg7-q26m).
Jest 30 and ESLint 10 use the modern glob APIs, so version-scoped overrides
also select `glob` 14.0.3+ and `minimatch` 11.0.4+ to address
[GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) and
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
These overrides target the modern major versions used by this toolchain;
older consumers with different APIs must be migrated before overriding them.
Keep the npm overrides in `package.json` and the pnpm overrides in
`pnpm-workspace.yaml` aligned until their parent packages include the fixes.

Use `npm audit --omit=dev` to check production dependencies and `npm audit` for
the complete tree. As of November 3, 2026, both production audits are clean;
the npm development audit reports six low-severity entries, all tracing to
Jest's `deepmerge` 4.3.1 dependency
([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)).
There is no patched upstream release. This remains an open development-only
risk: Jest uses it to merge test configuration, and it is not installed in a
production-only install. Keep test configuration trusted and recheck when
Jest or deepmerge releases an update. Avoid `npm audit fix --force`, which
currently proposes downgrading Jest and ts-jest to version 25.

On npm 12, blocked install-script warnings are separate from audit findings.
Use `npm install-scripts ls` to review them. SWC and webpack build tools have
been removed because this project uses the default TypeScript compiler.
The optional native watcher has a prebuilt binary on supported platforms;
verify watch mode if a native fallback build is needed.

When refreshing either lockfile, validate with `npm run build`,
`npm test -- --runInBand`, `npm run test:e2e -- --runInBand`, and
`npm run test:cov -- --runInBand`, plus a development-server restart check.

## Configuration

The application uses environment variables for configuration. Copy the example environment file and update it with your settings:

```bash
$ cp .env.example .env
```

### Generate Authentication Keys

To generate secure keys for the authentication system, run:

```bash
$ npm run generate:keys
```

This will create random app key and secret pairs and update your .env file.

## Running the App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Example Client

An example client is included to demonstrate the authentication system. To run it:

```bash
# Start the example client server (on port 8080)
$ npm run serve:example
```

Then open your browser to http://localhost:8080

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
- `PUSHER_APP_KEY`: Your Pusher-compatible app key for authentication
- `PUSHER_APP_SECRET`: Your Pusher-compatible app secret for signing auth tokens
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
// Using Socket.IO client with authentication
const socket = io('http://localhost:3000/chat', {
  auth: {
    userId: 'user123',
    username: 'John'
  }
});

// Join a room
socket.emit('join_room', { roomId: 'room1' });

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

## Private/Presence Channel Authentication

For private or presence channels, the client needs to authenticate with the server:

```javascript
// Using Pusher client library with Socket.IO adapter
const pusher = new Pusher('app-key', {
  wsHost: 'localhost',
  wsPort: 3000,
  enabledTransports: ['ws'],
  disabledTransports: ['xhr_streaming', 'xhr_polling', 'sockjs'],
  authEndpoint: 'http://localhost:3000/api/auth/channel',
  auth: {
    headers: {
      // Add any auth headers needed
    },
    params: {
      user_id: 'user123',
      user_info: { name: 'John Doe' }
    }
  }
});

// Subscribe to a private channel
const privateChannel = pusher.subscribe('private-room-123');

// Subscribe to a presence channel
const presenceChannel = pusher.subscribe('presence-room-123');
presenceChannel.bind('pusher:subscription_succeeded', (members) => {
  // Handle members
  console.log('Members:', members);
});
```

### Authentication Flow

1. Client tries to join a private/presence channel
2. Backend receives socket_id + channel_name
3. Backend checks permissions and signs auth using app_secret
4. Client sends signed auth to complete subscription

## Future Enhancements

- Persistent message storage with database integration
- Encryption of messages
- File sharing capabilities
- Read receipts
- Message reactions
- Direct messaging between users
- Enhanced authentication with JWT tokens

## License

This project is [MIT licensed](LICENSE).
