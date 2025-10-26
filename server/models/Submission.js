const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: false,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  type: {
    type: String,
    enum: ['text', 'code', 'mixed'],
    required: [true, 'Submission type is required']
  },
  programmingLanguage: {
    type: String,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: String,
    trim: true
  },
  assignment: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'reviewed', 'rejected'],
    default: 'draft'
  },
  analysis: {
    sentiment: {
      score: Number,
      magnitude: Number,
      label: String
    },
    readability: {
      score: Number,
      level: String
    },
    complexity: {
      score: Number,
      level: String
    },
    plagiarism: {
      score: Number,
      sources: [{
        url: String,
        similarity: Number,
        text: String
      }]
    }
  },
  feedback: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    categories: [{
      name: String,
      score: Number,
      comment: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metrics: {
    wordCount: Number,
    characterCount: Number,
    lineCount: Number,
    complexityScore: Number
  },
  files: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }]
}, {
  timestamps: true
});

// Index for search functionality
submissionSchema.index({ title: 'text', description: 'text', content: 'text' });
submissionSchema.index({ author: 1, status: 1 });
submissionSchema.index({ course: 1, assignment: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
