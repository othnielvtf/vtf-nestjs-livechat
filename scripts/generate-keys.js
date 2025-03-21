#!/usr/bin/env node

/**
 * Script to generate secure app key and secret for Pusher-compatible authentication
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a random string of specified length
function generateRandomKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Main function
async function generateKeys() {
  try {
    // Generate keys
    const appKey = generateRandomKey(16); // 32 characters (16 bytes)
    const appSecret = generateRandomKey(32); // 64 characters (32 bytes)
    
    console.log('\n🔑 Generated Keys:');
    console.log('====================');
    console.log(`App Key:    ${appKey}`);
    console.log(`App Secret: ${appSecret}`);
    
    // Path to .env file
    const envPath = path.resolve(__dirname, '../.env');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('\n❌ .env file not found. Please create it first.');
      process.exit(1);
    }
    
    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the app key and secret
    envContent = envContent.replace(/PUSHER_APP_KEY=.*$/m, `PUSHER_APP_KEY=${appKey}`);
    envContent = envContent.replace(/PUSHER_APP_SECRET=.*$/m, `PUSHER_APP_SECRET=${appSecret}`);
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Keys have been updated in your .env file');
    console.log('====================');
    
  } catch (error) {
    console.error('\n❌ Error generating keys:', error.message);
    process.exit(1);
  }
}

// Run the script
generateKeys();
