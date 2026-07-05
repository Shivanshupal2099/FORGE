import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaClipboardList } from 'react-icons/fa';

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

function Survey() {
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: [createEmptyQuestion()],
  });

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

    alert('Survey created successfully!');
    
    setSurvey({
      title: '',
      description: '',
      questions: [createEmptyQuestion()],
    });
  };

  return (
    <div className="page-shell survey-page">
      <form onSubmit={handleSubmit} className="survey-form">
        <div className="survey-form__header">
          <div>
            <div className="survey-form__icon">
              <FaClipboardList aria-hidden="true" />
            </div>
            <h1 className="survey-form__title">Create Survey</h1>
            <p className="survey-form__subtitle">
              Build your survey with text, checkbox, or radio questions. Options can be text or uploaded images.
            </p>
          </div>
          <Link to="/home" className="button-secondary survey-form__back">
            <FaArrowLeft aria-hidden="true" /> Back to Home
          </Link>
        </div>

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
    </div>
  );
}

export default Survey;
