const Survey = require('../models/Survey.model');
const User = require('../models/Users.model');
const Question = require('../models/Question.model');
const SurveyResponse = require('../models/SurveyResponse.model');
const QuestionAnswer = require('../models/QuestionAnswer.model');
const Profile = require('../models/Profile.model');
const { awardSurveyTokens } = require('./token.controller');

// Create a new survey
exports.createSurvey = async (req, res) => {
  try {
    console.log('Received survey creation request');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    const { uid, title, visibility, reward_amount, target_responses, target_filter, expires_at } = req.body;

    // Find user by UID
    const user = await User.findOne({ uid });
    
    if (!user) {
      console.log('User not found with UID:', uid);
      console.log('Available users in database:');
      const allUsers = await User.find({}, { uid: 1, email: 1 });
      console.log(allUsers.map(u => ({ uid: u.uid, email: u.email })));
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user._id, user.email);

    // Create new survey
    const survey = await Survey.create({
      creator_id: user._id,
      title: title || 'Untitled Survey',
      visibility: visibility || 'public',
      reward_amount,
      target_responses,
      current_responses: 0,
      target_filter: target_filter || {},
      expires_at: expires_at || null
    });

    console.log('Survey created successfully:', survey._id);

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      console.log('Emitting survey:created event via WebSocket');
      io.emit('survey:created', survey);
    } else {
      console.log('Socket.io not available in app');
    }

    res.json({
      success: true,
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating survey',
      error: error.message
    });
  }
};

// Get all surveys created by a user
exports.getUserSurveys = async (req, res) => {
  try {
    console.log('Received get user surveys request');
    const { uid } = req.params;

    // Find user by UID
    const user = await User.findOne({ uid });
    
    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all surveys created by this user
    const surveys = await Survey.find({ creator_id: user._id })
      .sort({ created_at: -1 });

    console.log(`Found ${surveys.length} surveys for user ${uid}`);

    res.json({
      success: true,
      surveys
    });
  } catch (error) {
    console.error('Error fetching user surveys:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching user surveys',
      error: error.message
    });
  }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    res.json({
      success: true,
      survey
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey',
      error: error.message
    });
  }
};

// Update survey
exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility, target_responses, expires_at } = req.body;

    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this survey'
      });
    }

    const updatedSurvey = await Survey.findByIdAndUpdate(
      id,
      {
        visibility: visibility || survey.visibility,
        target_responses: target_responses || survey.target_responses,
        expires_at: expires_at !== undefined ? expires_at : survey.expires_at
      },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Survey updated successfully',
      survey: updatedSurvey
    });
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating survey',
      error: error.message
    });
  }
};

// Delete survey with cascade delete
exports.deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this survey'
      });
    }

    // Get all responses for this survey
    const responses = await SurveyResponse.find({ surveyId: id });
    const responseIds = responses.map(r => r._id);

    // Delete all answers for these responses
    if (responseIds.length > 0) {
      await QuestionAnswer.deleteMany({ responseId: { $in: responseIds } });
    }

    // Delete all responses
    await SurveyResponse.deleteMany({ surveyId: id });

    // Delete all questions
    await Question.deleteMany({ surveyId: id });

    // Delete the survey
    await Survey.findByIdAndDelete(id);

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('survey:deleted', { surveyId: id });
    }

    res.json({
      success: true,
      message: 'Survey and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting survey',
      error: error.message
    });
  }
};

// Publish survey (deprecated - no longer needed with status removal)
exports.publishSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to publish this survey'
      });
    }

    // Check minimum question requirement (at least 1 question)
    const questionsCount = await Question.countDocuments({ surveyId: id });
    if (questionsCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Survey must have at least 1 question to be published'
      });
    }

    // Status concept removed - survey is always "published" when created
    res.json({
      success: true,
      message: 'Survey is already active',
      survey
    });
  } catch (error) {
    console.error('Error publishing survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing survey',
      error: error.message
    });
  }
};

// Close survey (deprecated - no longer needed with status removal)
exports.closeSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to close this survey'
      });
    }

    // Status concept removed - surveys don't need to be closed
    res.json({
      success: true,
      message: 'Survey status management removed',
      survey
    });
  } catch (error) {
    console.error('Error closing survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing survey',
      error: error.message
    });
  }
};

// Get public surveys with pagination
exports.getPublicSurveys = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const surveys = await Survey.find({
      visibility: 'public',
      $or: [
        { expires_at: { $gt: new Date() } },
        { expires_at: null }
      ]
    })
    .populate('creator_id', 'uid email')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

    // Fetch profile names for each survey creator
    const surveysWithCreatorNames = await Promise.all(
      surveys.map(async (survey) => {
        if (survey.creator_id) {
          const profile = await Profile.findOne({ user_id: survey.creator_id._id });
          return {
            ...survey.toObject(),
            creator_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Anonymous'
          };
        }
        return {
          ...survey.toObject(),
          creator_name: 'Anonymous'
        };
      })
    );

    const total = await Survey.countDocuments({
      visibility: 'public',
      $or: [
        { expires_at: { $gt: new Date() } },
        { expires_at: null }
      ]
    });

    res.json({
      success: true,
      surveys: surveysWithCreatorNames,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public surveys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public surveys',
      error: error.message
    });
  }
};

// ==================== Question APIs ====================

// Add question to survey
exports.addQuestion = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { question, type, required, options, order } = req.body;

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add questions to this survey'
      });
    }

    // Check if survey already has maximum questions (2)
    const existingQuestionsCount = await Question.countDocuments({ surveyId });
    if (existingQuestionsCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 2 questions per survey reached'
      });
    }

    // Validate question type
    const validTypes = ['text', 'paragraph', 'radio', 'checkbox', 'dropdown', 'rating', 'yes_no', 'date', 'number', 'email'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question type'
      });
    }

    // Validate that radio and checkbox questions have options
    if (['radio', 'checkbox'].includes(type)) {
      if (!options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({
          success: false,
          message: `${type} questions must have at least one option`
        });
      }
    }

    // Get the next order if not provided
    let questionOrder = order;
    if (questionOrder === undefined) {
      const maxOrder = await Question.findOne({ surveyId }).sort({ order: -1 });
      questionOrder = maxOrder ? maxOrder.order + 1 : 0;
    }

    const newQuestion = await Question.create({
      surveyId,
      ownerId: req.user._id,
      question,
      type,
      required: required || false,
      options: options || [],
      order: questionOrder
    });

    res.json({
      success: true,
      message: 'Question added successfully',
      question: newQuestion
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message
    });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, type, required, options } = req.body;

    const questionDoc = await Question.findById(questionId);
    
    if (!questionDoc) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership
    if (questionDoc.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this question'
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        question: question || questionDoc.question,
        type: type || questionDoc.type,
        required: required !== undefined ? required : questionDoc.required,
        options: options !== undefined ? options : questionDoc.options
      },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const questionDoc = await Question.findById(questionId);
    
    if (!questionDoc) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership
    if (questionDoc.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this question'
      });
    }

    await Question.findByIdAndDelete(questionId);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// Reorder questions
exports.reorderQuestions = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { questions } = req.body; // Array of { questionId, order }

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reorder questions in this survey'
      });
    }

    // Update each question's order
    const updatePromises = questions.map(({ questionId, order }) =>
      Question.findByIdAndUpdate(questionId, { order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Questions reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering questions',
      error: error.message
    });
  }
};

// Duplicate question
exports.duplicateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const originalQuestion = await Question.findById(questionId);
    
    if (!originalQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership
    if (originalQuestion.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to duplicate this question'
      });
    }

    // Get the next order
    const maxOrder = await Question.findOne({ surveyId: originalQuestion.surveyId }).sort({ order: -1 });
    const newOrder = maxOrder ? maxOrder.order + 1 : 0;

    const duplicatedQuestion = await Question.create({
      surveyId: originalQuestion.surveyId,
      ownerId: originalQuestion.ownerId,
      question: originalQuestion.question + ' (copy)',
      type: originalQuestion.type,
      required: originalQuestion.required,
      options: [...originalQuestion.options],
      order: newOrder
    });

    res.json({
      success: true,
      message: 'Question duplicated successfully',
      question: duplicatedQuestion
    });
  } catch (error) {
    console.error('Error duplicating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating question',
      error: error.message
    });
  }
};

// Get survey questions
exports.getSurveyQuestions = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership or if survey is public
    // If no user (public access), only allow if survey is public
    if (req.user && survey.creator_id.toString() !== req.user._id.toString() && survey.visibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view questions in this survey'
      });
    }

    // If no user (public access), only allow if survey is public
    if (!req.user && survey.visibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view questions in this survey'
      });
    }

    const questions = await Question.find({ surveyId }).sort({ order: 1 });

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey questions',
      error: error.message
    });
  }
};

// ==================== Response APIs ====================

// Submit survey response
exports.submitSurveyResponse = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { answers, anonymous } = req.body;

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check if survey has expired
    if (survey.expires_at && new Date(survey.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Survey has expired'
      });
    }

    // Check if user has already submitted a response (unless anonymous)
    if (!anonymous && req.user._id) {
      const existingResponse = await SurveyResponse.findOne({
        surveyId,
        submittedBy: req.user._id
      });
      
      if (existingResponse) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a response to this survey'
        });
      }
    }

    // Get survey questions
    const questions = await Question.find({ surveyId }).sort({ order: 1 });

    // Validate required questions are answered
    for (const question of questions) {
      if (question.required && (!answers[question._id] || answers[question._id].trim() === '')) {
        return res.status(400).json({
          success: false,
          message: `Required question "${question.question}" is not answered`
        });
      }
    }

    // Create survey response
    const response = await SurveyResponse.create({
      surveyId,
      submittedBy: anonymous ? null : req.user._id,
      anonymous: anonymous || false,
      submittedAt: new Date()
    });

    // Create answers for each question response
    const answerPromises = Object.entries(answers).map(([questionId, answer]) => {
      return QuestionAnswer.create({
        responseId: response._id,
        surveyId,
        questionId,
        answer
      });
    });

    await Promise.all(answerPromises);

    // Update survey response count
    await Survey.findByIdAndUpdate(surveyId, {
      $inc: { current_responses: 1 }
    });

    // Award tokens for survey completion (only for non-anonymous responses)
    let tokenAward = null;
    if (!anonymous && req.user.email) {
      try {
        tokenAward = await awardSurveyTokens(req.user.email, surveyId);
        console.log('Tokens awarded:', tokenAward);
      } catch (tokenError) {
        console.error('Error awarding tokens:', tokenError);
        // Don't fail the response submission if token awarding fails
      }
    }

    res.json({
      success: true,
      message: 'Survey response submitted successfully',
      responseId: response._id,
      tokensAwarded: tokenAward ? tokenAward.amount : null,
      totalTokens: tokenAward ? tokenAward.total_tokens : null
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting survey response',
      error: error.message
    });
  }
};

// Get survey responses
exports.getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view responses for this survey'
      });
    }

    const responses = await SurveyResponse.find({ surveyId })
      .sort({ submittedAt: -1 })
      .populate({
        path: 'submittedBy',
        select: 'email'
      });

    // Get profile names for each response
    const Profile = require('../models/Profile.model');
    const responsesWithNames = await Promise.all(
      responses.map(async (response) => {
        if (response.submittedBy) {
          const profile = await Profile.findOne({ user_id: response.submittedBy._id });
          return {
            ...response.toObject(),
            submittedBy: {
              ...response.submittedBy.toObject(),
              name: profile ? `${profile.first_name} ${profile.last_name}` : 'Anonymous'
            }
          };
        }
        return {
          ...response.toObject(),
          submittedBy: {
            name: 'Anonymous'
          }
        };
      })
    );

    res.json({
      success: true,
      responses: responsesWithNames
    });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey responses',
      error: error.message
    });
  }
};

// Get single response with answers
exports.getSingleResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await SurveyResponse.findById(responseId)
      .populate('surveyId');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check ownership
    const survey = response.surveyId;
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this response'
      });
    }

    // Get answers for this response
    const answers = await QuestionAnswer.find({ responseId })
      .populate('questionId', 'question type options');

    res.json({
      success: true,
      response,
      answers
    });
  } catch (error) {
    console.error('Error fetching single response:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching single response',
      error: error.message
    });
  }
};

// Delete response
exports.deleteResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await SurveyResponse.findById(responseId)
      .populate('surveyId');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check ownership
    const survey = response.surveyId;
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this response'
      });
    }

    // Delete all answers for this response
    await QuestionAnswer.deleteMany({ responseId });

    // Delete the response
    await SurveyResponse.findByIdAndDelete(responseId);

    // Update survey response count
    await Survey.findByIdAndUpdate(survey._id, {
      $inc: { current_responses: -1 }
    });

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting response',
      error: error.message
    });
  }
};

// Report survey
exports.reportSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { reason } = req.body;

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Create survey report
    const SurveyReport = require('../models/SurveyReport.model');
    await SurveyReport.create({
      surveyId,
      reportedBy: req.user._id,
      reason,
      reportedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Survey reported successfully'
    });
  } catch (error) {
    console.error('Error reporting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting survey',
      error: error.message
    });
  }
};

// Export responses
exports.exportResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check ownership
    if (survey.creator_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to export responses for this survey'
      });
    }

    const responses = await SurveyResponse.find({ surveyId })
      .sort({ submittedAt: -1 })
      .populate('submittedBy', 'email');

    const questions = await Question.find({ surveyId }).sort({ order: 1 });

    // Build CSV data
    const headers = ['Response ID', 'Submitted At', 'Submitted By', ...questions.map(q => q.question)];
    const rows = responses.map(response => {
      const answers = {};
      return QuestionAnswer.find({ responseId: response._id }).then(answerDocs => {
        answerDocs.forEach(answer => {
          const question = questions.find(q => q._id.toString() === answer.questionId.toString());
          if (question) {
            answers[question.question] = Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer;
          }
        });
        return [
          response._id,
          response.submittedAt,
          response.submittedBy?.email || 'Anonymous',
          ...questions.map(q => answers[q.question] || '')
        ];
      });
    });

    const allRows = await Promise.all(rows);
    const csvContent = [headers, ...allRows].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey_${survey._id}_responses.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting responses',
      error: error.message
    });
  }
};
