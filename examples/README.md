# NestJS LiveChat Examples

This directory contains example clients for the NestJS LiveChat backend with authentication support.

## Running the Examples

You can run the examples in two ways:

### 1. Using the Built-in Server

The project includes a simple HTTP server to serve the example clients:

```bash
# From the project root directory
$ npm run serve:example
```

Then open your browser to http://localhost:8080

### 2. Opening the HTML File Directly

You can also open the HTML file directly in your browser:

```bash
# macOS
$ open examples/client-auth-example.html

# Linux
$ xdg-open examples/client-auth-example.html

# Windows
$ start examples/client-auth-example.html
```

## Authentication Example

The `client-auth-example.html` file demonstrates how to:

1. Connect to the WebSocket server with authentication
2. Subscribe to public, private, and presence channels
3. Authenticate private/presence channels using the backend's auth endpoint
4. Send and receive messages in real-time
5. View the authentication response from the server

### How to Use

1. Make sure the NestJS LiveChat backend is running (`npm run start:dev`)
2. Start the example client server (`npm run serve:example`)
3. Open your browser to http://localhost:8080
4. Enter your user ID and username in the Connection panel
5. Click "Connect" to establish a WebSocket connection
6. Select a channel type (public, private, or presence) and name
7. Click "Subscribe" to join the channel
8. For private/presence channels, the authentication response will be displayed
9. Once subscribed, you can send messages to the channel

### Authentication Flow

The example demonstrates the complete authentication flow for private and presence channels:

1. Client attempts to subscribe to a private/presence channel
2. Client sends socket_id, channel_name, user_id, and user_info to the auth endpoint
3. Server validates permissions and signs the auth token using HMAC SHA-256
4. Server returns the signed auth token (and channel_data for presence channels)
5. Client uses the signed auth to complete the subscription

### Channel Types

- **Public Channels**: No authentication required
- **Private Channels**: Require authentication, prefixed with `private-`
- **Presence Channels**: Require authentication and user data, prefixed with `presence-`

### Testing Different Scenarios

You can test different authentication scenarios:

1. **Public Channel**: Select "Public" type and any name
2. **Private Channel**: Select "Private" type and any name (will be prefixed with `private-`)
3. **Presence Channel**: Select "Presence" type and any name (will be prefixed with `presence-`)
4. **Authentication Failure**: Try modifying the auth endpoint URL to see error handling

## Extending the Examples

Feel free to modify these examples to test additional features or create new examples for specific use cases. The authentication system is compatible with Pusher client libraries, so you can also test with official Pusher clients.
