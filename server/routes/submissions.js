const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const Submission = require('../models/Submission');
const aiAnalysis = require('../services/aiAnalysis');

const router = express.Router();

// Test endpoint to verify submissions route is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Submissions route is working!', 
    timestamp: new Date().toISOString() 
  });
});

// Test submission creation without auth (for debugging)
router.post('/test-create', async (req, res) => {
  try {
    console.log('🧪 Test submission creation with data:', req.body);
    
    const { title, content, type = 'text' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create a test submission without saving to database
    const testSubmission = {
      title,
      content,
      type,
      description: req.body.description || '',
      programmingLanguage: req.body.programmingLanguage || '',
      course: req.body.course || '',
      assignment: req.body.assignment || '',
      tags: req.body.tags || [],
      author: 'test-user-id',
      status: 'draft'
    };

    console.log('✅ Test submission data processed:', testSubmission);
    
    res.json({
      message: 'Test submission processed successfully',
      submission: testSubmission
    });
  } catch (error) {
    console.error('❌ Test submission error:', error);
    res.status(500).json({ 
      message: 'Test submission failed',
      error: error.message
    });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/javascript',
      'text/python',
      'text/java',
      'text/cpp',
      'text/c',
      'text/html',
      'text/css'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|json|js|py|java|cpp|c|html|css)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only text and code files are allowed.'));
    }
  }
});

// Create new submission (without file upload)
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Creating submission with data:', {
      title: req.body.title,
      type: req.body.type,
      hasContent: !!req.body.content,
      user: req.user._id,
      bodyKeys: Object.keys(req.body)
    });

    const {
      title,
      description = '',
      content,
      type = 'text',
      language = '',
      course = '',
      assignment = '',
      tags = []
    } = req.body;

    if (!title || !content) {
      console.log('❌ Missing required fields:', { title: !!title, content: !!content });
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Validate type
    if (!['text', 'code', 'mixed'].includes(type)) {
      console.log('❌ Invalid type:', type);
      return res.status(400).json({ message: 'Type must be text, code, or mixed' });
    }

    // Process tags
    let processedTags = [];
    if (tags && typeof tags === 'string') {
      processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(tags)) {
      processedTags = tags.filter(tag => tag && tag.trim().length > 0);
    }

    console.log('📝 Processed data:', {
      title,
      description,
      type,
      language,
      course,
      assignment,
      tags: processedTags,
      contentLength: content.length
    });

    // Create submission
    const submission = new Submission({
      title,
      description,
      content,
      type,
      language,
      author: req.user._id,
      course,
      assignment,
      tags: processedTags,
      files: [], // No files for now
      status: 'draft'
    });

    // Calculate basic metrics
    const words = content.split(/\s+/).filter(word => word.length > 0);
    submission.metrics = {
      wordCount: words.length,
      characterCount: content.length,
      lineCount: content.split('\n').length,
      complexityScore: 0
    };

    console.log('💾 Attempting to save submission...');
    const savedSubmission = await submission.save();
    console.log('✅ Submission created successfully:', savedSubmission._id);

    // Run plagiarism detection in the background
    setTimeout(async () => {
      try {
        console.log('🔍 Running plagiarism detection for submission:', savedSubmission._id);
        
        // Get other submissions to compare against
        const submissionsToCheck = await Submission.find({
          _id: { $ne: savedSubmission._id },
          content: { $exists: true, $ne: '' },
          $or: [
            { type: type },
            { type: 'mixed' }
          ]
        }).select('content title author type');

        console.log(`Found ${submissionsToCheck.length} submissions to check for plagiarism`);

        // Run plagiarism detection
        const plagiarismResults = await aiAnalysis.detectPlagiarism(content, submissionsToCheck);
        
        console.log('Plagiarism check completed:', {
          score: plagiarismResults.score,
          sourcesFound: plagiarismResults.sources.length
        });

        // Update submission with plagiarism results
        const updatedSubmission = await Submission.findByIdAndUpdate(
          savedSubmission._id,
          {
            $set: {
              'analysis.plagiarism.score': plagiarismResults.score,
              'analysis.plagiarism.sources': plagiarismResults.sources.map(s => ({
                url: s.submissionId,
                similarity: s.similarity,
                text: s.title
              }))
            }
          },
          { new: true }
        );

        console.log('✅ Plagiarism analysis saved for submission:', savedSubmission._id);
      } catch (error) {
        console.error('❌ Error running plagiarism detection:', error);
      }
    }, 2000); // Run after 2 seconds

    res.status(201).json({
      message: 'Submission created successfully',
      submission: {
        id: savedSubmission._id,
        title: savedSubmission.title,
        status: savedSubmission.status,
        createdAt: savedSubmission.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create submission error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      errors: error.errors
    });

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate submission',
        error: 'A submission with this title already exists'
      });
    }

    res.status(500).json({ 
      message: 'Error creating submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new submission with file upload (alternative endpoint)
router.post('/with-files', auth, upload.array('files', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      type,
      language,
      course,
      assignment,
      tags
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];

    // Create submission
    const submission = new Submission({
      title,
      description,
      content,
      type: type || 'text',
      language,
      author: req.user._id,
      course,
      assignment,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      files,
      status: 'draft'
    });

    // Calculate basic metrics
    const words = content.split(/\s+/).filter(word => word.length > 0);
    submission.metrics = {
      wordCount: words.length,
      characterCount: content.length,
      lineCount: content.split('\n').length,
      complexityScore: 0
    };

    await submission.save();

    res.status(201).json({
      message: 'Submission created successfully',
      submission: {
        id: submission._id,
        title: submission.title,
        status: submission.status,
        createdAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Error creating submission' });
  }
});

// Get all submissions (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      course,
      assignment,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters based on user role
    if (req.user.role === 'student') {
      query.author = req.user._id;
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (course) query.course = course;
    if (assignment) query.assignment = assignment;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const submissions = await Submission.find(query)
      .populate('author', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude content for list view

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Error retrieving submissions' });
  }
});

// Get single submission
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('author', 'name email institution department')
      .populate('feedback.reviewer', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check access permissions
    if (submission.author._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'instructor' &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Error retrieving submission' });
  }
});

// Update submission
router.put('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check ownership
    if (submission.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow updates if already reviewed
    if (submission.status === 'reviewed') {
      return res.status(400).json({ message: 'Cannot update reviewed submission' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        submission[key] = updates[key];
      }
    });

    // Recalculate metrics if content changed
    if (updates.content) {
      const words = updates.content.split(/\s+/).filter(word => word.length > 0);
      submission.metrics = {
        wordCount: words.length,
        characterCount: updates.content.length,
        lineCount: updates.content.split('\n').length,
        complexityScore: submission.metrics.complexityScore
      };
    }

    await submission.save();

    res.json({
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Error updating submission' });
  }
});

// Submit for review
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (submission.status !== 'draft') {
      return res.status(400).json({ message: 'Submission is not in draft status' });
    }

    // Perform AI analysis
    let analysis = {};
    if (submission.type === 'text' || submission.type === 'mixed') {
      analysis.text = aiAnalysis.analyzeText(submission.content);
    }
    if (submission.type === 'code' || submission.type === 'mixed') {
      analysis.code = aiAnalysis.analyzeCode(submission.content, submission.language);
    }

    // Detect plagiarism
    console.log('Fetching submissions for plagiarism check...');
    const submissionsToCheck = await Submission.find({
      _id: { $ne: submission._id },
      content: { $exists: true, $ne: '' }, // Ensure content exists and is not empty
      $or: [
        { type: submission.type }, // Same type
        { type: 'mixed' } // Or mixed content
      ]
    }).select('content title author type');

    console.log(`Found ${submissionsToCheck.length} submissions to check for plagiarism`);

    const plagiarismResults = await aiAnalysis.detectPlagiarism(submission.content, submissionsToCheck);
    console.log('Plagiarism check completed:', {
      score: plagiarismResults.score,
      sourcesFound: plagiarismResults.sources.length,
      totalSources: plagiarismResults.totalSources
    });
    analysis.plagiarism = plagiarismResults;

    // Update submission
    submission.status = 'submitted';
    submission.analysis = analysis;
    submission.metrics.complexityScore = analysis.text?.complexity?.score || analysis.code?.complexity?.score || 0;

    await submission.save();

    res.json({
      message: 'Submission submitted for review',
      analysis,
      submission: {
        id: submission._id,
        status: submission.status,
        analysis: submission.analysis
      }
    });
  } catch (error) {
    console.error('Submit submission error:', error);
    res.status(500).json({ message: 'Error submitting for review' });
  }
});

// Delete submission
router.delete('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check ownership or admin role
    if (submission.author.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Error deleting submission' });
  }
});

// Get submission statistics
router.get('/stats/overview', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          avgWordCount: { $avg: '$metrics.wordCount' },
          avgComplexityScore: { $avg: '$metrics.complexityScore' },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]);

    const statusBreakdown = await Submission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeBreakdown = await Submission.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {},
      statusBreakdown,
      typeBreakdown
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
});

module.exports = router;
