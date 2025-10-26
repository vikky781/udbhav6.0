import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Save, Upload, FileText, Code } from 'lucide-react';

const CreateSubmission = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'text',
    programmingLanguage: '',
    course: '',
    assignment: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting data:', {
        title: formData.title,
        type: formData.type,
        hasContent: !!formData.content
      });

      // Ensure all required fields are present
      const submissionData = {
        title: formData.title,
        description: formData.description || '',
        content: formData.content,
        type: formData.type || 'text',
        language: formData.language || '',
        course: formData.course || '',
        assignment: formData.assignment || '',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      };

      console.log('📤 Sending submission data:', submissionData);

      const response = await axios.post('/api/submissions', submissionData);

      console.log('Submission response:', response.data);

      if (response.data && response.data.submission && response.data.submission.id) {
        toast.success('Submission created successfully!');
        navigate(`/submissions/${response.data.submission.id}`);
      } else {
        console.error('Invalid response structure:', response.data);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create submission';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      console.log('Saving draft with data:', {
        title: formData.title,
        type: formData.type,
        hasContent: !!formData.content
      });

      // Ensure all required fields are present
      const submissionData = {
        title: formData.title,
        description: formData.description || '',
        content: formData.content,
        type: formData.type || 'text',
        language: formData.language || '',
        course: formData.course || '',
        assignment: formData.assignment || '',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      };

      console.log('📤 Saving draft with data:', submissionData);

      const response = await axios.post('/api/submissions', submissionData);

      console.log('Draft response:', response.data);

      if (response.data && response.data.submission) {
        toast.success('Draft saved successfully!');
        navigate('/submissions');
      } else {
        console.error('Invalid draft response structure:', response.data);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save draft';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create New Submission</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter submission title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Text Document</option>
                <option value="code">Code</option>
                <option value="mixed">Mixed Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., CS101, Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment
              </label>
              <input
                type="text"
                name="assignment"
                value={formData.assignment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Final Project, Essay"
              />
            </div>

            {formData.type === 'code' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <select
                  name="programmingLanguage"
                  value={formData.programmingLanguage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Language</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., machine-learning, algorithms, research"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your submission"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            {formData.type === 'code' ? (
              <Code className="h-5 w-5 text-blue-600 mr-2" />
            ) : (
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {formData.type === 'code' ? 'Code Content' : 'Text Content'}
            </h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={formData.type === 'code' 
                ? 'Paste your code here...' 
                : 'Enter your text content here...'
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Word count: {formData.content.split(/\s+/).filter(word => word.length > 0).length}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/submissions')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="spinner mr-2"></div>
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubmission;
