import { useEffect, useState, useRef } from 'react';
import { FaClipboardList, FaArrowLeft, FaArrowRight, FaCheck, FaSpinner } from 'react-icons/fa';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

function SurveyRotator() {
  const [surveys, setSurveys] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState({});
  const [surveyStates, setSurveyStates] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [userResponses, setUserResponses] = useState({});
  const { user } = useAuth(); 
  const { socket, isConnected } = useSocket();
  const touchStartRef = useRef(null);

  useEffect(() => {
    fetchPublicSurveys();
    fetchUserResponses();
  }, [user]);

  // Listen for WebSocket survey events for real-time updates
  useEffect(() => {
    console.log('WebSocket effect running:', { socket, isConnected, user: user?.email });
    
    if (!socket || !isConnected) {
      console.log('Socket not connected, skipping event listeners');
      return;
    }

    const handleSurveyCreated = (survey) => {
      console.log('WebSocket: Survey created event received', survey);
      fetchPublicSurveys();
    };

    const handleSurveyUpdated = (survey) => {
      console.log('WebSocket: Survey updated event received', survey);
      fetchPublicSurveys();
    };

    const handleSurveyDeleted = (survey) => {
      console.log('WebSocket: Survey deleted event received', survey);
      fetchPublicSurveys();
    };

    socket.on('survey:created', handleSurveyCreated);
    socket.on('survey:updated', handleSurveyUpdated);
    socket.on('survey:deleted', handleSurveyDeleted);

    console.log('WebSocket event listeners registered');

    return () => {
      socket.off('survey:created', handleSurveyCreated);
      socket.off('survey:updated', handleSurveyUpdated);
      socket.off('survey:deleted', handleSurveyDeleted);
      console.log('WebSocket event listeners cleaned up');
    };
  }, [socket, isConnected, user]);

  const fetchPublicSurveys = async (pageNum = 1, append = false) => {  
    if (!user?.email) return;

    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`Fetching public surveys page ${pageNum}...`);
      const response = await axios.get(`/api/survey/public/all?page=${pageNum}&limit=10`);
      
      console.log('Public surveys response:', response.data);
      
      if (response.data.success) {
        const newSurveys = response.data.surveys;
        const pagination = response.data.pagination;
        
        setSurveys(prev => append ? [...prev, ...newSurveys] : newSurveys);
        setHasMore(pagination.page < pagination.pages);
        setPage(pageNum);
        
        // Initialize states for new surveys
        const initialStates = {};
        newSurveys.forEach(survey => {
          if (survey?._id && !surveyStates[survey._id]) {
            initialStates[survey._id] = {
              currentQuestionIndex: 0,
              answers: {}
            };
          }
        });
        
        if (Object.keys(initialStates).length > 0) {
          setSurveyStates(prev => ({ ...prev, ...initialStates }));
        }
        
        // Fetch questions for new surveys only
        const questionsPromises = newSurveys
          .filter(survey => survey?._id)
          .map(survey => {
            console.log(`Fetching questions for survey ${survey._id}`);
            return axios.get(`/api/survey/${survey._id}/questions`);
          });
        
        const questionsResponses = await Promise.all(questionsPromises);
        console.log('Questions responses:', questionsResponses);
        
        const newQuestionsMap = {};
        
        newSurveys.forEach((survey, index) => {
          if (survey?._id && questionsResponses[index]?.data?.success) {
            console.log(`Survey ${survey._id} has ${questionsResponses[index].data.questions.length} questions`);
            newQuestionsMap[survey._id] = questionsResponses[index].data.questions;
          } else {
            console.log(`Failed to fetch questions for survey ${survey._id}:`, questionsResponses[index]?.data);
          }
        });
        
        setSurveyQuestions(prev => ({ ...prev, ...newQuestionsMap }));
        console.log('Questions map set:', Object.keys({ ...surveyQuestions, ...newQuestionsMap }));
      }
    } catch (error) {
      console.error('Error fetching public surveys:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPublicSurveys(page + 1, true);
    }
  };

  const fetchUserResponses = async () => {
    if (!user?.email) return;

    try {
      const response = await axios.get(`/api/survey/user/${user.email}`);
      
      if (response.data.success) {
        // Get all survey IDs the user has created
        const createdSurveyIds = response.data.surveys.map(s => s._id);
        
        // Now fetch responses for all public surveys to check which ones user has submitted
        const surveysResponse = await axios.get('/api/survey/public/all?page=1&limit=100');
        
        if (surveysResponse.data.success) {
          const submittedSurveyIds = [];
          
          // Check each public survey for user's response
          for (const survey of surveysResponse.data.surveys) {
            try {
              const checkResponse = await axios.get(`/api/survey/${survey._id}/responses`);
              if (checkResponse.data.success) {
                const userResponse = checkResponse.data.responses.find(
                  r => r.submittedBy?.email === user.email
                );
                if (userResponse) {
                  submittedSurveyIds.push(survey._id);
                }
              }
            } catch (err) {
              console.error('Error checking response for survey:', survey._id);
            }
          }
          
          setUserResponses(prev => {
            const newState = {};
            submittedSurveyIds.forEach(id => {
              newState[id] = true;
            });
            return newState;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user responses:', error);
    }
  };

  const handleAnswer = (surveyId, questionId, value) => {
    setSurveyStates(prev => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        answers: {
          ...prev[surveyId].answers,
          [questionId]: value
        }
      }
    }));
  };

  const canGoNext = (surveyId) => {
    const state = surveyStates[surveyId];
    if (!state) return false;
    
    const questions = surveyQuestions[surveyId] || [];
    const currentQuestion = questions[state.currentQuestionIndex];
    if (!currentQuestion) return false;
    
    const value = state.answers[currentQuestion._id];
    if (currentQuestion.type === 'text') {
      return typeof value === 'string' && value.trim().length > 0;
    }
    if (currentQuestion.type === 'radio') {
      return typeof value === 'string' && value !== '';
    }
    if (currentQuestion.type === 'checkbox') {
      return Array.isArray(value) && value.length > 0;
    }
    return false;
  };

  const handleNext = (surveyId) => {
    const state = surveyStates[surveyId];
    const questions = surveyQuestions[surveyId] || [];
    
    if (state.currentQuestionIndex < questions.length - 1) {
      setSurveyStates(prev => ({
        ...prev,
        [surveyId]: {
          ...prev[surveyId],
          currentQuestionIndex: prev[surveyId].currentQuestionIndex + 1
        }
      }));
    } else {
      handleSubmit(surveyId);
    }
  };

  const handlePrev = (surveyId) => {
    setSurveyStates(prev => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        currentQuestionIndex: Math.max(0, prev[surveyId].currentQuestionIndex - 1)
      }
    }));
  };

  const handleSubmit = async (surveyId) => {
    const state = surveyStates[surveyId];
    if (!state) return;

    try {
      setSubmitting(prev => ({ ...prev, [surveyId]: true }));

      await axios.post(`/api/survey/${surveyId}/responses`, {
        answers: state.answers,
        anonymous: false
      });

      // Reset survey state after submission
      setSurveyStates(prev => ({
        ...prev,
        [surveyId]: {
          currentQuestionIndex: 0,
          answers: {}
        }
      }));

    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(prev => ({ ...prev, [surveyId]: false }));
    }
  };

  // Swipe navigation for mobile
  const handleTouchStart = (e, surveyId) => {
    touchStartRef.current = { x: e.touches[0].clientX, surveyId };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current.x - touchEnd;
    const surveyId = touchStartRef.current.surveyId;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && canGoNext(surveyId)) {
        handleNext(surveyId);
      } else if (diff < 0) {
        handlePrev(surveyId);
      }
    }
    
    touchStartRef.current = null;
  };

  if (loading) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '40px 20px',
        color: '#64748b',
      }}>
        Loading surveys...
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '40px 20px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '20px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '16px',
        }}>
          📋
        </div>
        <h3 style={{
          margin: '0 0 8px',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'var(--app-text)',
        }}>
          No surveys available
        </h3>
        <p style={{
          margin: '0',
          fontSize: '0.95rem',
          color: '#64748b',
        }}>
          Be the first to create a survey and share it with the community!
        </p>
      </div>
    );
  }

  // Check if all surveys have been submitted by the user
  const allSubmitted = surveys.length > 0 && surveys.every(survey => userResponses[survey._id]);

  if (allSubmitted) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '40px 20px',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '20px',
        border: '2px solid #10b981',
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '16px',
        }}>
          ✅
        </div>
        <h3 style={{
          margin: '0 0 8px',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#10b981',
        }}>
          All surveys completed!
        </h3>
        <p style={{
          margin: '0',
          fontSize: '0.95rem',
          color: '#64748b',
        }}>
          You've responded to all available surveys. Check back later for new ones!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        paddingBottom: '100px',
      }}
    >
      <h2 style={{
        margin: '0 0 20px',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--app-text)',
        textAlign: 'center',
      }}>
        Community Surveys
      </h2>

      {surveys.map((survey) => {
        const questions = surveyQuestions[survey._id] || [];
        const state = surveyStates[survey._id] || { currentQuestionIndex: 0, answers: {} };
        const isSubmitting = submitting[survey._id];
        const allAnswered = questions.length > 0 && questions.every(q => {
          const value = state.answers[q._id];
          if (q.type === 'text') return typeof value === 'string' && value.trim().length > 0;
          if (q.type === 'radio') return typeof value === 'string' && value !== '';
          if (q.type === 'checkbox') return Array.isArray(value) && value.length > 0;
          return false;
        });

        // Skip surveys that the user has already submitted
        if (userResponses[survey._id]) return null;

        if (questions.length === 0) return null;

        return (
          <div
            key={survey._id}
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: userResponses[survey._id] 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {userResponses[survey._id] ? (
                    <FaCheck style={{ fontSize: '1.3rem', color: '#ffffff' }} />
                  ) : (
                    <FaClipboardList style={{ fontSize: '1.3rem', color: '#ffffff' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                  }}>
                    {survey.title || `Survey by ${survey.creator_name || 'Anonymous'}`}
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.85rem',
                    color: '#64748b',
                  }}>
                    {questions.length} question{questions.length !== 1 ? 's' : ''}
                    {survey.creator_name && (
                      <span style={{ marginLeft: '8px' }}>
                        • by {survey.creator_name}
                      </span>
                    )}
                    {userResponses[survey._id] && (
                      <span style={{ color: '#10b981', fontWeight: '600', marginLeft: '8px' }}>
                        • Submitted
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Show submitted message or form */}
            {userResponses[survey._id] ? (
              <div style={{
                padding: '24px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                border: '2px solid #10b981',
                textAlign: 'center',
              }}>
                <FaCheck style={{ fontSize: '3rem', color: '#10b981', marginBottom: '12px' }} />
                <h4 style={{
                  margin: '0 0 8px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#10b981',
                }}>
                  Survey Submitted
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#64748b',
                }}>
                  You have already responded to this survey
                </p>
              </div>
            ) : (
              <>
                {/* All Questions - Vertical Scroll */}
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {questions.map((question, qIndex) => (
                    <div key={question._id} style={{
                      padding: '16px',
                      background: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}>
                      <h4 style={{
                        margin: '0 0 12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--app-text)',
                        lineHeight: '1.5',
                      }}>
                        {qIndex + 1}. {question.question}
                      </h4>

                      {/* Text input */}
                      {question.type === 'text' && (
                        <input
                          type="text"
                          value={state.answers[question._id] || ''}
                          onChange={(e) => handleAnswer(survey._id, question._id, e.target.value)}
                          placeholder="Type your answer..."
                          disabled={isSubmitting}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            transition: 'border-color 0.2s ease',
                            outline: 'none',
                            cursor: isSubmitting ? 'not-allowed' : 'text',
                          }}
                          onFocus={(e) => !isSubmitting && (e.target.style.borderColor = '#667eea')}
                          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                      )}

                      {/* Radio options */}
                      {question.type === 'radio' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {question.options.map((option, idx) => {
                            const isSelected = state.answers[question._id] === option;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAnswer(survey._id, question._id, option)}
                                disabled={isSubmitting}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  border: isSelected 
                                    ? '2px solid #667eea' 
                                    : '2px solid #e2e8f0',
                                  borderRadius: '10px',
                                  background: isSelected
                                    ? 'rgba(102, 126, 234, 0.1)'
                                    : '#ffffff',
                                  color: 'var(--app-text)',
                                  fontSize: '0.95rem',
                                  fontWeight: '500',
                                  textAlign: 'left',
                                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubmitting) {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.background = '#ffffff';
                                  }
                                }}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <FaCheck style={{ color: '#667eea' }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Checkbox options */}
                      {question.type === 'checkbox' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {question.options.map((option, idx) => {
                            const selectedValues = Array.isArray(state.answers[question._id]) 
                              ? state.answers[question._id] 
                              : [];
                            const isSelected = selectedValues.includes(option);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const existing = state.answers[question._id];
                                  const next = Array.isArray(existing) ? [...existing] : [];
                                  const idx2 = next.indexOf(option);
                                  if (idx2 >= 0) next.splice(idx2, 1);
                                  else next.push(option);
                                  handleAnswer(survey._id, question._id, next);
                                }}
                                disabled={isSubmitting}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  border: isSelected 
                                    ? '2px solid #667eea' 
                                    : '2px solid #e2e8f0',
                                  borderRadius: '10px',
                                  background: isSelected
                                    ? 'rgba(102, 126, 234, 0.1)'
                                    : '#ffffff',
                                  color: 'var(--app-text)',
                                  fontSize: '0.95rem',
                                  fontWeight: '500',
                                  textAlign: 'left',
                                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubmitting) {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.background = '#ffffff';
                                  }
                                }}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <FaCheck style={{ color: '#667eea' }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit button - only show if not submitted */}
                <button
                  type="button"
                  onClick={() => handleSubmit(survey._id)}
                  disabled={!allAnswered || isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    background: !allAnswered || isSubmitting
                      ? '#cbd5e1'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: !allAnswered || isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (allAnswered && !isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Survey
                      <FaCheck />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        );
      })}

      {/* Animation Styles */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default SurveyRotator;
