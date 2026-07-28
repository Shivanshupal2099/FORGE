/**
 * Socket.IO handlers for survey real-time events
 */

class SurveySocketHandler {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Join survey room for real-time updates
    this.io.on('connection', (socket) => {
      socket.on('survey:join', (surveyId) => {
        socket.join(`survey:${surveyId}`);
        console.log(`Socket ${socket.id} joined survey ${surveyId}`);
      });

      socket.on('survey:leave', (surveyId) => {
        socket.leave(`survey:${surveyId}`);
        console.log(`Socket ${socket.id} left survey ${surveyId}`);
      });

      // Join public surveys room for feed updates
      socket.on('surveys:public:join', () => {
        socket.join('surveys:public');
        console.log(`Socket ${socket.id} joined public surveys room`);
      });

      socket.on('surveys:public:leave', () => {
        socket.leave('surveys:public');
        console.log(`Socket ${socket.id} left public surveys room`);
      });

      // Join user's personal surveys room
      socket.on('surveys:user:join', (userId) => {
        socket.join(`surveys:user:${userId}`);
        console.log(`Socket ${socket.id} joined user ${userId} surveys room`);
      });

      socket.on('surveys:user:leave', (userId) => {
        socket.leave(`surveys:user:${userId}`);
        console.log(`Socket ${socket.id} left user ${userId} surveys room`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  }

  /**
   * Emit survey created event
   */
  emitSurveyCreated(survey) {
    this.io.to('surveys:public').emit('survey:created', survey);
    this.io.to(`surveys:user:${survey.creator_id}`).emit('survey:created', survey);
  }

  /**
   * Emit survey updated event
   */
  emitSurveyUpdated(survey) {
    this.io.to(`survey:${survey._id}`).emit('survey:updated', survey);
    this.io.to('surveys:public').emit('survey:updated', survey);
    this.io.to(`surveys:user:${survey.creator_id}`).emit('survey:updated', survey);
  }

  /**
   * Emit survey deleted event
   */
  emitSurveyDeleted(surveyId, creatorId) {
    this.io.to(`survey:${surveyId}`).emit('survey:deleted', { surveyId });
    this.io.to('surveys:public').emit('survey:deleted', { surveyId });
    this.io.to(`surveys:user:${creatorId}`).emit('survey:deleted', { surveyId });
  }

  /**
   * Emit question added event
   */
  emitQuestionAdded(question) {
    this.io.to(`survey:${question.surveyId}`).emit('question:added', question);
  }

  /**
   * Emit question updated event
   */
  emitQuestionUpdated(question) {
    this.io.to(`survey:${question.surveyId}`).emit('question:updated', question);
  }

  /**
   * Emit question deleted event
   */
  emitQuestionDeleted(questionId, surveyId) {
    this.io.to(`survey:${surveyId}`).emit('question:deleted', { questionId });
  }

  /**
   * Emit response submitted event
   */
  emitResponseSubmitted(response) {
    this.io.to(`survey:${response.surveyId}`).emit('response:submitted', response);
    this.io.to('surveys:public').emit('response:submitted', response);
  }

  /**
   * Emit survey analytics updated event
   */
  emitAnalyticsUpdated(surveyId, analytics) {
    this.io.to(`survey:${surveyId}`).emit('analytics:updated', { surveyId, analytics });
  }
}

module.exports = SurveySocketHandler;
