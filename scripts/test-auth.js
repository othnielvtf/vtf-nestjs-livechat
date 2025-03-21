#!/usr/bin/env node

/**
 * Script to test the authentication endpoint
 * Run with: node scripts/test-auth.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const config = {
  host: 'localhost',
  port: 3000,
  endpoint: '/api/auth/channel',
  socketId: `${Math.floor(Math.random() * 1000000)}.${Math.floor(Math.random() * 1000000)}`,
  userId: 'test-user-123',
  username: 'Test User',
};

// Test different channel types
const channelTypes = [
  { type: 'public', name: 'test-channel' },
  { type: 'private', name: 'private-test-channel' },
  { type: 'presence', name: 'presence-test-channel' },
];

// Function to make a POST request
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: config.host,
      port: config.port,
      path: config.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Main function
async function testAuth() {
  console.log('\n🔐 Testing Authentication Endpoint');
  console.log('===============================');
  console.log(`Endpoint: http://${config.host}:${config.port}${config.endpoint}`);
  console.log(`Socket ID: ${config.socketId}`);
  console.log(`User ID: ${config.userId}`);
  console.log(`Username: ${config.username}`);
  console.log('===============================\n');
  
  for (const channel of channelTypes) {
    console.log(`\n📡 Testing ${channel.type} channel: ${channel.name}`);
    
    try {
      // Prepare request data
      const requestData = {
        socket_id: config.socketId,
        channel_name: channel.name,
      };
      
      // Add user data for private and presence channels
      if (channel.type !== 'public') {
        requestData.user_id = config.userId;
        requestData.user_info = {
          name: config.username,
        };
      }
      
      console.log(`Request: ${JSON.stringify(requestData, null, 2)}`);
      
      // Make the request
      const response = await makeRequest(requestData);
      
      // Log the response
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Verify the signature for private and presence channels
      if (channel.type !== 'public' && (response.statusCode === 200 || response.statusCode === 201) && response.data.auth) {
        console.log('\n✅ Authentication successful');
      } else if (channel.type === 'public') {
        console.log('\n⚠️ Public channels do not require authentication');
      } else {
        console.log('\n❌ Authentication failed');
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }
  }
}

// Run the tests
testAuth();
