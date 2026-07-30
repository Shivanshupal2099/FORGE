const mongoose = require('mongoose');

const surveyReportSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
surveyReportSchema.index({ surveyId: 1, reportedBy: 1 }, { unique: true }); // Prevent duplicate reports from same user
surveyReportSchema.index({ status: 1 });
surveyReportSchema.index({ reportedAt: -1 });

module.exports = mongoose.model('SurveyReport', surveyReportSchema);
