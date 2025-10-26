const axios = require('axios');

async function testServer() {
  try {
    console.log('Testing server connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test general endpoint
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Test endpoint:', testResponse.data);
    
    console.log('🎉 Server is working correctly!');
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

testServer();

