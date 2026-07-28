/**
 * Data Transfer Objects for Survey operations
 */

class CreateSurveyDTO {
  constructor(data) {
    this.visibility = data.visibility || 'public';
    this.reward_amount = data.reward_amount || null;
    this.target_responses = data.target_responses || 10;
    this.target_filter = data.target_filter || {};
    this.expires_at = data.expires_at || null;
  }

  validate() {
    const errors = [];

    if (this.target_responses && (this.target_responses < 1 || this.target_responses > 10000)) {
      errors.push('target_responses must be between 1 and 10000');
    }

    if (this.reward_amount !== null && (this.reward_amount < 0 || this.reward_amount > 1000000)) {
      errors.push('reward_amount must be between 0 and 1000000');
    }

    if (this.expires_at && new Date(this.expires_at) < new Date()) {
      errors.push('expires_at must be in the future');
    }

    return errors;
  }
}

class UpdateSurveyDTO {
  constructor(data) {
    this.visibility = data.visibility;
    this.reward_amount = data.reward_amount;
    this.target_responses = data.target_responses;
    this.target_filter = data.target_filter;
    this.expires_at = data.expires_at;
  }

  validate() {
    const errors = [];
    const validFields = ['visibility', 'reward_amount', 'target_responses', 'target_filter', 'expires_at'];

    for (const key in this) {
      if (this[key] !== undefined && !validFields.includes(key)) {
        errors.push(`Invalid field: ${key}`);
      }
    }

    if (this.target_responses && (this.target_responses < 1 || this.target_responses > 10000)) {
      errors.push('target_responses must be between 1 and 10000');
    }

    return errors;
  }
}

class CreateQuestionDTO {
  constructor(data) {
    this.question = data.question;
    this.type = data.type;
    this.required = data.required !== undefined ? data.required : false;
    this.options = data.options || [];
    this.order = data.order || 0;
  }

  validate() {
    const errors = [];
    const validTypes = ['text', 'paragraph', 'radio', 'checkbox', 'dropdown', 'rating', 'yes_no', 'date', 'number', 'email'];

    if (!this.question || this.question.trim().length === 0) {
      errors.push('Question text is required');
    }

    if (this.question && this.question.length > 1000) {
      errors.push('Question text must be less than 1000 characters');
    }

    if (!validTypes.includes(this.type)) {
      errors.push(`Invalid question type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (['radio', 'checkbox', 'dropdown'].includes(this.type) && (!this.options || this.options.length < 2)) {
      errors.push('Radio, checkbox, and dropdown questions must have at least 2 options');
    }

    if (this.order < 0) {
      errors.push('Order must be a non-negative number');
    }

    return errors;
  }
}

class UpdateQuestionDTO {
  constructor(data) {
    this.question = data.question;
    this.type = data.type;
    this.required = data.required;
    this.options = data.options;
    this.order = data.order;
  }

  validate() {
    const errors = [];
    const validFields = ['question', 'type', 'required', 'options', 'order'];

    for (const key in this) {
      if (this[key] !== undefined && !validFields.includes(key)) {
        errors.push(`Invalid field: ${key}`);
      }
    }

    const validTypes = ['text', 'paragraph', 'radio', 'checkbox', 'dropdown', 'rating', 'yes_no', 'date', 'number', 'email'];

    if (this.type && !validTypes.includes(this.type)) {
      errors.push(`Invalid question type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (this.question && this.question.length > 1000) {
      errors.push('Question text must be less than 1000 characters');
    }

    return errors;
  }
}

class SubmitResponseDTO {
  constructor(data) {
    this.answers = data.answers || {};
  }

  validate() {
    const errors = [];

    if (!this.answers || Object.keys(this.answers).length === 0) {
      errors.push('At least one answer is required');
    }

    return errors;
  }
}

module.exports = {
  CreateSurveyDTO,
  UpdateSurveyDTO,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  SubmitResponseDTO
};
