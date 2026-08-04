import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaClipboardList, FaEye, FaEdit, FaCopy } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from '../api/axios';
import SuccessModal from './SuccessModal';
import './Survey.css';

const createEmptyOption = () => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  value: '',
});

const createEmptyQuestion = () => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  questionText: '',
  answerType: 'text',
  options: [createEmptyOption(), createEmptyOption(), createEmptyOption()],
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
  const { user, isVerified } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    questions: [createEmptyQuestion()],
  });

  const [activeTab, setActiveTab] = useState('create');
  const [createdSurveys, setCreatedSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSurveyId, setCurrentSurveyId] = useState(null);
  const [surveyResponses, setSurveyResponses] = useState({});
  const [loadingResponses, setLoadingResponses] = useState({});

  useEffect(() => {
    loadSurveys();
  }, [user]);

  const loadSurveys = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/survey/user/${user.email}`);
      
      console.log('Load surveys response:', response.data);
      
      if (response.data.success) {
        setCreatedSurveys(response.data.surveys);
      } else {
        setError(response.data.message || 'Failed to load surveys');
      }
    } catch (err) {
      setError('Error loading surveys');
      console.error('Error loading surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (surveyId) => {
    setPopup({
      type: 'confirm',
      message: 'Are you sure you want to delete this survey? This will delete all questions and responses.',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          // Optimistic update - remove survey from local state immediately
          const surveyToDelete = createdSurveys.find(s => s._id === surveyId);
          setCreatedSurveys(prev => prev.filter((s) => s._id !== surveyId));
          
          const response = await axios.delete(`/api/survey/${surveyId}`);
          
          if (response.data.success) {
            if (expandedSurveyId === surveyId) {
              setExpandedSurveyId(null);
            }
            setPopup({
              type: 'alert',
              message: 'Survey deleted successfully'
            });
          } else {
            // Revert optimistic update on failure
            if (surveyToDelete) {
              setCreatedSurveys(prev => [...prev, surveyToDelete]);
            }
            setError(response.data.message || 'Failed to delete survey');
          }
        } catch (err) {
          // Revert optimistic update on error
          const surveyToDelete = createdSurveys.find(s => s._id === surveyId);
          if (surveyToDelete) {
            setCreatedSurveys(prev => [...prev, surveyToDelete]);
          }
          setError('Error deleting survey');
          console.error('Error deleting survey:', err);
        } finally {
          setLoading(false);
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

  const toggleExpandSurvey = async (surveyId) => {
    const isCurrentlyExpanded = expandedSurveyId === surveyId;
    
    if (!isCurrentlyExpanded && !surveyResponses[surveyId]) {
      // Load responses when expanding for the first time
      try {
        setLoadingResponses(prev => ({ ...prev, [surveyId]: true }));
        const response = await axios.get(`/api/survey/${surveyId}/responses`);
        
        if (response.data.success) {
          setSurveyResponses(prev => ({ ...prev, [surveyId]: response.data.responses }));
        }
      } catch (err) {
        console.error('Error loading survey responses:', err);
      } finally {
        setLoadingResponses(prev => ({ ...prev, [surveyId]: false }));
      }
    }
    
    setExpandedSurveyId((prev) => (prev === surveyId ? null : surveyId));
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

          // For checkbox, radio - ensure 3 options
          if (['checkbox', 'radio'].includes(value)) {
            if (question.options.length < 3) {
              return {
                ...question,
                answerType: value,
                options: [createEmptyOption(), createEmptyOption(), createEmptyOption()],
              };
            }
          }

          return {
            ...question,
            answerType: value,
            options: question.options.length > 0 ? question.options : [createEmptyOption()],
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


  const addQuestion = () => {
    // Maximum 2 questions per survey
    if (survey.questions.length >= 2) {
      return;
    }
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  };

  const removeQuestion = (questionId) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((question) => question.id !== questionId),
    }));
  };

  const addOption = (questionId) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        // Maximum 4 options
        if (question.options.length >= 4) {
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

        const nextOptions = question.options.filter((option) => option.id !== optionId);
        return { ...question, options: nextOptions.length ? nextOptions : [createEmptyOption()] };
      }),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Check if user is verified
    if (!isVerified) {
      setPopup({
        type: 'alert',
        message: 'User verification is a premium feature coming soon. Premium users will be able to verify their accounts this Sunday.'
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || user.email;
      
      console.log('Creating survey with token:', token);
      console.log('User email:', user.email);
      console.log('Survey data:', survey);
      
      // Optimistic update - add survey to local state immediately
      const tempSurveyId = 'temp_' + Date.now();
      const optimisticSurvey = {
        _id: tempSurveyId,
        creator_id: user._id,
        visibility: 'public',
        target_responses: 100,
        current_responses: 0,
        created_at: new Date().toISOString(),
        questions: survey.questions
      };

      setCreatedSurveys(prev => [optimisticSurvey, ...prev]);
      
      // Create survey first
      const surveyResponse = await axios.post('/api/survey/create', {
        uid: user.email,
        visibility: 'public',
        target_responses: 100
      });
      
      const surveyData = surveyResponse.data;
      console.log('Survey creation response:', surveyData);
      
      if (!surveyData.success) {
        // Revert optimistic update on failure
        setCreatedSurveys(prev => prev.filter(s => s._id !== tempSurveyId));
        setError(surveyData.message || 'Failed to create survey');
        return;
      }
      
      const surveyId = surveyData.survey._id;
      console.log('Survey created with ID:', surveyId);
      
      // Update the optimistic survey with real data
      setCreatedSurveys(prev => prev.map(s => 
        s._id === tempSurveyId ? { ...s, _id: surveyId } : s
      ));
      
      // Create questions
      const questionPromises = survey.questions.map((question, index) => {
        // Skip empty questions
        if (!question.questionText || question.questionText.trim() === '') {
          console.log(`Skipping empty question ${index}`);
          return Promise.resolve(null);
        }
        
        // For radio, checkbox - ensure options are provided
        let options = [];
        if (['radio', 'checkbox'].includes(question.answerType)) {
          options = question.options.map(opt => opt.value).filter(v => v.trim() !== '');
          // If no valid options, skip this question
          if (options.length === 0) {
            console.log(`Skipping question ${index} - no valid options for ${question.answerType}`);
            return Promise.resolve(null);
          }
        }
        
        console.log(`Creating question ${index}:`, question.questionText, 'Type:', question.answerType, 'Options:', options);
        
        return axios.post(`/api/survey/${surveyId}/questions`, {
          question: question.questionText,
          type: question.answerType,
          required: false,
          options: options,
          order: index
        });
      });
      
      const questionResponses = await Promise.all(questionPromises);
      console.log('Question creation responses:', questionResponses);
      
      // Check if any questions were successfully created
      const successfulQuestions = questionResponses.filter(r => r && r.data && r.data.success);
      const failedQuestions = questionResponses.filter(r => r && r.data && !r.data.success);
      
      console.log('Successfully created questions:', successfulQuestions.length);
      console.log('Failed questions:', failedQuestions.length);
      
      // Reset survey form
      setSurvey({
        questions: [createEmptyQuestion()],
      });

      // Reload surveys and switch to list tab
      await loadSurveys();
      setActiveTab('list');
      
      // Always show success modal as long as survey was created
      setSuccessModal({
        isOpen: true,
        title: 'Survey Created Successfully!',
        message: `Your survey has been created with ${successfulQuestions.length} question(s)${failedQuestions.length > 0 ? ` (${failedQuestions.length} question(s) skipped due to missing options)` : ''} and is now live on the platform.`,
        actions: [
          {
            label: 'View Survey',
            icon: <FaEye />,
            variant: 'primary',
            onClick: () => {
              // Navigate to survey view
            }
          },
          {
            label: 'My Surveys',
            icon: <FaClipboardList />,
            variant: 'secondary',
            onClick: () => {
              setActiveTab('list');
            }
          }
        ]
      });
    } catch (err) {
      // Revert optimistic update on error
      setCreatedSurveys(prev => prev.filter(s => !s._id.startsWith('temp_')));
      setError('Error creating survey');
      console.error('Error creating survey:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const publishSurvey = async (surveyId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/survey/${surveyId}/publish`);
      
      if (response.data.success) {
        await loadSurveys();
        setPopup({
          type: 'alert',
          message: 'Survey updated successfully'
        });
      } else {
        setError(response.data.message || 'Failed to update survey');
      }
    } catch (err) {
      setError('Error updating survey');
      console.error('Error updating survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeSurvey = async (surveyId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/survey/${surveyId}/close`);
      
      if (response.data.success) {
        await loadSurveys();
        setPopup({
          type: 'alert',
          message: 'Survey updated successfully'
        });
      } else {
        setError(response.data.message || 'Failed to update survey');
      }
    } catch (err) {
      setError('Error updating survey');
      console.error('Error updating survey:', err);
    } finally {
      setLoading(false);
    }
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

                          <input
                            type="text"
                            value={option.value}
                            onChange={(event) =>
                              updateOptionText(question.id, option.id, event.target.value)
                            }
                            placeholder={`Enter option ${optionIndex + 1}`}
                            className="input-field"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      className="button-secondary survey-question__add-option"
                      disabled={question.options.length >= 4}
                      style={{
                        opacity: question.options.length >= 4 ? 0.5 : 1,
                        cursor: question.options.length >= 4 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <FaPlus aria-hidden="true" /> Add Option
                    </button>
                  </div>
                )}
              </section>
            ))}

            <div className="survey-form__actions">
              <button 
                type="button" 
                onClick={addQuestion} 
                className="button-secondary"
                disabled={survey.questions.length >= 2}
                style={{
                  opacity: survey.questions.length >= 2 ? 0.5 : 1,
                  cursor: survey.questions.length >= 2 ? 'not-allowed' : 'pointer'
                }}
              >
                <FaPlus aria-hidden="true" /> Add Question
              </button>

              <button type="submit" className="button-primary">
                Create Survey
              </button>
            </div>
          </form>
        ) : (
          <div className="my-surveys-list">
            {loading ? (
              <div className="survey-empty-state">
                <p>Loading surveys...</p>
              </div>
            ) : createdSurveys.length === 0 ? (
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
                const isExpanded = expandedSurveyId === createdSurvey._id;
                return (
                  <div key={createdSurvey._id} className="my-survey-card">
                    <div className="my-survey-card__header">
                      <div className="my-survey-card__title-section">
                        <h3 className="my-survey-card__title">Survey #{createdSurvey._id.slice(-6)}</h3>
                        <div className="my-survey-card__meta">
                          <span>Created: {formatDate(createdSurvey.created_at)}</span>
                          <span>•</span>
                          <span>{createdSurvey.current_responses} responses</span>
                        </div>
                      </div>
                      <div className="my-survey-card__actions">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => toggleExpandSurvey(createdSurvey._id)}
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => navigate(`/survey/${createdSurvey._id}/results`)}
                        >
                          <FaEye /> Results
                        </button>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => deleteSurvey(createdSurvey._id)}
                          disabled={loading}
                        >
                          <FaTrash aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="my-survey-card__preview">
                        <h4 className="my-survey-card__preview-title">Survey Responses</h4>
                        {loadingResponses[createdSurvey._id] ? (
                          <p>Loading responses...</p>
                        ) : surveyResponses[createdSurvey._id] && surveyResponses[createdSurvey._id].length > 0 ? (
                          <div className="survey-responses-list">
                            {surveyResponses[createdSurvey._id].map((response) => (
                              <div key={response._id} className="response-card">
                                <div className="response-card__header">
                                  <div className="response-card__info">
                                    <div className="response-card__submitter">
                                      {response.submittedBy?.name || 'Anonymous'}
                                    </div>
                                    <div className="response-card__date">
                                      {formatDate(response.submittedAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No responses yet for this survey.</p>
                        )}
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

      {successModal && (
        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal(null)}
          title={successModal.title}
          message={successModal.message}
          actions={successModal.actions}
          autoClose={true}
          autoCloseDelay={4000}
        />
      )}
    </div>
  );
}

export default Survey;
