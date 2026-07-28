import { useState, useEffect } from 'react';
import { FaClipboardList, FaArrowRight, FaCheck, FaSpinner, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

function SurveyCard() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [expandedSurveys, setExpandedSurveys] = useState({});

  useEffect(() => {
    fetchPublicSurveys();
  }, [user]);

  const fetchPublicSurveys = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await axios.get('/api/survey/public/all');
      
      if (response.data.success) {
        setSurveys(response.data.surveys);
        
        // Fetch questions for each survey
        const questionsPromises = response.data.surveys.map(survey =>
          axios.get(`/api/survey/${survey._id}/questions`)
        );
        
        const questionsResponses = await Promise.all(questionsPromises);
        const questionsMap = {};
        
        response.data.surveys.forEach((survey, index) => {
          if (questionsResponses[index].data.success) {
            questionsMap[survey._id] = questionsResponses[index].data.questions;
          }
        });
        
        setSurveyQuestions(questionsMap);
      }
    } catch (error) {
      console.error('Error fetching public surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (surveyId, questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${surveyId}-${questionId}`]: value
    }));
  };

  const handleSubmitAnswer = async (surveyId, questionId) => {
    const answerKey = `${surveyId}-${questionId}`;
    const answer = answers[answerKey];
    
    if (!answer) return;

    try {
      setSubmitting(prev => ({ ...prev, [answerKey]: true }));

      await axios.post(`/api/survey/${surveyId}/responses`, {
        answers: { [questionId]: answer },
        anonymous: false
      });

      // Clear the answer after submission
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[answerKey];
        return newAnswers;
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(prev => ({ ...prev, [answerKey]: false }));
    }
  };

  const toggleExpand = (surveyId) => {
    setExpandedSurveys(prev => ({
      ...prev,
      [surveyId]: !prev[surveyId]
    }));
  };

  if (loading) {
    return null;
  }

  if (surveys.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
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
        const isExpanded = expandedSurveys[survey._id];

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
            {/* Survey Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FaClipboardList style={{ fontSize: '1.3rem', color: '#ffffff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                  }}>
                    Survey #{survey._id?.slice(-6)}
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <FaUser style={{ fontSize: '0.8rem' }} />
                    {survey.current_responses} responses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleExpand(survey._id)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.color = '#64748b';
                  }}
                >
                  {isExpanded ? 'Show Less' : 'View Questions'}
                </button>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  padding: '4px 12px',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}>
                  {questions.length} Questions
                </span>
                <span style={{
                  padding: '4px 12px',
                  background: survey.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: survey.status === 'active' ? '#10b981' : '#ef4444',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}>
                  {survey.status}
                </span>
              </div>
            </div>

            {/* Questions */}
            {isExpanded && questions.map((question, qIndex) => {
              const answerKey = `${survey._id}-${question._id}`;
              const selectedAnswer = answers[answerKey];
              const isSubmitting = submitting[answerKey];

              return (
                <div
                  key={question._id}
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <h4 style={{
                    margin: '0 0 16px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--app-text)',
                  }}>
                    Q{qIndex + 1}: {question.question}
                  </h4>

                  {/* Answer Options */}
                  {question.type === 'text' ? (
                    <textarea
                      value={selectedAnswer || ''}
                      onChange={(e) => handleAnswer(survey._id, question._id, e.target.value)}
                      placeholder="Type your answer..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        resize: 'none',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                        marginBottom: '12px',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAnswer(survey._id, question._id, option)}
                          disabled={isSubmitting}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: selectedAnswer === option 
                              ? '2px solid #667eea' 
                              : '2px solid #e2e8f0',
                            borderRadius: '10px',
                            background: selectedAnswer === option
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
                            if (selectedAnswer !== option) {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.background = '#ffffff';
                            }
                          }}
                        >
                          <span>{option}</span>
                          {selectedAnswer === option && (
                            <FaCheck style={{ color: '#667eea' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleSubmitAnswer(survey._id, question._id)}
                    disabled={!selectedAnswer || isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '10px',
                      background: !selectedAnswer || isSubmitting
                        ? '#cbd5e1'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: !selectedAnswer || isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnswer && !isSubmitting) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
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
                        Submit Answer
                        <FaArrowRight />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
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

export default SurveyCard;
