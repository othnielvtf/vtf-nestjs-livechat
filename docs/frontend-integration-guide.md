# Frontend Integration Guide for NestJS LiveChat

This guide explains how to integrate your frontend application with the NestJS LiveChat backend using Socket.IO.

## Prerequisites

- Socket.IO client library installed in your frontend project
- A running instance of the NestJS LiveChat backend

## Installation

### For React

```bash
npm install socket.io-client
```

### For Vue.js

```bash
npm install socket.io-client
```

### For Angular

```bash
npm install socket.io-client
```

### For vanilla JavaScript

```html
<script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
```

## Basic Connection

```javascript
import { io } from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

## Event Reference

### Client to Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ roomId: string, username: string }` | Join a chat room |
| `leave_room` | `{ roomId: string }` | Leave a chat room |
| `send_message` | `{ roomId: string, content: string }` | Send a message to a room |
| `typing` | `{ roomId: string, isTyping: boolean }` | Indicate typing status |
| `get_active_rooms` | `{}` | Get list of active rooms |
| `get_room_users` | `{ roomId: string }` | Get users in a specific room |

### Server to Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user_joined` | `{ username: string, timestamp: Date, roomId: string }` | User joined a room |
| `user_left` | `{ username: string, timestamp: Date, roomId: string }` | User left a room |
| `new_message` | `{ id: string, content: string, username: string, roomId: string, timestamp: Date }` | New message received |
| `user_typing` | `{ username: string, isTyping: boolean, roomId: string }` | User typing status |
| `room_history` | `Message[]` | History of messages in a room |

## Usage Examples

### Joining a Room

```javascript
function joinRoom(roomId, username) {
  socket.emit('join_room', { roomId, username }, (response) => {
    if (response.success) {
      console.log('Successfully joined room:', roomId);
    } else {
      console.error('Failed to join room:', response.message);
    }
  });
}

// Listen for other users joining
socket.on('user_joined', (data) => {
  console.log(`${data.username} joined room ${data.roomId} at ${data.timestamp}`);
});

// Listen for room history
socket.on('room_history', (messages) => {
  console.log('Room history:', messages);
  // Display messages in your UI
});
```

### Sending Messages

```javascript
function sendMessage(roomId, content) {
  socket.emit('send_message', { roomId, content }, (response) => {
    if (response.success) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message:', response.message);
    }
  });
}

// Listen for new messages
socket.on('new_message', (message) => {
  console.log(`New message from ${message.username}: ${message.content}`);
  // Add message to your UI
});
```

### Typing Indicators

```javascript
function setTypingStatus(roomId, isTyping) {
  socket.emit('typing', { roomId, isTyping });
}

// Listen for typing indicators
socket.on('user_typing', ({ username, isTyping, roomId }) => {
  if (isTyping) {
    console.log(`${username} is typing in room ${roomId}`);
    // Show typing indicator in UI
  } else {
    console.log(`${username} stopped typing in room ${roomId}`);
    // Hide typing indicator in UI
  }
});
```

### Leaving a Room

```javascript
function leaveRoom(roomId) {
  socket.emit('leave_room', { roomId }, (response) => {
    if (response.success) {
      console.log('Successfully left room:', roomId);
    } else {
      console.error('Failed to leave room:', response.message);
    }
  });
}

// Listen for other users leaving
socket.on('user_left', (data) => {
  console.log(`${data.username} left room ${data.roomId} at ${data.timestamp}`);
});
```

### Getting Room Information

```javascript
// Get active rooms
function getActiveRooms() {
  socket.emit('get_active_rooms', {}, (response) => {
    if (response.success) {
      console.log('Active rooms:', response.rooms);
    }
  });
}

// Get users in a room
function getRoomUsers(roomId) {
  socket.emit('get_room_users', { roomId }, (response) => {
    if (response.success) {
      console.log('Users in room:', response.users);
    }
  });
}
```

## Complete React Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    
    newSocket.on('connect', () => {
      setConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
      setJoined(false);
    });
    
    setSocket(newSocket);
    
    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Set up event listeners
  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    
    socket.on('room_history', (history) => {
      setMessages(history);
    });
    
    socket.on('user_joined', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `${data.username} joined the room`,
          username: 'System',
          timestamp: data.timestamp,
        },
      ]);
    });
    
    socket.on('user_left', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `${data.username} left the room`,
          username: 'System',
          timestamp: data.timestamp,
        },
      ]);
    });
    
    socket.on('user_typing', ({ username, isTyping }) => {
      if (isTyping) {
        setTypingUsers((prev) => [...prev.filter(name => name !== username), username]);
      } else {
        setTypingUsers((prev) => prev.filter(name => name !== username));
      }
    });
    
    return () => {
      socket.off('new_message');
      socket.off('room_history');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
    };
  }, [socket]);
  
  // Join room function
  const joinRoom = () => {
    if (!socket || !username || !roomId) return;
    
    socket.emit('join_room', { roomId, username }, (response) => {
      if (response.success) {
        setJoined(true);
      }
    });
  };
  
  // Send message function
  const sendMessage = (e) => {
    e.preventDefault();
    if (!socket || !message || !joined) return;
    
    socket.emit('send_message', { roomId, content: message });
    setMessage('');
  };
  
  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!socket || !joined) return;
    
    socket.emit('typing', { roomId, isTyping: e.target.value.length > 0 });
  };
  
  // Leave room function
  const leaveRoom = () => {
    if (!socket || !joined) return;
    
    socket.emit('leave_room', { roomId });
    setJoined(false);
    setMessages([]);
  };
  
  return (
    <div className="chat-app">
      <h1>LiveChat</h1>
      
      {!joined ? (
        <div className="join-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom} disabled={!connected || !username || !roomId}>
            Join Room
          </button>
        </div>
      ) : (
        <div className="chat-room">
          <div className="room-info">
            <h2>Room: {roomId}</h2>
            <button onClick={leaveRoom}>Leave Room</button>
          </div>
          
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.username === username ? 'own' : ''}`}>
                <div className="message-header">
                  <span className="username">{msg.username}</span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
          </div>
          
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          
          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
            />
            <button type="submit" disabled={!message}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatApp;
```

## Error Handling

Always implement proper error handling in your frontend application:

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Show error message to user
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Show error message to user
});
```

## Best Practices

1. **Reconnection Strategy**: Configure automatic reconnection for better user experience
   ```javascript
   const socket = io('http://localhost:3000', {
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 1000
   });
   ```

2. **Authentication**: Consider adding authentication to your WebSocket connections
   ```javascript
   const socket = io('http://localhost:3000', {
     auth: {
       token: 'user-auth-token'
     }
   });
   ```

3. **Offline Support**: Implement offline message queuing for better user experience

4. **Optimistic Updates**: Update UI immediately before server confirmation for responsive feel

5. **Debounce Typing Events**: Limit typing event emissions to reduce server load
   ```javascript
   // Using lodash debounce or similar
   const debouncedTypingEmit = debounce((isTyping) => {
     socket.emit('typing', { roomId, isTyping });
   }, 300);
   ```

## Troubleshooting

- **Connection Issues**: Ensure the backend server is running and accessible
- **CORS Errors**: Make sure the backend has proper CORS configuration
- **Event Not Firing**: Verify event names match exactly between frontend and backend
- **Authentication Failures**: Check that auth tokens are valid and properly formatted

## Additional Resources

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Socket.IO Cheatsheet](https://socket.io/docs/v4/cheatsheet/)
