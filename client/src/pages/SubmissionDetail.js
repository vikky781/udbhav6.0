import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Edit, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Code,
  Brain,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchSubmission();
    fetchReviews();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/submissions/${id}`);
      setSubmission(response.data.submission);
      setAnalysis(response.data.submission.analysis);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/submission/${id}`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const runPlagiarismCheck = async () => {
    try {
      const response = await axios.post('/api/analysis/comprehensive', {
        content: submission.content,
        type: submission.type,
        language: submission.programmingLanguage || submission.language,
        submissionId: id
      });
      
      if (response.data.plagiarism) {
        // Update the analysis in the state
        setAnalysis({
          ...analysis,
          plagiarism: response.data.plagiarism
        });
        
        // Update the submission in the database
        await axios.put(`/api/submissions/${id}`, {
          analysis: {
            ...submission.analysis,
            plagiarism: response.data.plagiarism
          }
        });
      }
    } catch (error) {
      console.error('Error running plagiarism check:', error);
      alert('Failed to run plagiarism check. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'reviewed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'submitted':
        return <FileText className="h-4 w-4" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4" />;
      case 'reviewed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
        <p className="text-gray-600 mt-2">The submission you're looking for doesn't exist.</p>
        <Link
          to="/submissions"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/submissions')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{submission.title}</h1>
            <p className="text-gray-600">{submission.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
            {getStatusIcon(submission.status)}
            <span className="ml-2">{submission.status.replace('_', ' ')}</span>
          </span>
          <Link
            to={`/submissions/${id}/edit`}
            className="text-blue-600 hover:text-blue-700 p-2"
          >
            <Edit className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Submission Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Type</h3>
            <p className="mt-1 text-sm text-gray-900 capitalize">{submission.type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Language</h3>
            <p className="mt-1 text-sm text-gray-900">{submission.language || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Author</h3>
            <p className="mt-1 text-sm text-gray-900">{submission.author?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Course</h3>
            <p className="mt-1 text-sm text-gray-900">{submission.course || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Assignment</h3>
            <p className="mt-1 text-sm text-gray-900">{submission.assignment || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Created</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(submission.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          {submission.type === 'code' ? (
            <Code className="h-5 w-5 text-blue-600 mr-2" />
          ) : (
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
          )}
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
            {submission.content}
          </pre>
        </div>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Brain className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.text && (
              <>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Sentiment</h3>
                  <p className="text-sm text-blue-700">
                    Score: {analysis.text.sentiment?.score || 'N/A'}
                  </p>
                  <p className="text-sm text-blue-700">
                    Label: {analysis.text.sentiment?.label || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Readability</h3>
                  <p className="text-sm text-green-700">
                    Score: {analysis.text.readability?.score || 'N/A'}
                  </p>
                  <p className="text-sm text-green-700">
                    Level: {analysis.text.readability?.level || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Complexity</h3>
                  <p className="text-sm text-yellow-700">
                    Score: {analysis.text.complexity?.score || 'N/A'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Level: {analysis.text.complexity?.level || 'N/A'}
                  </p>
                </div>
              </>
            )}

            {analysis?.plagiarism ? (
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-900">Plagiarism Detection</h3>
                </div>
                <div className="mt-3">
                  <p className="text-lg font-bold text-red-700 mb-1">
                    Similarity: {typeof analysis.plagiarism.score === 'number' ? analysis.plagiarism.score.toFixed(1) : '0'}%
                  </p>
                  <p className="text-sm text-red-600 mb-2">
                    Similar Sources Found: {analysis.plagiarism.sources?.length || 0}
                  </p>
                  {analysis.plagiarism.sources && analysis.plagiarism.sources.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-red-800 mb-2">Similar Submissions:</p>
                      <div className="space-y-2">
                        {analysis.plagiarism.sources.slice(0, 3).map((source, index) => (
                          <div key={index} className="text-xs text-red-800 bg-red-100 p-2 rounded border border-red-300">
                            <span className="font-medium">{source.text || 'Untitled'}</span>
                            <span className="ml-2 text-red-600">
                              - {typeof source.similarity === 'number' ? (source.similarity * 100).toFixed(1) : '0'}% similar
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-700">Plagiarism Detection</h3>
                  </div>
                  <button
                    onClick={runPlagiarismCheck}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Run Check
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Click "Run Check" to analyze plagiarism in this submission.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
          </div>
          <Link
            to={`/reviews/create/${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Review
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.overallRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {review.overallRating}/5
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {review.detailedFeedback && (
                  <p className="text-sm text-gray-700 mt-2">
                    {review.detailedFeedback}
                  </p>
                )}

                {review.categories && review.categories.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Categories:</h4>
                    <div className="flex flex-wrap gap-2">
                      {review.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {category.name}: {category.score}/5
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to review this submission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;
