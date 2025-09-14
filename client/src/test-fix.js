// Simple test script to verify our fix for the "Cannot read properties of undefined (reading 'header')" error

// Import the necessary functions
import { getMe, setAccessToken } from './lib/api.js';

async function testGetMeWithoutToken() {
  console.log('Testing getMe() without an access token...');

  // Ensure no access token is set
  setAccessToken(null);

  try {
    // This should now throw our custom error instead of the server error
    const userData = await getMe();
    console.log('Unexpected success:', userData);
  } catch (error) {
    console.log('Expected error caught:', error.message);

    // Verify that we're getting our custom error message
    if (error.message === 'No access token available. Please log in again.') {
      console.log('✅ Test passed: Received the expected error message');
    } else {
      console.log('❌ Test failed: Received an unexpected error message');
    }
  }
}

// Run the test
testGetMeWithoutToken();
