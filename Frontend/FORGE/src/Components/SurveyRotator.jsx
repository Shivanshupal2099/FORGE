import { useEffect, useState, useRef } from 'react';
import { FaClipboardList, FaArrowLeft, FaArrowRight, FaCheck, FaSpinner, FaFlag, FaShareAlt, FaTimes, FaPaperPlane, FaUsers, FaChartBar, FaFire } from 'react-icons/fa';
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
  const [dailySurveysShown, setDailySurveysShown] = useState([]);
  const [reportPopup, setReportPopup] = useState({ isOpen: false, surveyId: null, reason: '', status: 'initial', message: '' });
  const [submissionPopup, setSubmissionPopup] = useState({ isOpen: false, tokensEarned: 0 });
  const [rateLimitPopup, setRateLimitPopup] = useState({ isOpen: false });
  const [alreadySubmittedPopup, setAlreadySubmittedPopup] = useState({ isOpen: false });
  const [sharePopup, setSharePopup] = useState({ isOpen: false, surveyId: null, link: '', copied: false });
  const { user } = useAuth(); 
  const { socket, isConnected } = useSocket();
  const touchStartRef = useRef(null);

  // Get today's date key for daily tracking
  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load daily surveys shown from localStorage
  useEffect(() => {
    if (user?.email) {
      const todayKey = getTodayKey();
      const storageKey = `dailySurveys_${user.email}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === todayKey) {
          setDailySurveysShown(data.surveyIds || []);
        } else {
          // New day, clear previous day's data
          localStorage.removeItem(storageKey);
          setDailySurveysShown([]);
        }
      }
    }
  }, [user?.email]);

  // Save daily surveys shown to localStorage
  const saveDailySurveys = (surveyIds) => {
    if (user?.email) {
      const todayKey = getTodayKey();
      const storageKey = `dailySurveys_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify({
        date: todayKey,
        surveyIds
      }));
      setDailySurveysShown(surveyIds);
    }
  };

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
      const response = await axios.get(`/api/survey/public/all?page=${pageNum}&limit=50`);
      
      console.log('Public surveys response:', response.data);
      
      if (response.data.success) {
        const allSurveys = response.data.surveys;
        
        // Filter out surveys that user has already submitted
        const unsubmittedSurveys = allSurveys.filter(survey => !userResponses[survey._id]);
        
        // Filter out surveys already shown today
        const newSurveys = unsubmittedSurveys.filter(survey => !dailySurveysShown.includes(survey._id));
        
        // Randomly shuffle all surveys for equal opportunity
        const shuffled = [...newSurveys].sort(() => 0.5 - Math.random());
        const selectedSurveys = shuffled;
        
        // Save selected surveys to daily tracking
        const selectedIds = selectedSurveys.map(s => s._id);
        saveDailySurveys([...dailySurveysShown, ...selectedIds]);
        
        setSurveys(prev => append ? [...prev, ...selectedSurveys] : selectedSurveys);
        setHasMore(newSurveys.length >= 50); // Check if more surveys might be available
        setPage(pageNum);
        
        // Initialize states for new surveys
        const initialStates = {};
        selectedSurveys.forEach(survey => {
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
        const questionsPromises = selectedSurveys
          .filter(survey => survey?._id)
          .map(survey => {
            console.log(`Fetching questions for survey ${survey._id}`);
            return axios.get(`/api/survey/${survey._id}/questions`);
          });
        
        const questionsResponses = await Promise.all(questionsPromises);
        console.log('Questions responses:', questionsResponses);
        
        const newQuestionsMap = {};
        
        selectedSurveys.forEach((survey, index) => {
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

  const handleReportClick = (surveyId) => {
    setReportPopup({ isOpen: true, surveyId: surveyId, reason: '', status: 'initial', message: '' });
  };

  const handleReportSubmit = async () => {
    if (!reportPopup.reason.trim()) {
      setReportPopup({ ...reportPopup, message: 'Please provide a reason for reporting this survey' });
      return;
    }

    try {
      setReportPopup({ ...reportPopup, status: 'submitting' });

      await axios.post(`/api/survey/${reportPopup.surveyId}/report`, {
        reason: reportPopup.reason
      });

      setReportPopup({ ...reportPopup, status: 'success', message: 'Survey reported successfully' });
    } catch (error) {
      console.error('Error reporting survey:', error);
      setReportPopup({ ...reportPopup, status: 'error', message: 'Failed to report survey. Please try again.' });
    }
  };

  const handleShareClick = (surveyId) => {
    const surveyLink = `${window.location.origin}/survey/view/${surveyId}`;
    setSharePopup({ isOpen: true, surveyId, link: surveyLink, copied: false });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharePopup.link);
      setSharePopup({ ...sharePopup, copied: true });
      setTimeout(() => {
        setSharePopup({ ...sharePopup, copied: false });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSubmit = async (surveyId) => {
    const state = surveyStates[surveyId];
    if (!state) return;

    // Check if user is authenticated
    if (!user?.email) {
      console.error('User not authenticated');
      return;
    }

    try {
      setSubmitting(prev => ({ ...prev, [surveyId]: true }));

      const response = await axios.post(`/api/survey/${surveyId}/responses`, {
        answers: state.answers,
        anonymous: false
      });

      if (response.data.success) {
        // Mark survey as submitted
        setUserResponses(prev => ({
          ...prev,
          [surveyId]: true
        }));

        // Remove survey from the list immediately
        setSurveys(prev => prev.filter(s => s._id !== surveyId));

        // Remove survey questions from state
        setSurveyQuestions(prev => {
          const newState = { ...prev };
          delete newState[surveyId];
          return newState;
        });

        // Reset survey state after submission
        setSurveyStates(prev => {
          const newState = { ...prev };
          delete newState[surveyId];
          return newState;
        });

        // Show submission popup with tokens earned
        const tokensEarned = response.data.tokensAwarded || 0;
        setSubmissionPopup({ isOpen: true, tokensEarned });

        // Refresh user responses in background
        fetchUserResponses();
      }

    } catch (error) {
      console.error('Error submitting survey:', error);
      if (error.response?.status === 429) {
        setRateLimitPopup({ isOpen: true });
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('already submitted')) {
        setAlreadySubmittedPopup({ isOpen: true });
      }
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
        padding: '48px 32px',
        background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 107, 0, 0.03) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 107, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '20px',
          animation: 'float 3s ease-in-out infinite',
        }}>
          📋
        </div>
        <h3 style={{
          margin: '0 0 12px',
          fontSize: '1.6rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px',
        }}>
          No surveys available
        </h3>
        <p style={{
          margin: '0',
          fontSize: '1.05rem',
          color: '#475569',
          lineHeight: '1.6',
        }}>
          Be the first to create a survey and share it with the community!
        </p>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
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
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '120px',
        padding: 'clamp(80px, 20vw, 100px) clamp(4px, 1vw, 8px) 0 clamp(4px, 1vw, 8px)',
      }}
    >
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
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)',
              padding: 'clamp(20px, 5vw, 32px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid #ECECEC',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                {/* Left Side */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <div style={{
                    width: 'clamp(40px, 10vw, 48px)',
                    height: 'clamp(40px, 10vw, 48px)',
                    borderRadius: '14px',
                    background: '#FF7A00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FaClipboardList style={{
                      fontSize: 'clamp(18px, 4vw, 22px)',
                      color: '#ffffff'
                    }} />
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: 'clamp(18px, 4vw, 22px)',
                      fontWeight: '700',
                      color: '#1F2937',
                      lineHeight: '1.4',
                      letterSpacing: '-0.5px',
                      marginBottom: '4px',
                    }}>
                      {survey.title || 'Survey'}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: '500',
                      color: '#6B7280',
                    }}>
                      <span>by {survey.creator_name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleShareClick(survey._id)}
                    style={{
                      width: 'clamp(36px, 8vw, 40px)',
                      height: 'clamp(36px, 8vw, 40px)',
                      background: '#ffffff',
                      border: '1px solid #EAEAEA',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6B7280',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#FF7A00';
                      e.target.style.color = '#FF7A00';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#EAEAEA';
                      e.target.style.color = '#6B7280';
                    }}
                  >
                    <FaShareAlt />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReportClick(survey._id)}
                    style={{
                      width: 'clamp(36px, 8vw, 40px)',
                      height: 'clamp(36px, 8vw, 40px)',
                      background: '#ffffff',
                      border: '1px solid #EAEAEA',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6B7280',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#FF7A00';
                      e.target.style.color = '#FF7A00';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#EAEAEA';
                      e.target.style.color = '#6B7280';
                    }}
                  >
                    <FaFlag />
                  </button>
                </div>
              </div>

              {/* Survey Metadata Chips */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
              }}>
                {/* Submissions Count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(255, 107, 0, 0.1)',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 107, 0, 0.2)',
                }}>
                  <FaUsers style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: '#FF6B00',
                  }} />
                  <span style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    fontWeight: '600',
                    color: '#FF6B00',
                  }}>
                    {survey.submission_count || survey.responses?.length || 0} responses
                  </span>
                </div>
                
                {/* Trending Indicator */}
                {(survey.submission_count || 0) > 10 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '999px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    <FaFire style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: '#EF4444',
                    }} />
                    <span style={{
                      fontSize: 'clamp(11px, 2.5vw, 13px)',
                      fontWeight: '600',
                      color: '#EF4444',
                    }}>
                      Trending
                    </span>
                  </div>
                )}
                
                {/* Questions Count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '999px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}>
                  <FaChartBar style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: '#3B82F6',
                  }} />
                  <span style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    fontWeight: '600',
                    color: '#3B82F6',
                  }}>
                    {questions.length} questions
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: '#F2F2F2',
              marginBottom: '24px',
            }} />

            {/* Show submitted message or form */}
            {userResponses[survey._id] ? (
              <div style={{
                padding: 'clamp(20px, 5vw, 28px)',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '16px',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 'clamp(48px, 12vw, 64px)',
                  height: 'clamp(48px, 12vw, 64px)',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <FaCheck style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                    color: '#10b981' 
                  }} />
                </div>
                <h4 style={{
                  margin: '0 0 8px',
                  fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                  fontWeight: '700',
                  color: '#10b981',
                }}>
                  Survey Submitted
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                  color: '#64748b',
                }}>
                  You have already responded to this survey
                </p>
              </div>
            ) : (
              <>
                {/* Progress Section */}
                <div style={{ marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'clamp(8px, 2vw, 12px)',
                  }}>
                    <span style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: '500',
                      color: '#6B7280',
                    }}>
                      Question {state.currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: '600',
                      color: '#FF7A00',
                    }}>
                      {state.currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: 'clamp(4px, 1vw, 5px)',
                    background: '#F1F1F1',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${((state.currentQuestionIndex + 1) / questions.length) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(180deg, #FF7A00 0%, #FFA726 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {/* All Questions - Vertical Scroll */}
                <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {questions.map((question, qIndex) => (
                    <div key={question._id} style={{
                      padding: 'clamp(16px, 4vw, 20px)',
                      background: 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                    }}>
                      <h4 style={{
                        margin: '0 0 clamp(12px, 3vw, 20px)',
                        fontSize: 'clamp(18px, 4vw, 28px)',
                        fontWeight: '700',
                        color: '#1F2937',
                        lineHeight: '1.5',
                        letterSpacing: '-0.5px',
                      }}>
                        {question.question}
                      </h4>

                      {/* Text input */}
                      {question.type === 'text' && (
                        <textarea
                          value={state.answers[question._id] || ''}
                          onChange={(e) => handleAnswer(survey._id, question._id, e.target.value)}
                          placeholder="Type your answer..."
                          disabled={isSubmitting}
                          style={{
                            width: '100%',
                            height: 'clamp(140px, 35vw, 180px)',
                            padding: 'clamp(14px, 3.5vw, 18px)',
                            border: '1px solid #E5E7EB',
                            borderRadius: '18px',
                            fontSize: 'clamp(14px, 3.5vw, 16px)',
                            background: '#ffffff',
                            color: '#1F2937',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            resize: 'none',
                            fontFamily: 'inherit',
                          }}
                          placeholderColor="#9CA3AF"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#FF7A00';
                            e.target.style.boxShadow = '0 0 0 4px rgba(255, 122, 0, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      )}

                      {/* Radio options */}
                      {question.type === 'radio' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 18px)' }}>
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
                                  height: 'clamp(52px, 13vw, 60px)',
                                  padding: 'clamp(14px, 3.5vw, 18px)',
                                  border: isSelected
                                    ? '1px solid #FF7A00'
                                    : '1px solid #E8E8E8',
                                  borderRadius: '16px',
                                  background: isSelected
                                    ? '#FFF8F1'
                                    : '#ffffff',
                                  color: '#1F2937',
                                  fontSize: 'clamp(14px, 3.5vw, 16px)',
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
                                    e.target.style.borderColor = '#FF7A00';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#E8E8E8';
                                  }
                                }}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: '2px solid #FF7A00',
                                    background: '#FF7A00',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <div style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      background: '#ffffff',
                                    }} />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Checkbox options */}
                      {question.type === 'checkbox' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 18px)' }}>
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
                                  height: 'clamp(52px, 13vw, 60px)',
                                  padding: 'clamp(14px, 3.5vw, 18px)',
                                  border: isSelected
                                    ? '1px solid #FF7A00'
                                    : '1px solid #E8E8E8',
                                  borderRadius: '16px',
                                  background: isSelected
                                    ? '#FFF8F2'
                                    : '#ffffff',
                                  color: '#1F2937',
                                  fontSize: 'clamp(14px, 3.5vw, 16px)',
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
                                    e.target.style.borderColor = '#FF7A00';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#E8E8E8';
                                  }
                                }}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '6px',
                                    border: '2px solid #FF7A00',
                                    background: '#FF7A00',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <FaCheck style={{ color: '#ffffff', fontSize: '12px' }} />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{
                  height: '1px',
                  background: '#F2F2F2',
                  marginBottom: '24px',
                }} />

                {/* Footer Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'clamp(8px, 2vw, 12px)',
                }}>
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => setActivePopup(null)}
                    style={{
                      width: '45%',
                      height: 'clamp(48px, 12vw, 52px)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      borderRadius: '16px',
                      color: '#6B7280',
                      fontSize: 'clamp(14px, 3.5vw, 15px)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <FaTimes />
                  </button>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleSubmit(survey._id)}
                    disabled={!allAnswered || isSubmitting}
                    style={{
                      width: '55%',
                      height: 'clamp(48px, 12vw, 52px)',
                      background: !allAnswered || isSubmitting
                        ? 'rgba(255, 107, 0, 0.5)'
                        : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                      border: 'none',
                      borderRadius: '16px',
                      color: '#111111',
                      fontSize: 'clamp(14px, 3.5vw, 15px)',
                      fontWeight: '700',
                      cursor: !allAnswered || isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: !allAnswered || isSubmitting
                        ? 'none'
                        : '0 4px 12px rgba(255, 107, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (allAnswered && !isSubmitting) {
                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                        e.target.style.background = 'linear-gradient(135deg, #FF8533 0%, #FF9520 100%)';
                        e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (allAnswered && !isSubmitting) {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.background = 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 0, 0.3)';
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>
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
          @keyframes popupSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes successPulse {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Report Popup */}
      {reportPopup.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 40px)',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            animation: 'popupSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}>
                <FaFlag style={{ fontSize: '1.3rem', color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 4px',
                  fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
                  fontWeight: '800',
                  color: 'var(--app-text)',
                  letterSpacing: '-0.3px',
                }}>
                  Report Survey
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#64748b',
                  fontWeight: '500',
                }}>
                  Help us improve the community
                </p>
              </div>
            </div>
            
            {reportPopup.status === 'initial' && (
              <>
                <p style={{
                  margin: '0 0 24px',
                  fontSize: '0.95rem',
                  color: '#64748b',
                  lineHeight: '1.6',
                }}>
                  Please provide a reason for reporting this survey. This helps us understand and address the issue appropriately.
                </p>
                {reportPopup.message && (
                  <div style={{
                    padding: '12px 16px',
                    marginBottom: '20px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#ef4444',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                      {reportPopup.message}
                    </p>
                  </div>
                )}
                <textarea
                  value={reportPopup.reason}
                  onChange={(e) => setReportPopup({ ...reportPopup, reason: e.target.value, message: '' })}
                  placeholder="Describe why you're reporting this survey..."
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    padding: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    marginBottom: '24px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#f8fafc',
                    color: 'var(--app-text)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                }}>
                  <button
                    type="button"
                    onClick={() => setReportPopup({ isOpen: false, surveyId: null, reason: '', status: 'initial', message: '' })}
                    style={{
                      padding: '14px 28px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: '#64748b',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#94a3b8';
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReportSubmit}
                    style={{
                      padding: '14px 28px',
                      border: 'none',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}

            {reportPopup.status === 'submitting' && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <FaSpinner style={{
                    fontSize: '1.8rem',
                    color: '#ef4444',
                    animation: 'spin 1s linear infinite',
                  }} />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: '#64748b',
                  fontWeight: '600',
                }}>
                  Submitting report...
                </p>
              </div>
            )}

            {reportPopup.status === 'success' && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: 'successPulse 0.6s ease-out',
                }}>
                  <FaCheck style={{
                    fontSize: '2.5rem',
                    color: '#10b981',
                  }} />
                </div>
                <h4 style={{
                  margin: '0 0 12px',
                  fontSize: '1.3rem',
                  color: '#10b981',
                  fontWeight: '800',
                }}>
                  Report Submitted
                </h4>
                <p style={{
                  margin: '0 0 28px',
                  fontSize: '0.95rem',
                  color: '#64748b',
                  lineHeight: '1.6',
                }}>
                  Thank you for helping us keep the community safe. We'll review your report shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setReportPopup({ isOpen: false, surveyId: null, reason: '', status: 'initial', message: '' })}
                  style={{
                    padding: '14px 32px',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  Done
                </button>
              </div>
            )}

            {reportPopup.status === 'error' && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <span style={{ fontSize: '2.5rem' }}>😕</span>
                </div>
                <h4 style={{
                  margin: '0 0 12px',
                  fontSize: '1.3rem',
                  color: '#ef4444',
                  fontWeight: '800',
                }}>
                  Something went wrong
                </h4>
                <p style={{
                  margin: '0 0 28px',
                  fontSize: '0.95rem',
                  color: '#64748b',
                  lineHeight: '1.6',
                }}>
                  {reportPopup.message}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                }}>
                  <button
                    type="button"
                    onClick={() => setReportPopup({ isOpen: false, surveyId: null, reason: '', status: 'initial', message: '' })}
                    style={{
                      padding: '14px 24px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: '#64748b',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#94a3b8';
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportPopup({ ...reportPopup, status: 'initial', message: '' })}
                    style={{
                      padding: '14px 24px',
                      border: 'none',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Popup */}
      {sharePopup.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
              }}>
                <FaShareAlt style={{ color: '#ffffff', fontSize: '1.3rem' }} />
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: '800',
                color: 'var(--app-text)',
              }}>
                Share Survey
              </h3>
            </div>
            
            <p style={{
              margin: '0 0 24px',
              fontSize: '0.95rem',
              color: '#64748b',
              lineHeight: '1.6',
            }}>
              Copy the link below to share this survey with others:
            </p>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '24px',
            }}>
              <input
                type="text"
                value={sharePopup.link}
                readOnly
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#64748b',
                  outline: 'none',
                  fontWeight: '500',
                }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: sharePopup.copied
                    ? 'linear-gradient(135deg, #FF8533 0%, #FF9520 100%)'
                    : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: sharePopup.copied
                    ? '0 4px 12px rgba(255, 133, 51, 0.3)'
                    : '0 4px 12px rgba(255, 107, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = sharePopup.copied
                    ? '0 6px 16px rgba(255, 133, 51, 0.4)'
                    : '0 6px 16px rgba(255, 107, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = sharePopup.copied
                    ? '0 4px 12px rgba(255, 133, 51, 0.3)'
                    : '0 4px 12px rgba(255, 107, 0, 0.3)';
                }}
              >
                {sharePopup.copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setSharePopup({ isOpen: false, surveyId: null, link: '', copied: false })}
              style={{
                width: '100%',
                padding: '14px 24px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#64748b',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.borderColor = '#FF6B00';
                e.target.style.color = '#FF6B00';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#64748b';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Submission Success Popup */}
      {submissionPopup.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(245, 158, 11, 0.2)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
            }}>
              <FaCheck style={{ fontSize: '2.5rem', color: '#ffffff' }} />
            </div>
            <h3 style={{
              margin: '0 0 12px',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--app-text)',
            }}>
              Survey Submitted!
            </h3>
            <p style={{
              margin: '0 0 20px',
              fontSize: '1rem',
              color: '#64748b',
            }}>
              Thank you for your response
            </p>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '2px solid rgba(245, 158, 11, 0.2)',
            }}>
              <p style={{
                margin: '0 0 4px',
                fontSize: '0.9rem',
                color: '#64748b',
                fontWeight: '500',
              }}>
                Tokens Earned
              </p>
              <p style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: '700',
                color: '#f59e0b',
                letterSpacing: '-1px',
              }}>
                +{submissionPopup.tokensEarned}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubmissionPopup({ isOpen: false, tokensEarned: 0 })}
              style={{
                width: '100%',
                padding: '14px 24px',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Rate Limit Popup */}
      {rateLimitPopup.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--app-bg)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
            }}>
              <FaSpinner style={{ fontSize: '2.5rem', color: '#ffffff' }} />
            </div>
            <h3 style={{
              margin: '0 0 12px',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--app-text)',
            }}>
              Rate Limit Exceeded
            </h3>
            <p style={{
              margin: '0 0 24px',
              fontSize: '1rem',
              color: '#64748b',
              lineHeight: '1.6',
            }}>
              You've reached the maximum number of survey submissions for this hour. Please try again later.
            </p>
            <button
              type="button"
              onClick={() => setRateLimitPopup({ isOpen: false })}
              style={{
                width: '100%',
                padding: '14px 24px',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Already Submitted Popup */}
      {alreadySubmittedPopup.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--app-bg)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(245, 158, 11, 0.2)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
            }}>
              <FaCheck style={{ fontSize: '2.5rem', color: '#ffffff' }} />
            </div>
            <h3 style={{
              margin: '0 0 12px',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--app-text)',
            }}>
              Already Submitted
            </h3>
            <p style={{
              margin: '0 0 24px',
              fontSize: '1rem',
              color: '#64748b',
              lineHeight: '1.6',
            }}>
              You have already submitted a response to this survey.
            </p>
            <button
              type="button"
              onClick={() => setAlreadySubmittedPopup({ isOpen: false })}
              style={{
                width: '100%',
                padding: '14px 24px',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyRotator;
