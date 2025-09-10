const axios = require('axios');

// Test script for n8n API integration
async function testN8nAPI() {
  const baseURL = 'http://localhost:3000'; // Adjust port if needed
  
  console.log('🧪 Testing n8n API integration...\n');
  
  try {
    // Test 1: Health check endpoint
    console.log('1️⃣ Testing GET /api/n8n/health...');
    const healthResponse = await axios.get(`${baseURL}/api/n8n/health`);
    console.log('✅ Health check successful:');
    console.log('   Status:', healthResponse.status);
    console.log('   Data:', JSON.stringify(healthResponse.data, null, 2));
    console.log('');
    
    // Test 2: Webhook endpoint with sample data
    console.log('2️⃣ Testing POST /api/n8n/webhook...');
    const testPayload = {
      message: 'Test from FlashCard Server',
      timestamp: new Date().toISOString(),
      source: 'test-script'
    };
    
    const webhookResponse = await axios.post(`${baseURL}/api/n8n/webhook`, testPayload);
    console.log('✅ Webhook test successful:');
    console.log('   Status:', webhookResponse.status);
    console.log('   Data:', JSON.stringify(webhookResponse.data, null, 2));
    console.log('');
    
    console.log('🎉 All tests passed! n8n API integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received. Make sure the server is running.');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testN8nAPI();
}

module.exports = testN8nAPI;

