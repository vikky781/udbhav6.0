import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  Star, 
  Users, 
  TrendingUp, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalReviews: 0,
    pendingReviews: 0,
    avgRating: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch submissions
      const submissionsResponse = await axios.get('/api/submissions?limit=5');
      setRecentSubmissions(submissionsResponse.data.submissions);

      // Fetch reviews
      const reviewsResponse = await axios.get('/api/reviews/my-reviews?limit=5');
      setRecentReviews(reviewsResponse.data.reviews);

      // Calculate stats
      const totalSubmissions = submissionsResponse.data.pagination.total;
      const totalReviews = reviewsResponse.data.pagination.total;
      
      setStats({
        totalSubmissions,
        totalReviews,
        pendingReviews: 0, // This would come from a separate API call
        avgRating: 4.2 // This would come from analytics API
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your submissions and reviews.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviews Given</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/submissions/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">Create Submission</h3>
              <p className="text-sm text-gray-600">Submit a new project for review</p>
            </div>
          </Link>

          <Link
            to="/reviews"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">Review Submissions</h3>
              <p className="text-sm text-gray-600">Review pending submissions</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link
              to="/submissions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-1 rounded-full ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{submission.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                    {submission.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No submissions yet</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
            <Link
              to="/reviews"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-1 bg-green-100 rounded-full">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {review.submission?.title || 'Review'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rating: {review.overallRating}/5
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
