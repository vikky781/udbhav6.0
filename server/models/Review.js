const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: [{
    name: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  }],
  strengths: [{
    type: String,
    maxlength: [200, 'Strength comment cannot exceed 200 characters']
  }],
  weaknesses: [{
    type: String,
    maxlength: [200, 'Weakness comment cannot exceed 200 characters']
  }],
  suggestions: [{
    type: String,
    maxlength: [200, 'Suggestion cannot exceed 200 characters']
  }],
  detailedFeedback: {
    type: String,
    maxlength: [2000, 'Detailed feedback cannot exceed 2000 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved'],
    default: 'draft'
  },
  aiAnalysis: {
    sentiment: {
      score: Number,
      magnitude: Number,
      label: String
    },
    quality: {
      score: Number,
      factors: [{
        name: String,
        score: Number,
        explanation: String
      }]
    },
    consistency: {
      score: Number,
      issues: [String]
    }
  }
}, {
  timestamps: true
});

// Ensure one review per reviewer per submission
reviewSchema.index({ submission: 1, reviewer: 1 }, { unique: true });

// Index for querying reviews
reviewSchema.index({ submission: 1, status: 1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
