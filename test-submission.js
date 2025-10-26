const axios = require('axios');

async function testSubmission() {
  try {
    console.log('🧪 Testing submission creation...');

    // First, let's test if the server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server health:', healthResponse.data);

    // Test the submissions route
    console.log('2. Testing submissions route...');
    const routeResponse = await axios.get('http://localhost:5000/api/submissions/test');
    console.log('✅ Submissions route:', routeResponse.data);

    // Test authentication (you'll need to replace with actual credentials)
    console.log('3. Testing authentication...');
    try {
      const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Authentication successful');
      
      const token = authResponse.data.token;
      
      // Test submission creation
      console.log('4. Testing submission creation...');
      const submissionData = {
        title: 'Test Submission',
        description: 'This is a test submission',
        content: 'This is the content of the test submission.',
        type: 'text',
        language: '',
        course: 'Test Course',
        assignment: 'Test Assignment',
        tags: ['test', 'debug']
      };

      const submissionResponse = await axios.post('http://localhost:5000/api/submissions', submissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Submission created successfully:', submissionResponse.data);
      
    } catch (authError) {
      console.log('⚠️ Authentication failed (this is expected if no user exists):', authError.response?.data?.message);
      console.log('💡 You need to register a user first or use existing credentials');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

testSubmission();

