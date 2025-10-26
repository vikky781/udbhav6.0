import React, { useState } from 'react';
import axios from 'axios';

const TestSubmission = () => {
  const [testData, setTestData] = useState({
    title: 'Test Submission',
    content: 'This is a test submission content.',
    type: 'text'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testSubmission = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Testing submission with data:', testData);
      
      const response = await axios.post('/api/submissions', testData);
      
      console.log('Submission test response:', response.data);
      setResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('Submission test error:', error);
      setResult({
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const testServer = async () => {
    try {
      const response = await axios.get('/api/test');
      console.log('Server test response:', response.data);
      setResult({
        success: true,
        data: response.data,
        type: 'server'
      });
    } catch (error) {
      console.error('Server test error:', error);
      setResult({
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        },
        type: 'server'
      });
    }
  };

  const testSubmissionsRoute = async () => {
    try {
      const response = await axios.get('/api/submissions/test');
      console.log('Submissions route test response:', response.data);
      setResult({
        success: true,
        data: response.data,
        type: 'submissions'
      });
    } catch (error) {
      console.error('Submissions route test error:', error);
      setResult({
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        },
        type: 'submissions'
      });
    }
  };

  const testSubmissionCreation = async () => {
    try {
      const response = await axios.post('/api/submissions/test-create', testData);
      console.log('Test submission creation response:', response.data);
      setResult({
        success: true,
        data: response.data,
        type: 'test-create'
      });
    } catch (error) {
      console.error('Test submission creation error:', error);
      setResult({
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        },
        type: 'test-create'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Submission Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Test Data</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={testData.title}
              onChange={(e) => setTestData({...testData, title: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="Title"
            />
            <textarea
              value={testData.content}
              onChange={(e) => setTestData({...testData, content: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Content"
            />
            <select
              value={testData.type}
              onChange={(e) => setTestData({...testData, type: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="code">Code</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4 flex-wrap">
          <button
            onClick={testServer}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Server
          </button>
          <button
            onClick={testSubmissionsRoute}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Submissions Route
          </button>
          <button
            onClick={testSubmissionCreation}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Test Creation (No Auth)
          </button>
          <button
            onClick={testSubmission}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Full Submission'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">
              {result.success ? '✅ Success' : '❌ Error'} 
              {result.type && ` (${result.type})`}
            </h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSubmission;
