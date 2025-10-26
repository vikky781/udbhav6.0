const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Review = require('../models/Review');
const Submission = require('../models/Submission');
const aiAnalysis = require('../services/aiAnalysis');

const router = express.Router();

// Create new review
router.post('/', auth, async (req, res) => {
  try {
    const {
      submissionId,
      overallRating,
      categories,
      strengths,
      weaknesses,
      suggestions,
      detailedFeedback,
      isAnonymous
    } = req.body;

    if (!submissionId || !overallRating || !categories) {
      return res.status(400).json({ message: 'Submission ID, overall rating, and categories are required' });
    }

    // Check if submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user can review this submission
    if (submission.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot review your own submission' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      submission: submissionId,
      reviewer: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this submission' });
    }

    // Create review
    const review = new Review({
      submission: submissionId,
      reviewer: req.user._id,
      overallRating,
      categories,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      suggestions: suggestions || [],
      detailedFeedback,
      isAnonymous: isAnonymous || false,
      status: 'draft'
    });

    // Perform AI analysis on the review
    const aiAnalysisResult = aiAnalysis.analyzeText(detailedFeedback || '');
    review.aiAnalysis = {
      sentiment: aiAnalysisResult.sentiment,
      quality: {
        score: Math.round((overallRating / 5) * 100),
        factors: categories.map(cat => ({
          name: cat.name,
          score: cat.score,
          explanation: cat.comment || 'No explanation provided'
        }))
      },
      consistency: {
        score: 85, // Placeholder - would need more sophisticated analysis
        issues: []
      }
    };

    await review.save();

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review._id,
        submissionId: review.submission,
        overallRating: review.overallRating,
        status: review.status,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Submit review
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (review.status !== 'draft') {
      return res.status(400).json({ message: 'Review is not in draft status' });
    }

    // Update review status
    review.status = 'submitted';
    await review.save();

    // Update submission status if needed
    const submission = await Submission.findById(review.submission);
    if (submission.status === 'submitted') {
      submission.status = 'under_review';
      await submission.save();
    }

    res.json({
      message: 'Review submitted successfully',
      review: {
        id: review._id,
        status: review.status
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// Get reviews for a submission
router.get('/submission/:submissionId', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { includeAnonymous = false } = req.query;

    // Check if user has access to this submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const canView = submission.author.toString() === req.user._id.toString() ||
                   req.user.role === 'instructor' ||
                   req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { submission: submissionId, status: 'submitted' };
    if (!includeAnonymous) {
      query.isAnonymous = false;
    }

    const reviews = await Review.find(query)
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// Get user's reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { reviewer: req.user._id };
    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(query)
      .populate('submission', 'title type status')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// Get single review
router.get('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('submission', 'title content type author')
      .populate('reviewer', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check access permissions
    const canView = review.reviewer._id.toString() === req.user._id.toString() ||
                   review.submission.author.toString() === req.user._id.toString() ||
                   req.user.role === 'instructor' ||
                   req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Error retrieving review' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (review.status === 'approved') {
      return res.status(400).json({ message: 'Cannot update approved review' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'submission' && key !== 'reviewer') {
        review[key] = updates[key];
      }
    });

    // Re-analyze if feedback changed
    if (updates.detailedFeedback) {
      const aiAnalysisResult = aiAnalysis.analyzeText(updates.detailedFeedback);
      review.aiAnalysis.sentiment = aiAnalysisResult.sentiment;
    }

    await review.save();

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Approve review (instructor/admin only)
router.post('/:id/approve', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.status !== 'submitted') {
      return res.status(400).json({ message: 'Review is not in submitted status' });
    }

    review.status = 'approved';
    await review.save();

    // Update submission status if all reviews are approved
    const submission = await Submission.findById(review.submission);
    const totalReviews = await Review.countDocuments({
      submission: review.submission,
      status: 'approved'
    });

    if (totalReviews >= 2) { // Minimum 2 reviews required
      submission.status = 'reviewed';
      await submission.save();
    }

    res.json({
      message: 'Review approved successfully',
      review: {
        id: review._id,
        status: review.status
      }
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Error approving review' });
  }
});

// Get review statistics
router.get('/stats/overview', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$overallRating' },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]);

    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$overallRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categoryStats = await Review.aggregate([
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories.name',
          avgScore: { $avg: '$categories.score' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {},
      ratingDistribution,
      categoryStats
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Error retrieving review statistics' });
  }
});

module.exports = router;
