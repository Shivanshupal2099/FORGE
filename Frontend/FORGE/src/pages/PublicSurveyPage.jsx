import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaCheck, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import axios from '../api/axios';
import { useAlert } from '../contexts/AlertContext';

function PublicSurveyPage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useAlert();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      const [surveyResponse, questionsResponse] = await Promise.all([
        axios.get(`/api/survey/${surveyId}`),
        axios.get(`/api/survey/${surveyId}/questions`)
      ]);

      if (surveyResponse.data.success && questionsResponse.data.success) {
        setSurvey(surveyResponse.data.survey);
        setQuestions(questionsResponse.data.questions);
      } else {
        setError('Survey not found');
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    const allAnswered = questions.every(q => {
      const value = answers[q._id];
      if (q.type === 'text') return typeof value === 'string' && value.trim().length > 0;
      if (q.type === 'radio') return typeof value === 'string' && value !== '';
      if (q.type === 'checkbox') return Array.isArray(value) && value.length > 0;
      return false;
    });

    if (!allAnswered) {
      showError('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/api/survey/${surveyId}/responses`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      });
      setSubmitted(true);
      showSuccess('Survey submitted successfully!');
    } catch (error) {
      console.error('Error submitting survey:', error);
      showError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ 
            fontSize: '2rem', 
            color: '#f59e0b',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{ color: '#64748b', margin: 0 }}>Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          background: '#ffffff',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
          <h3 style={{ margin: '0 0 8px', color: '#ef4444' }}>
            {error || 'Survey not found'}
          </h3>
          <p style={{ margin: '0 0 24px', color: '#64748b' }}>
            The survey you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          background: '#ffffff',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <FaCheck style={{ fontSize: '2.5rem', color: '#10b981' }} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#10b981' }}>
            Thank You!
          </h3>
          <p style={{ margin: '0 0 24px', color: '#64748b' }}>
            Your response has been submitted successfully.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Back to ForgeConnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        paddingTop: '20px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            color: '#64748b',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
          }}
        >
          <FaArrowLeft />
          Back to Home
        </button>

        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: 'clamp(24px, 5vw, 40px)',
          border: '2px solid rgba(245, 158, 11, 0.15)',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}>
                <FaClipboardList style={{ fontSize: '1.5rem', color: '#ffffff' }} />
              </div>
              <div>
                <h1 style={{
                  margin: '0 0 8px',
                  fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                  fontWeight: '700',
                  color: 'var(--app-text)',
                }}>
                  {survey.title || 'Survey'}
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#64748b',
                }}>
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questions.map((question, qIndex) => (
              <div key={question._id} style={{
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}>
                <h4 style={{
                  margin: '0 0 16px',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: 'var(--app-text)',
                  lineHeight: '1.5',
                }}>
                  {qIndex + 1}. {question.question}
                </h4>

                {question.type === 'text' && (
                  <textarea
                    value={answers[question._id] || ''}
                    onChange={(e) => handleAnswer(question._id, e.target.value)}
                    placeholder="Type your answer..."
                    rows={4}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                )}

                {question.type === 'radio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {question.options.map((option, idx) => {
                      const isSelected = answers[question._id] === option;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswer(question._id, option)}
                          disabled={submitting}
                          style={{
                            width: '100%',
                            padding: '14px 18px',
                            border: isSelected ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                            borderRadius: '12px',
                            background: isSelected ? 'rgba(245, 158, 11, 0.1)' : '#ffffff',
                            color: 'var(--app-text)',
                            fontSize: '1rem',
                            fontWeight: '500',
                            textAlign: 'left',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{option}</span>
                          {isSelected && <FaCheck style={{ color: '#f59e0b' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === 'checkbox' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {question.options.map((option, idx) => {
                      const selectedValues = Array.isArray(answers[question._id]) ? answers[question._id] : [];
                      const isSelected = selectedValues.includes(option);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const existing = answers[question._id];
                            const next = Array.isArray(existing) ? [...existing] : [];
                            const idx2 = next.indexOf(option);
                            if (idx2 >= 0) next.splice(idx2, 1);
                            else next.push(option);
                            handleAnswer(question._id, next);
                          }}
                          disabled={submitting}
                          style={{
                            width: '100%',
                            padding: '14px 18px',
                            border: isSelected ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                            borderRadius: '12px',
                            background: isSelected ? 'rgba(245, 158, 11, 0.1)' : '#ffffff',
                            color: 'var(--app-text)',
                            fontSize: '1rem',
                            fontWeight: '500',
                            textAlign: 'left',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{option}</span>
                          {isSelected && <FaCheck style={{ color: '#f59e0b' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: '32px',
              padding: '16px 24px',
              border: 'none',
              borderRadius: '14px',
              background: submitting ? '#cbd5e1' : '#f59e0b',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            {submitting ? (
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
        </div>
      </div>

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

export default PublicSurveyPage;
