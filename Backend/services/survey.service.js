const Survey = require('../models/Survey.model');
const Question = require('../models/Question.model');
const SurveyResponse = require('../models/SurveyResponse.model');
const QuestionAnswer = require('../models/QuestionAnswer.model');
const { AppError } = require('../utils/errors');
const { sanitizeInput } = require('../utils/sanitizer');

class SurveyService {
  /**
   * Create a new survey with transaction support
   */
  async createSurvey(data, userId) {
    const { visibility, reward_amount, target_responses, target_filter, expires_at } = data;
    
    const survey = await Survey.create({
      creator_id: userId,
      visibility: visibility || 'public',
      reward_amount: reward_amount || null,
      target_responses: target_responses || 10,
      current_responses: 0,
      target_filter: target_filter || {},
      expires_at: expires_at || null
    });

    return survey;
  }

  /**
   * Get survey by ID with ownership check
   */
  async getSurveyById(surveyId, userId) {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    if (survey.creator_id.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to access this survey', 403);
    }

    return survey;
  }

  /**
   * Get all surveys for a specific user
   */
  async getUserSurveys(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const surveys = await Survey.find({ creator_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Survey.countDocuments({ creator_id: userId });

    return {
      surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get public surveys with pagination and filtering
   */
  async getPublicSurveys(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const query = {
      visibility: 'public',
      $or: [
        { expires_at: null },
        { expires_at: { $gt: now } }
      ],
      ...filters
    };

    const surveys = await Survey.find(query)
      .populate('creator_id', 'uid email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Survey.countDocuments(query);

    return {
      surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update survey with ownership check
   */
  async updateSurvey(surveyId, userId, updateData) {
    const survey = await this.getSurveyById(surveyId, userId);
    
    const sanitizedData = sanitizeInput(updateData);
    
    const updatedSurvey = await Survey.findByIdAndUpdate(
      surveyId,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    );

    return updatedSurvey;
  }

  /**
   * Delete survey with cascade delete using transaction
   */
  async deleteSurvey(surveyId, userId, session) {
    const survey = await this.getSurveyById(surveyId, userId);

    // Get all responses for this survey
    const responses = await SurveyResponse.find({ surveyId }).session(session);
    const responseIds = responses.map(r => r._id);

    // Delete all answers for these responses
    if (responseIds.length > 0) {
      await QuestionAnswer.deleteMany(
        { responseId: { $in: responseIds } },
        { session }
      );
    }

    // Delete all responses
    await SurveyResponse.deleteMany({ surveyId }, { session });

    // Delete all questions
    await Question.deleteMany({ surveyId }, { session });

    // Delete the survey
    await Survey.findByIdAndDelete(surveyId, { session });

    return { surveyId };
  }

  /**
   * Add question to survey
   */
  async addQuestion(surveyId, userId, questionData) {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    if (survey.creator_id.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to add questions to this survey', 403);
    }

    const sanitizedData = sanitizeInput(questionData);

    const question = await Question.create({
      surveyId,
      ownerId: userId,
      ...sanitizedData
    });

    return question;
  }

  /**
   * Get questions for a survey
   */
  async getSurveyQuestions(surveyId, userId = null) {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    // If user is provided, check ownership for private surveys
    if (userId && survey.visibility === 'private') {
      if (survey.creator_id.toString() !== userId.toString()) {
        throw new AppError('You do not have permission to access this survey', 403);
      }
    }

    const questions = await Question.find({ surveyId })
      .sort({ order: 1 })
      .lean();

    return questions;
  }

  /**
   * Update question with ownership check
   */
  async updateQuestion(questionId, userId, updateData) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    if (question.ownerId.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to update this question', 403);
    }

    const sanitizedData = sanitizeInput(updateData);

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    );

    return updatedQuestion;
  }

  /**
   * Delete question with ownership check
   */
  async deleteQuestion(questionId, userId) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    if (question.ownerId.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to delete this question', 403);
    }

    await Question.findByIdAndDelete(questionId);

    return { questionId };
  }

  /**
   * Reorder questions
   */
  async reorderQuestions(surveyId, userId, questions) {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    if (survey.creator_id.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to reorder questions in this survey', 403);
    }

    const updatePromises = questions.map(({ questionId, order }) =>
      Question.findByIdAndUpdate(questionId, { order })
    );

    await Promise.all(updatePromises);

    return { success: true };
  }

  /**
   * Duplicate question
   */
  async duplicateQuestion(questionId, userId) {
    const originalQuestion = await Question.findById(questionId);
    if (!originalQuestion) {
      throw new AppError('Question not found', 404);
    }

    if (originalQuestion.ownerId.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to duplicate this question', 403);
    }

    const maxOrder = await Question.findOne({ surveyId: originalQuestion.surveyId })
      .sort({ order: -1 });
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

    return duplicatedQuestion;
  }

  /**
   * Submit survey response
   */
  async submitSurveyResponse(surveyId, userId, answers) {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    // Check if survey is still accepting responses
    if (survey.expires_at && new Date(survey.expires_at) < new Date()) {
      throw new AppError('This survey has expired', 400);
    }

    if (survey.current_responses >= survey.target_responses) {
      throw new AppError('This survey has reached its response limit', 400);
    }

    // Create response
    const response = await SurveyResponse.create({
      surveyId,
      respondentId: userId,
      submitted_at: new Date()
    });

    // Create answers
    const answerPromises = Object.entries(answers).map(([questionId, answer]) =>
      QuestionAnswer.create({
        responseId: response._id,
        questionId,
        answer
      })
    );

    await Promise.all(answerPromises);

    // Update survey response count
    await Survey.findByIdAndUpdate(surveyId, {
      $inc: { current_responses: 1 }
    });

    return response;
  }

  /**
   * Get survey responses with pagination
   */
  async getSurveyResponses(surveyId, userId, page = 1, limit = 20) {
    const survey = await this.getSurveyById(surveyId, userId);

    const skip = (page - 1) * limit;

    const responses = await SurveyResponse.find({ surveyId })
      .populate('respondentId', 'uid email')
      .sort({ submitted_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SurveyResponse.countDocuments({ surveyId });

    return {
      responses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new SurveyService();
