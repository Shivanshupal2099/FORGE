const Issue = require('../models/Issue.model');

exports.createIssue = async (req, res) => {
  try {
    const { subject, description, user_email } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }

    const issue = await Issue.create({
      subject,
      description,
      user_email,
      status: 'open',
      priority: 'medium'
    });

    console.log('Issue created:', issue._id);

    res.json({
      success: true,
      message: 'Issue reported successfully',
      issue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create issue',
      error: error.message
    });
  }
};

exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ created_at: -1 });
    res.json({
      success: true,
      issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
};
