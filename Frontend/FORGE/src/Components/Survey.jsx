import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaClipboardList } from 'react-icons/fa';
import './Survey.css';

const createEmptyOption = () => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  value: '',
  imageFile: null,
});

const createEmptyQuestion = () => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  questionText: '',
  answerType: 'text',
  optionType: 'text',
  options: [createEmptyOption()],
});


function ToggleGroup({ label, value, onChange, options }) {
  return (
    <div className="survey-toggle-group">
      <span className="survey-toggle-group__label">{label}</span>
      <div className="survey-toggle-group__options">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`survey-toggle-group__option ${isActive ? 'survey-toggle-group__option--active' : ''}`}
            >
              <span className="survey-toggle-group__icon">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PopupModal({ type, message, onClose, onConfirm }) {
  return (
    <div className="survey-popup-overlay" onClick={onClose}>
      <div className="survey-popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="survey-popup-icon">
          {type === 'confirm' ? '🗑️' : '🎉'}
        </div>
        <p className="survey-popup-message">{message}</p>
        <div className="survey-popup-actions">
          {type === 'confirm' ? (
            <>
              <button
                type="button"
                className="button-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-danger"
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              className="button-primary"
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Survey() {
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: [createEmptyQuestion()],
  });

  const [activeTab, setActiveTab] = useState('create');
  const [createdSurveys, setCreatedSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const surveys = JSON.parse(localStorage.getItem('forge_surveys') || '[]');
    setCreatedSurveys(surveys);
  }, []);

  const loadSurveys = () => {
    const surveys = JSON.parse(localStorage.getItem('forge_surveys') || '[]');
    setCreatedSurveys(surveys);
  };

  const deleteSurvey = (surveyId) => {
    setPopup({
      type: 'confirm',
      message: 'Are you sure you want to delete this survey?',
      onConfirm: () => {
        const existingSurveys = JSON.parse(localStorage.getItem('forge_surveys') || '[]');
        const updatedSurveys = existingSurveys.filter((s) => s.id !== surveyId);
        localStorage.setItem('forge_surveys', JSON.stringify(updatedSurveys));
        setCreatedSurveys(updatedSurveys);
        if (expandedSurveyId === surveyId) {
          setExpandedSurveyId(null);
        }
      },
    });
  };

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const toggleExpandSurvey = (surveyId) => {
    setExpandedSurveyId((prev) => (prev === surveyId ? null : surveyId));
  };

  useEffect(() => {
    const imageUrls = survey.questions.flatMap((question) =>
      question.options
        .map((option) => option.value)
        .filter((value) => value.startsWith('blob:'))
    );

    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [survey.questions]);

  const updateSurveyField = (event) => {
    const { name, value } = event.target;
    setSurvey((prev) => ({ ...prev, [name]: value }));
  };

  const updateQuestionField = (questionId, field, value) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        if (field === 'answerType') {
          if (value === 'text') {
            return { ...question, answerType: value, options: [createEmptyOption()] };
          }

          return {
            ...question,
            answerType: value,
            options: question.options.length > 0 ? question.options : [createEmptyOption()],
          };
        }

        if (field === 'optionType') {
          question.options.forEach((option) => {
            if (option.value.startsWith('blob:')) {
              URL.revokeObjectURL(option.value);
            }
          });

          return {
            ...question,
            optionType: value,
            options: [createEmptyOption()],
          };
        }

        return { ...question, [field]: value };
      }),
    }));
  };

  const updateOptionText = (questionId, optionId, value) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId ? { ...option, value } : option
          ),
        };
      }),
    }));
  };

  const handleOptionImageUpload = (questionId, optionId, event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            if (option.value.startsWith('blob:')) {
              URL.revokeObjectURL(option.value);
            }

            return {
              ...option,
              imageFile: selectedFile,
              value: URL.createObjectURL(selectedFile),
            };
          }),
        };
      }),
    }));

    event.target.value = '';
  };

  const addQuestion = () => {
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  };

  const removeQuestion = (questionId) => {
    setSurvey((prev) => {
      const questionToRemove = prev.questions.find((question) => question.id === questionId);
      questionToRemove?.options.forEach((option) => {
        if (option.value.startsWith('blob:')) {
          URL.revokeObjectURL(option.value);
        }
      });

      return {
        ...prev,
        questions: prev.questions.filter((question) => question.id !== questionId),
      };
    });
  };

  const addOption = (questionId) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return { ...question, options: [...question.options, createEmptyOption()] };
      }),
    }));
  };

  const removeOption = (questionId, optionId) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const optionToRemove = question.options.find((option) => option.id === optionId);
        if (optionToRemove?.value.startsWith('blob:')) {
          URL.revokeObjectURL(optionToRemove.value);
        }

        const nextOptions = question.options.filter((option) => option.id !== optionId);
        return { ...question, options: nextOptions.length ? nextOptions : [createEmptyOption()] };
      }),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const newSurvey = {
      id: Date.now().toString(),
      ...survey,
      createdAt: new Date().toISOString(),
    };

    const existingSurveys = JSON.parse(localStorage.getItem('forge_surveys') || '[]');
    const updatedSurveys = [...existingSurveys, newSurvey];
    localStorage.setItem('forge_surveys', JSON.stringify(updatedSurveys));

    setSurvey({
      title: '',
      description: '',
      questions: [createEmptyQuestion()],
    });

    loadSurveys();
    setActiveTab('list');
    setPopup({
      type: 'alert',
      message: 'Survey created successfully!',
    });
  };

  return (
    <div className="page-shell survey-page">
      <div className="survey-form">
        <div className="survey-form__header">
          <div>
            <div className="survey-form__icon">
              <FaClipboardList aria-hidden="true" />
            </div>
            <h1 className="survey-form__title">Surveys</h1>
            <p className="survey-form__subtitle">
              Build custom surveys or manage your existing surveys.
            </p>
          </div>
          <Link to="/home" className="button-secondary survey-form__back">
            <FaArrowLeft aria-hidden="true" /> Back to Home
          </Link>
        </div>

        <div className="survey-tabs">
          <button
            type="button"
            className={`survey-tab-btn ${activeTab === 'create' ? 'survey-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Survey
          </button>
          <button
            type="button"
            className={`survey-tab-btn ${activeTab === 'list' ? 'survey-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            My Surveys
            {createdSurveys.length > 0 && (
              <span className="survey-tab-badge">{createdSurveys.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="survey-info-card">
              <div className="form-group">
                <label htmlFor="survey-title">Survey Title</label>
                <input
                  type="text"
                  id="survey-title"
                  name="title"
                  value={survey.title}
                  onChange={updateSurveyField}
                  placeholder="e.g. Campus Event Feedback"
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="survey-description">Description</label>
                <textarea
                  id="survey-description"
                  name="description"
                  value={survey.description}
                  onChange={updateSurveyField}
                  placeholder="Write a short survey description..."
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>

            {survey.questions.map((question, questionIndex) => (
              <section key={question.id} className="survey-question">
                <div className="survey-question__header">
                  <div className="survey-question__badge">
                    Question {questionIndex + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    disabled={survey.questions.length === 1}
                    className="button-danger survey-question__remove"
                  >
                    <FaTrash aria-hidden="true" /> Remove
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor={`question-${question.id}`}>Question Text</label>
                  <input
                    type="text"
                    id={`question-${question.id}`}
                    value={question.questionText}
                    onChange={(event) => updateQuestionField(question.id, 'questionText', event.target.value)}
                    placeholder="Type your question here"
                    required
                    className="input-field"
                  />
                </div>

                <div className="survey-question__toggles">
                  <ToggleGroup
                    label="Answer Type"
                    value={question.answerType}
                    onChange={(value) => updateQuestionField(question.id, 'answerType', value)}
                    options={[
                      { value: 'text', label: 'Text', icon: 'Aa' },
                      { value: 'checkbox', label: 'Checkbox', icon: '☑' },
                      { value: 'radio', label: 'Radio', icon: '◉' },
                    ]}
                  />

                  {question.answerType !== 'text' && (
                    <ToggleGroup
                      label="Option Format"
                      value={question.optionType}
                      onChange={(value) => updateQuestionField(question.id, 'optionType', value)}
                      options={[
                        { value: 'text', label: 'Text', icon: 'T' },
                        { value: 'image', label: 'Image', icon: '🖼' },
                      ]}
                    />
                  )}
                </div>

                {question.answerType !== 'text' && (
                  <div className="survey-question__options">
                    <label className="survey-question__options-label">Answer Options</label>

                    <div className="survey-options-list">
                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="survey-option">
                          <div className="survey-option__header">
                            <span className="survey-option__label">Option {optionIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeOption(question.id, option.id)}
                              className="button-danger-soft"
                            >
                              <FaTrash aria-hidden="true" />
                            </button>
                          </div>

                          {question.optionType === 'text' ? (
                            <input
                              type="text"
                              value={option.value}
                              onChange={(event) =>
                                updateOptionText(question.id, option.id, event.target.value)
                              }
                              placeholder={`Enter option ${optionIndex + 1}`}
                              className="input-field"
                            />
                          ) : (
                            <div>
                              {option.value ? (
                                <div className="survey-option__preview">
                                  <img
                                    src={option.value}
                                    alt={`Option ${optionIndex + 1} preview`}
                                  />
                                </div>
                              ) : (
                                <div className="survey-option__upload-placeholder">
                                  <span className="survey-option__upload-icon">📷</span>
                                  <span>No image selected</span>
                                  <span className="survey-option__upload-hint">
                                    PNG, JPG, or WEBP
                                  </span>
                                </div>
                              )}

                              <label className="survey-option__upload-btn">
                                {option.value ? 'Change Image' : 'Upload Image'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => handleOptionImageUpload(question.id, option.id, event)}
                                  style={{ display: 'none' }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      className="button-secondary survey-question__add-option"
                    >
                      <FaPlus aria-hidden="true" /> Add Option
                    </button>
                  </div>
                )}
              </section>
            ))}

            <div className="survey-form__actions">
              <button type="button" onClick={addQuestion} className="button-secondary">
                <FaPlus aria-hidden="true" /> Add Question
              </button>

              <button type="submit" className="button-primary">
                Create Survey
              </button>
            </div>
          </form>
        ) : (
          <div className="my-surveys-list">
            {createdSurveys.length === 0 ? (
              <div className="survey-empty-state">
                <div className="survey-empty-state__icon">
                  <FaClipboardList />
                </div>
                <h3>No Surveys Created Yet</h3>
                <p>Build your first survey with custom questions, checkbox matrices, or upload choices.</p>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setActiveTab('create')}
                >
                  Create Survey Now
                </button>
              </div>
            ) : (
              createdSurveys.map((createdSurvey) => {
                const isExpanded = expandedSurveyId === createdSurvey.id;
                return (
                  <div key={createdSurvey.id} className="my-survey-card">
                    <div className="my-survey-card__header">
                      <div className="my-survey-card__title-section">
                        <h3 className="my-survey-card__title">{createdSurvey.title}</h3>
                        <div className="my-survey-card__meta">
                          <span>Created: {formatDate(createdSurvey.createdAt)}</span>
                          <span>•</span>
                          <span>{createdSurvey.questions.length} {createdSurvey.questions.length === 1 ? 'Question' : 'Questions'}</span>
                        </div>
                      </div>
                      <div className="my-survey-card__actions">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => toggleExpandSurvey(createdSurvey.id)}
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => deleteSurvey(createdSurvey.id)}
                        >
                          <FaTrash aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </div>
                    {createdSurvey.description && (
                      <p className="my-survey-card__description">{createdSurvey.description}</p>
                    )}
                    {isExpanded && (
                      <div className="my-survey-card__preview">
                        <h4 className="my-survey-card__preview-title">Questions Preview</h4>
                        <div className="my-survey-card__questions-list">
                          {createdSurvey.questions.map((q, qIndex) => (
                            <div key={q.id || qIndex} className="my-survey-card__question-item">
                              <span className="question-item__number">Q{qIndex + 1}.</span>
                              <div className="question-item__body">
                                <div className="question-item__text">{q.questionText}</div>
                                <div className="question-item__type">
                                  Type: <span className="badge-type">{q.answerType}</span>
                                </div>
                                {q.answerType !== 'text' && q.options && (
                                  <div className="question-item__options-preview">
                                    {q.options.map((opt, optIndex) => (
                                      <div key={opt.id || optIndex} className="question-item__option-preview-chip">
                                        {q.optionType === 'image' && opt.value ? (
                                          <div className="question-item__option-image-preview">
                                            <img src={opt.value} alt={`Option preview ${optIndex}`} />
                                          </div>
                                        ) : (
                                          <span>{opt.value || `Option ${optIndex + 1}`}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {popup && (
        <PopupModal
          type={popup.type}
          message={popup.message}
          onConfirm={popup.onConfirm}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

export default Survey;
