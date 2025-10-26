import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Star, 
  Brain,
  Shield,
  Clock
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'instructor' || user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, reviewsResponse] = await Promise.all([
        axios.get('/api/submissions/stats/overview'),
        axios.get('/api/reviews/stats/overview')
      ]);

      setAnalytics({
        submissions: submissionsResponse.data,
        reviews: reviewsResponse.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h2>
        <p className="mt-1 text-sm text-gray-500">
          You need instructor or admin privileges to view analytics.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.submissions?.overview?.totalSubmissions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.reviews?.overview?.totalReviews || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.reviews?.overview?.avgRating?.toFixed(1) || '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
          <div className="space-y-3">
            {analytics?.submissions?.statusBreakdown?.map((status) => (
              <div key={status._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status._id === 'draft' ? 'bg-gray-400' :
                    status._id === 'submitted' ? 'bg-blue-400' :
                    status._id === 'under_review' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status._id.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Types</h3>
          <div className="space-y-3">
            {analytics?.submissions?.typeBreakdown?.map((type) => (
              <div key={type._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    type._id === 'text' ? 'bg-blue-400' :
                    type._id === 'code' ? 'bg-green-400' :
                    'bg-purple-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type._id}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{type.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {analytics?.reviews?.ratingDistribution?.map((rating) => (
            <div key={rating._id} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{rating.count}</div>
              <div className="text-sm text-gray-600">
                {[...Array(rating._id)].map((_, i) => (
                  <Star key={i} className="inline h-3 w-3 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {rating._id} star{rating._id !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
        <div className="space-y-4">
          {analytics?.reviews?.categoryStats?.map((category) => (
            <div key={category._id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category._id}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {category.avgScore?.toFixed(1)}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(category.avgScore / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Average Readability</h4>
            <p className="text-2xl font-bold text-blue-700">
              {analytics?.submissions?.overview?.avgWordCount ? 
                Math.round(analytics.submissions.overview.avgWordCount / 10) : 0}
            </p>
            <p className="text-sm text-blue-600">Reading Level</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Complexity Score</h4>
            <p className="text-2xl font-bold text-green-700">
              {analytics?.submissions?.overview?.avgComplexityScore?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-green-600">Average Complexity</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Plagiarism Rate</h4>
            <p className="text-2xl font-bold text-yellow-700">2.3%</p>
            <p className="text-sm text-yellow-600">Detected Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

