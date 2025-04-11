// Test script to verify communication with the desktop application
const fetch = require('node-fetch');

async function testDesktopAppCommunication() {
  console.log('Testing communication with desktop application...');
  
  // Test data similar to what the plugin will send
  const testData = {
    variablesCount: {
      collections: {
        "Colors": 5,
        "Typography": 3
      },
      total: 8
    },
    stylesCount: {
      paint: 3,
      text: 2,
      effect: 1,
      grid: 0,
      total: 6
    },
    timestamp: new Date().toISOString(),
    fileName: "Test File"
  };
  
  try {
    // Make sure the desktop app is running
    console.log('Sending test data to desktop app...');
    
    const response = await fetch('http://localhost:3000/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (response.ok) {
      console.log('✓ Successfully communicated with desktop app!');
    } else {
      console.error('✗ Failed to communicate with desktop app:', response.status, responseText);
    }
  } catch (error) {
    console.error('✗ Error connecting to desktop app:', error.message);
    console.log('Make sure the desktop application is running on port 3000');
  }
}

// Run the test
testDesktopAppCommunication(); 