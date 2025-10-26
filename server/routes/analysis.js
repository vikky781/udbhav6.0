const express = require('express');
const { auth } = require('../middleware/auth');
const aiAnalysis = require('../services/aiAnalysis');
const Submission = require('../models/Submission');

const router = express.Router();

// Analyze text content
router.post('/text', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const analysis = aiAnalysis.analyzeText(content);
    const feedback = aiAnalysis.generateFeedback(analysis);

    res.json({
      analysis,
      feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Text analysis error:', error);
    res.status(500).json({ message: 'Error analyzing text' });
  }
});

// Analyze code content
router.post('/code', auth, async (req, res) => {
  try {
    const { content, language } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Code content is required' });
    }

    const analysis = aiAnalysis.analyzeCode(content, language || 'javascript');

    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ message: 'Error analyzing code' });
  }
});

// Detect plagiarism
router.post('/plagiarism', auth, async (req, res) => {
  try {
    const { content, submissionId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Get other submissions for comparison
    const submissions = await Submission.find({
      _id: { $ne: submissionId },
      status: { $in: ['submitted', 'under_review', 'reviewed'] }
    }).select('content title author');

    const plagiarismResult = await aiAnalysis.detectPlagiarism(content, submissions);

    res.json({
      plagiarism: plagiarismResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Plagiarism detection error:', error);
    res.status(500).json({ message: 'Error detecting plagiarism' });
  }
});

// Comprehensive analysis
router.post('/comprehensive', auth, async (req, res) => {
  try {
    const { content, type, language, submissionId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let analysis = {};
    let plagiarismResult = null;

    // Perform text analysis
    if (type === 'text' || type === 'mixed') {
      analysis.text = aiAnalysis.analyzeText(content);
    }

    // Perform code analysis
    if (type === 'code' || type === 'mixed') {
      analysis.code = aiAnalysis.analyzeCode(content, language || 'javascript');
    }

    // Detect plagiarism
    if (submissionId) {
      const submissions = await Submission.find({
        _id: { $ne: submissionId },
        status: { $in: ['submitted', 'under_review', 'reviewed'] }
      }).select('content title author');

      plagiarismResult = await aiAnalysis.detectPlagiarism(content, submissions);
    }

    // Generate comprehensive feedback
    const feedback = aiAnalysis.generateFeedback(analysis.text || {});

    res.json({
      analysis,
      plagiarism: plagiarismResult,
      feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    res.status(500).json({ message: 'Error performing comprehensive analysis' });
  }
});

// Get analysis history for a submission
router.get('/history/:submissionId', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user has access to this submission
    if (submission.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'instructor' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      analysis: submission.analysis,
      feedback: submission.feedback,
      metrics: submission.metrics
    });
  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({ message: 'Error retrieving analysis history' });
  }
});

// Batch analysis for multiple submissions
router.post('/batch', auth, async (req, res) => {
  try {
    const { submissionIds } = req.body;

    if (!submissionIds || !Array.isArray(submissionIds)) {
      return res.status(400).json({ message: 'Submission IDs array is required' });
    }

    const submissions = await Submission.find({
      _id: { $in: submissionIds },
      $or: [
        { author: req.user._id },
        ...(req.user.role === 'instructor' || req.user.role === 'admin' ? [{}] : [])
      ]
    });

    const results = [];

    for (const submission of submissions) {
      let analysis = {};
      
      if (submission.type === 'text' || submission.type === 'mixed') {
        analysis.text = aiAnalysis.analyzeText(submission.content);
      }
      
      if (submission.type === 'code' || submission.type === 'mixed') {
        analysis.code = aiAnalysis.analyzeCode(submission.content, submission.language);
      }

      results.push({
        submissionId: submission._id,
        title: submission.title,
        analysis,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ message: 'Error performing batch analysis' });
  }
});

module.exports = router;
