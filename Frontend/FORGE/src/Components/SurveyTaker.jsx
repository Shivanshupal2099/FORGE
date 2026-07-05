import { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaArrowRight, FaCoins } from 'react-icons/fa';

// survey.questions[*].answerType = 'text' | 'radio' | 'checkbox'
// survey.questions[*].optionType = 'text' | 'image'



function SurveyTaker({ survey, onClose, isCompulsory = false }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);

  const currentQuestion = survey.questions?.[currentQuestionIndex];
  const progress = currentQuestionIndex < (survey.questions?.length || 0)
    ? ((currentQuestionIndex + 1) / survey.questions.length) * 100
    : 0;

  const TOKENS_PER_QUESTION = 100;


  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false;

    if (currentQuestion.answerType === 'text') {
      const value = answers[currentQuestion.id];
      return typeof value === 'string' && value.trim().length > 0;
    }

    if (currentQuestion.answerType === 'radio') {
      const value = answers[currentQuestion.id];
      return typeof value === 'string' && value !== '';
    }

    // checkbox (multi)
    const value = answers[currentQuestion.id];
    return Array.isArray(value) && value.length > 0;
  }, [answers, currentQuestion]);


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const setRadioAnswer = (value) => {
    handleAnswer(value);
  };

  const toggleCheckboxAnswer = (value) => {
    setAnswers((prev) => {
      const existing = prev[currentQuestion.id];
      const next = Array.isArray(existing) ? [...existing] : [];
      const idx = next.indexOf(value);
      if (idx >= 0) next.splice(idx, 1);
      else next.push(value);
      return {
        ...prev,
        [currentQuestion.id]: next,
      };
    });
  };


  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const answeredCount = Object.keys(answers).length;
      const earned = answeredCount * TOKENS_PER_QUESTION;
      setTokensEarned(earned);
      setIsCompleted(true);
    }
  };

  // Removed Skip in favor of Back/Next UX.


  const handleSubmit = () => {
    const currentBalance = parseInt(localStorage.getItem('forge_token_balance') || '0');
    const newBalance = currentBalance + tokensEarned;
    localStorage.setItem('forge_token_balance', newBalance.toString());
    
    const completedSurveys = JSON.parse(localStorage.getItem('forge_completed_surveys') || '[]');
    if (!completedSurveys.includes(survey.id)) {
      completedSurveys.push(survey.id);
      localStorage.setItem('forge_completed_surveys', JSON.stringify(completedSurveys));
    }

    console.log('Survey answers:', answers);
    alert(`Thank you for completing the survey! You earned ${tokensEarned} tokens!`);
    onClose();
    window.dispatchEvent(new Event('storage'));
  };

  if (isCompleted) {
    return (
      <div className="home-popup-overlay" onClick={onClose} role="presentation">
        <div
          className="home-popup home-popup--survey-taker"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="home-popup__close"
            onClick={onClose}
            aria-label="Close survey popup"
          >
            <FaTimes aria-hidden="true" />
          </button>

          <div className="survey-taker__complete">
            <div className="survey-taker__complete-icon">
              <FaCoins aria-hidden="true" />
            </div>
            <h2 className="survey-taker__complete-title">Survey Complete!</h2>
            <p className="survey-taker__complete-text">
              Thank you for your participation. Your responses have been recorded.
            </p>
            <div className="survey-taker__reward">
              <span className="survey-taker__reward-amount">+{tokensEarned}</span>
              <span className="survey-taker__reward-label">Tokens Earned</span>
            </div>
            <button type="button" className="button-primary" onClick={handleSubmit}>
              Claim Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-popup-overlay" onClick={isCompulsory ? undefined : onClose} role="presentation">
      <div
        className="home-popup home-popup--survey-taker"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {!isCompulsory && (
          <button
            type="button"
            className="home-popup__close"
            onClick={onClose}
            aria-label="Close survey popup"
          >
            <FaTimes aria-hidden="true" />
          </button>
        )}

        <div className="survey-taker__header survey-taker__header--dark">
          <div className="survey-taker__progress-row">
            <div className="survey-taker__progress-meta">
              Question {currentQuestionIndex + 1} of {survey.questions.length}
            </div>
          </div>
          <div className="survey-taker__progress">
            <div className="survey-taker__progress-track" aria-hidden="true">
              <div
                className="survey-taker__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h3 className="survey-taker__question-title">{currentQuestion.questionText}</h3>
        </div>

    <div className="survey-taker__question">
          {!currentQuestion ? (
            <div className="survey-taker__question-title">No question found.</div>
          ) : null}

          {currentQuestion?.answerType === 'text' && (

            <div className="survey-taker__text-input">
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="survey-taker__input survey-taker__input--text"
              />
            </div>
          )}

          {currentQuestion.answerType === 'radio' && (
            <div className="survey-taker__options">
              {currentQuestion.options.map((option, index) => {
                const selected = answers[currentQuestion.id] === option.value;
                return (
                  <label
                    key={option.id}
                    className={`survey-taker__option-pill ${selected ? 'survey-taker__option-pill--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.value}
                      checked={selected}
                      onChange={() => setRadioAnswer(option.value)}
                      className="survey-taker__option-input"
                    />
                    {currentQuestion.optionType === 'image' && option.value ? (
                      <div className={`survey-taker__image-card ${selected ? 'survey-taker__image-card--selected' : ''}`}>
                        <img src={option.value} alt={`Option ${index + 1}`} className="survey-taker__image" />
                      </div>
                    ) : (
                      <span className="survey-taker__option-text">{option.value}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {currentQuestion.answerType === 'checkbox' && (
            <div className="survey-taker__options">
              {currentQuestion.options.map((option, index) => {
                const selectedValues = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                const selected = selectedValues.includes(option.value);

                return (
                  <label
                    key={option.id}
                    className={`survey-taker__option-pill ${selected ? 'survey-taker__option-pill--selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      name={`question-${currentQuestion.id}`}
                      value={option.value}
                      checked={selected}
                      onChange={() => toggleCheckboxAnswer(option.value)}
                      className="survey-taker__option-input survey-taker__option-input--checkbox"
                    />
                    {currentQuestion.optionType === 'image' && option.value ? (
                      <div className={`survey-taker__image-card ${selected ? 'survey-taker__image-card--selected' : ''}`}>
                        <img src={option.value} alt={`Option ${index + 1}`} className="survey-taker__image" />
                      </div>
                    ) : (
                      <span className="survey-taker__option-text">{option.value}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

        </div>

        <div className="survey-taker__actions survey-taker__actions--dark">
          <button
            type="button"
            className="survey-taker__back"
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Back
          </button>

          <button
            type="button"
            className="survey-taker__next"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            {currentQuestionIndex === survey.questions.length - 1 ? 'Finish' : 'Next'}
            <FaArrowRight aria-hidden="true" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default SurveyTaker;
