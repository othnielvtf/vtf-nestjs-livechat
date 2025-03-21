/**
 * JWT Authentication Test Script
 * 
 * This script demonstrates how to:
 * 1. Login to get a JWT token
 * 2. Connect to WebSocket using the JWT token
 * 3. Authenticate for a private channel using the JWT token
 * 4. Send and receive messages in the authenticated channel
 * 
 * Run with: node jwt-auth-test.js
 */

const axios = require('axios');
const io = require('socket.io-client');

// Configuration
const API_URL = 'http://localhost:3000/api';
const WS_URL = 'http://localhost:3000/chat';
const TEST_USERNAME = 'john_doe';
const TEST_PASSWORD = 'password123';
const TEST_CHANNEL = 'private-room-123';

async function runTest() {
  console.log('Starting JWT Authentication Test...');
  
  try {
    // Step 1: Login to get JWT token
    console.log('\n1. Logging in to get JWT token...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    
    const { access_token, user } = loginResponse.data;
    console.log(`✅ Login successful for user: ${user.username} (${user.id})`);
    console.log(`Token: ${access_token.substring(0, 15)}...`);
    
    // Step 2: Connect to WebSocket with JWT token
    console.log('\n2. Connecting to WebSocket with JWT token...');
    const socket = io(WS_URL, {
      auth: {
        token: access_token,
        userId: user.id,
        username: user.username
      }
    });
    
    // Setup event listeners
    socket.on('connect', async () => {
      console.log(`✅ Connected to WebSocket (Socket ID: ${socket.id})`);
      
      // Step 3: Authenticate for a private channel
      console.log(`\n3. Authenticating for private channel: ${TEST_CHANNEL}...`);
      try {
        const authResponse = await axios.post(
          `${API_URL}/auth/channel`,
          {
            socket_id: socket.id,
            channel_name: TEST_CHANNEL,
            user_id: user.id,
            user_info: {
              name: user.username
            }
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`
            }
          }
        );
        
        const authData = authResponse.data;
        console.log('✅ Channel authentication successful');
        console.log('Auth data:', authData);
        
        // Step 4: Join the private room with auth data
        console.log(`\n4. Joining private channel: ${TEST_CHANNEL}...`);
        socket.emit('join_room', {
          roomId: TEST_CHANNEL,
          username: user.username,
          auth: authData.auth,
          channel_data: authData.channel_data
        }, (response) => {
          if (response && response.error) {
            console.error(`❌ Error joining room: ${response.error}`);
          } else {
            console.log('✅ Successfully joined private channel');
            
            // Step 5: Send a test message
            const testMessage = 'Hello from JWT authenticated client!';
            console.log(`\n5. Sending test message: "${testMessage}"`);
            socket.emit('send_message', {
              roomId: TEST_CHANNEL,
              content: testMessage
            });
            
            // Wait a bit and then disconnect
            setTimeout(() => {
              console.log('\nTest completed. Disconnecting...');
              socket.disconnect();
              console.log('✅ Disconnected from WebSocket');
            }, 3000);
          }
        });
      } catch (error) {
        console.error('❌ Channel authentication error:', error.response?.data || error.message);
        socket.disconnect();
      }
    });
    
    socket.on('new_message', (message) => {
      console.log(`\nReceived message from ${message.username}: ${message.content}`);
    });
    
    socket.on('user_joined', (data) => {
      console.log(`User joined: ${data.username}`);
    });
    
    socket.on('user_left', (data) => {
      console.log(`User left: ${data.username}`);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });
    
    socket.on('exception', (data) => {
      console.error('❌ Server exception:', data.message);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
runTest();
