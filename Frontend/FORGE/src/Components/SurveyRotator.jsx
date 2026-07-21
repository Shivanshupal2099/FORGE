import { useEffect, useState, useRef, useCallback } from 'react';
import { FaClipboardList, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';

const ROTATION_INTERVAL = 10 * 60 * 1000;   

function SurveyRotator({ surveys, onAnswerSubmit }) {
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const rotationTimerRef = useRef(null);
  const touchStartRef = useRef(null);

  const currentSurvey = surveys?.[currentSurveyIndex];
  const currentQuestion = currentSurvey?.questions?.[currentQuestionIndex];

  // Pick random survey on mount
  useEffect(() => {
    if (surveys && surveys.length > 0) {
      const randomIndex = Math.floor(Math.random() * surveys.length);
      setCurrentSurveyIndex(randomIndex);
    }
  }, [surveys]);

  // Auto-rotation logic
  useEffect(() => {
    if (!surveys || surveys.length <= 1) return;

    const rotateSurvey = () => {
      if (isUserActive) {
        // User is mid-answer, show toast instead
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      setIsTransitioning(true);
      setTimeout(() => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * surveys.length);
        } while (nextIndex === currentSurveyIndex && surveys.length > 1);
        
        setCurrentSurveyIndex(nextIndex);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsTransitioning(false);
      }, 300); // Transition duration
    };

    rotationTimerRef.current = setInterval(rotateSurvey, ROTATION_INTERVAL);

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [surveys, currentSurveyIndex, isUserActive]);

  // Detect user activity (mid-answer)
  useEffect(() => {
    const hasAnswers = Object.keys(answers).length > 0;
    setIsUserActive(hasAnswers);
  }, [answers]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const canGoNext = () => {
    if (!currentQuestion) return false;
    const value = answers[currentQuestion.id];
    if (currentQuestion.answerType === 'text') {
      return typeof value === 'string' && value.trim().length > 0;
    }
    if (currentQuestion.answerType === 'radio') {
      return typeof value === 'string' && value !== '';
    }
    if (currentQuestion.answerType === 'checkbox') {
      return Array.isArray(value) && value.length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSurvey.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    // Calculate random tokens per question (10-100)
    const answeredQuestions = Object.keys(answers).length;
    const tokensPerQuestion = Array.from({ length: answeredQuestions }, () => 
      Math.floor(Math.random() * 91) + 10
    );
    const totalTokens = tokensPerQuestion.reduce((sum, tokens) => sum + tokens, 0);
    
    onAnswerSubmit(currentSurvey.id, answers, totalTokens);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && canGoNext()) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        handlePrev();
      } else if (e.key === 'Enter' && canGoNext()) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, currentQuestion, answers, canGoNext]);

  // Swipe navigation for mobile
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && canGoNext()) {
        handleNext();
      } else if (diff < 0 && currentQuestionIndex > 0) {
        handlePrev();
      }
    }
    
    touchStartRef.current = null;
  };

  if (!currentSurvey) return null;

  const isLastQuestion = currentQuestionIndex === currentSurvey.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / currentSurvey.questions.length) * 100;

  return (
    <div className="survey-rotator-container">
      {showToast && (
        <div className="survey-rotator__toast">
          New survey available! Finish current survey to see it.
        </div>
      )}

      <div 
        className={`survey-rotator-card ${isTransitioning ? 'survey-rotator-card--transitioning' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="survey-rotator__header">
          <div className="survey-rotator__icon">
            <FaClipboardList />
          </div>
          <div className="survey-rotator__title-section">
            <h2 className="survey-rotator__title">{currentSurvey.title}</h2>
            <p className="survey-rotator__description">{currentSurvey.description}</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="survey-rotator__progress-section">
          <div className="survey-rotator__progress-meta">
            Question {currentQuestionIndex + 1} of {currentSurvey.questions.length} • 10-100 tokens each
          </div>
          <div className="survey-rotator__progress-bar">
            <div 
              className="survey-rotator__progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="survey-rotator__progress-dots">
            {currentSurvey.questions.map((_, idx) => (
              <div 
                key={idx}
                className={`survey-rotator__progress-dot ${idx === currentQuestionIndex ? 'survey-rotator__progress-dot--active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="survey-rotator__question">
          <div className="survey-rotator__question-text">
            {currentQuestion?.questionText}
          </div>

          {/* Text input */}
          {currentQuestion?.answerType === 'text' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              className="survey-rotator__input"
            />
          )}

          {/* Radio options */}
          {currentQuestion?.answerType === 'radio' && (
            <div className="survey-rotator__options">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                return (
                  <label
                    key={option.id}
                    className={`survey-rotator__option ${isSelected ? 'survey-rotator__option--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleAnswer(currentQuestion.id, option.value)}
                      className="survey-rotator__option-input"
                    />
                    {currentQuestion.optionType === 'image' && option.value ? (
                      <div className="survey-rotator__image-option">
                        <img 
                          src={option.value} 
                          alt={`Option ${idx + 1}`}
                          className="survey-rotator__image"
                        />
                        {isSelected && (
                          <div className="survey-rotator__image-overlay">
                            <FaCheck />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="survey-rotator__option-text">{option.value}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {/* Checkbox options */}
          {currentQuestion?.answerType === 'checkbox' && (
            <div className="survey-rotator__options">
              {currentQuestion.options.map((option, idx) => {
                const selectedValues = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                const isSelected = selectedValues.includes(option.value);
                return (
                  <label
                    key={option.id}
                    className={`survey-rotator__option ${isSelected ? 'survey-rotator__option--selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      name={`question-${currentQuestion.id}`}
                      value={option.value}
                      checked={isSelected}
                      onChange={() => {
                        setAnswers((prev) => {
                          const existing = prev[currentQuestion.id];
                          const next = Array.isArray(existing) ? [...existing] : [];
                          const idx2 = next.indexOf(option.value);
                          if (idx2 >= 0) next.splice(idx2, 1);
                          else next.push(option.value);
                          return { ...prev, [currentQuestion.id]: next };
                        });
                      }}
                      className="survey-rotator__option-input"
                    />
                    {currentQuestion.optionType === 'image' && option.value ? (
                      <div className="survey-rotator__image-option">
                        <img 
                          src={option.value} 
                          alt={`Option ${idx + 1}`}
                          className="survey-rotator__image"
                        />
                        {isSelected && (
                          <div className="survey-rotator__image-overlay">
                            <FaCheck />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="survey-rotator__option-text">{option.value}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="survey-rotator__actions">
          <button
            type="button"
            className="survey-rotator__btn survey-rotator__btn--secondary"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            <FaArrowLeft />
            Prev
          </button>

          <button
            type="button"
            className="survey-rotator__btn survey-rotator__btn--primary"
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            {isLastQuestion ? 'Submit Answers' : 'Next'}
            {!isLastQuestion && <FaArrowRight />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default SurveyRotator;
