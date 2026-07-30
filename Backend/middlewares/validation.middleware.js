const { body, validationResult, param } = require('express-validator');

// Validation middleware factory
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Authentication validation rules
const authValidation = {
  googleAuth: [
    body('idToken').notEmpty().withMessage('Google ID token is required'),
    body('email').optional().isEmail().withMessage('Invalid email format').normalizeEmail(),
    validate
  ],
  syncUser: [
    body('uid').notEmpty().withMessage('UID is required'),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('name').optional().trim().isLength({ max: 255 }),
    validate
  ]
};

// Profile validation rules
const profileValidation = [
  body('uid').optional().isString().trim(),
  body('name').optional().isString().trim().isLength({ max: 255 }),
  body('bio').optional().isString().trim().isLength({ max: 2000 }),
  body('profession').optional().isString().trim().isLength({ max: 100 }),
  body('domain').optional().isString().trim().isLength({ max: 100 }),
  body('contactNumber').optional().isString().trim().isMobilePhone('any'),
  body('gender').optional().isIn(['Male', 'Female', 'Other', '']),
  body('location').optional().isString().trim().isLength({ max: 255 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  validate
];

// Event validation rules
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('onlineType').optional().isIn(['Online', 'Offline', 'Hybrid']),
  body('locationOrLink').optional().trim(),
  body('startAt').optional(),
  body('endAt').optional(),
  body('organizer').optional().trim(),
  body('registrationRequired').optional().isBoolean(),
  body('maxAttendees').optional(),
  body('visibility').optional().isIn(['Public', 'Private']),
  body('priceType').optional().isIn(['Free', 'Paid']),
  body('contactInformation').optional().trim(),
  body('imageUrl').optional().trim(),
  body('status').optional().isIn(['published']),
  validate
];

// Survey validation rules
const surveyValidation = [
  body('uid').trim().notEmpty().withMessage('UID is required'),
  body('title').optional().trim().isLength({ max: 255 }).withMessage('Title must be 255 characters or less'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('visibility').optional().isIn(['private', 'public']),
  body('target_responses').optional().isInt({ min: 1 }),
  validate
];

// Question validation rules
const questionValidation = [
  body('question').trim().isLength({ min: 1, max: 1000 }).withMessage('Question is required'),
  body('type').isIn(['text', 'paragraph', 'radio', 'checkbox', 'dropdown', 'rating', 'yes_no', 'date', 'number', 'email']),
  body('required').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 }),
  validate
];

// ID parameter validation
const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

// UID parameter validation
const uidValidation = [
  param('uid').isString().trim().notEmpty().withMessage('UID is required'),
  validate
];

// Survey ID parameter validation
const surveyIdValidation = [
  param('surveyId').isMongoId().withMessage('Invalid survey ID format'),
  validate
];

module.exports = {
  validate,
  authValidation,
  profileValidation,
  eventValidation,
  surveyValidation,
  questionValidation,
  idValidation,
  uidValidation,
  surveyIdValidation
};
