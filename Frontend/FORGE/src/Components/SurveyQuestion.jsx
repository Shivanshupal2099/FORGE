import { useMemo, useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';

function SurveyQuestion({ survey, onAnswerSubmit }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = useMemo(() => {
    return survey.questions?.[currentQuestionIndex];
  }, [survey.questions, currentQuestionIndex]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false;
    const value = answers[currentQuestion.id];
    if (currentQuestion.answerType === 'text') {
      return typeof value === 'string' && value.trim().length > 0;
    }
    // radio/checkbox: stored as selected option.value (string)
    return value !== undefined && value !== '';
  }, [answers, currentQuestion]);

  const handleSubmit = () => {
    onAnswerSubmit(survey.id, answers);
  };

  if (!survey?.questions?.length) return null;

  const isLast = currentQuestionIndex === survey.questions.length - 1;

  return (
    <div className="survey-card survey-card--expanded">
      <div className="survey-card__icon">
        <FaClipboardList aria-hidden="true" />
      </div>

      <div className="survey-card__content">
        <h3 className="survey-card__title">Survey #{survey._id?.slice(-6)}</h3>
      </div>

      <div className="survey-card__questions">
        <div className="survey-card__question-item">
          <div className="survey-card__question-header">
            <div className="survey-card__question-number">Q{currentQuestionIndex + 1}</div>
            <div className="survey-card__question-text">{currentQuestion.questionText}</div>
          </div>

          {currentQuestion.answerType === 'text' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              rows={2}
              className="input-field survey-card__input"
            />
          )}

          {(currentQuestion.answerType === 'radio' || currentQuestion.answerType === 'checkbox') && (
            <div className="survey-card__options">
              {currentQuestion.options.map((option) => (
                <label key={option.id} className="survey-card__option">
                  <input
                    type={currentQuestion.answerType}
                    name={`survey-${survey.id}-question-${currentQuestion.id}`}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  />
                  <span>{option.value}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="survey-card__footer">
        <span className="survey-card__questions-count">
          {survey.questions.length} {survey.questions.length === 1 ? 'question' : 'questions'} • 100 tokens each

        </span>

        <div className="survey-card__footer-actions">
          <button
            type="button"
            className="survey-card__action survey-card__action--secondary"
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Prev
          </button>

          {!isLast && (
            <button
              type="button"
              className="survey-card__action"
              onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              disabled={!canGoNext}
            >
              Next
            </button>
          )}

          {isLast && (
            <button
              type="button"
              className="survey-card__action"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < survey.questions.length}
            >
              Submit Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveyQuestion;



