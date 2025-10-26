import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Star, Save, Send, FileText } from 'lucide-react';

const CreateReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({
    overallRating: 5,
    categories: [
      { name: 'Content Quality', score: 5, comment: '' },
      { name: 'Clarity', score: 5, comment: '' },
      { name: 'Originality', score: 5, comment: '' },
      { name: 'Technical Accuracy', score: 5, comment: '' }
    ],
    strengths: [''],
    weaknesses: [''],
    suggestions: [''],
    detailedFeedback: '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/submissions/${submissionId}`);
      setSubmission(response.data.submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Failed to load submission');
      navigate('/submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, overallRating: rating });
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] = value;
    setFormData({ ...formData, categories: updatedCategories });
  };

  const handleArrayFieldChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await axios.post('/api/reviews', {
        submissionId,
        ...formData,
        status: 'draft'
      });
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.overallRating < 1 || formData.overallRating > 5) {
      toast.error('Please provide a valid rating');
      return;
    }

    try {
      setSaving(true);
      await axios.post('/api/reviews', {
        submissionId,
        ...formData,
        status: 'submitted'
      });
      
      toast.success('Review submitted successfully!');
      navigate('/reviews');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Submission not found</h2>
        <p className="text-gray-600 mt-2">The submission you're trying to review doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Write Review</h1>
          <p className="text-gray-600">Reviewing: {submission.title}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Submission Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Submission Preview</h2>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{submission.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{submission.description}</p>
          <div className="text-sm text-gray-500">
            <span>Type: {submission.type}</span>
            {submission.language && <span className="ml-4">Language: {submission.language}</span>}
            <span className="ml-4">Author: {submission.author?.name}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h2>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingChange(rating)}
                className={`p-2 rounded-md ${
                  rating <= formData.overallRating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {formData.overallRating} out of 5 stars
            </span>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Ratings</h2>
          <div className="space-y-4">
            {formData.categories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleCategoryChange(index, 'score', rating)}
                        className={`p-1 rounded ${
                          rating <= category.score
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {category.score}/5
                    </span>
                  </div>
                </div>
                <textarea
                  placeholder={`Comment on ${category.name.toLowerCase()}...`}
                  value={category.comment}
                  onChange={(e) => handleCategoryChange(index, 'comment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h2>
          <div className="space-y-3">
            {formData.strengths.map((strength, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={strength}
                  onChange={(e) => handleArrayFieldChange('strengths', index, e.target.value)}
                  placeholder="What did the author do well?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.strengths.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('strengths', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('strengths')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              + Add another strength
            </button>
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h2>
          <div className="space-y-3">
            {formData.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={weakness}
                  onChange={(e) => handleArrayFieldChange('weaknesses', index, e.target.value)}
                  placeholder="What could be improved?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.weaknesses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('weaknesses', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('weaknesses')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              + Add another area for improvement
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h2>
          <div className="space-y-3">
            {formData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={suggestion}
                  onChange={(e) => handleArrayFieldChange('suggestions', index, e.target.value)}
                  placeholder="What would you suggest?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.suggestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('suggestions', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('suggestions')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              + Add another suggestion
            </button>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feedback</h2>
          <textarea
            value={formData.detailedFeedback}
            onChange={(e) => setFormData({ ...formData, detailedFeedback: e.target.value })}
            placeholder="Provide detailed feedback on the submission..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Anonymous Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
              Submit as anonymous review
            </label>
          </div>
        </div>

        {/* Submit Button */}
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
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="spinner mr-2"></div>
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReview;

