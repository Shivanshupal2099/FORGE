import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import '../Components/Survey.css';

function SurveyResultsPage() {
  const { surveyId } = useParams();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [responsesWithAnswers, setResponsesWithAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSurvey();
    loadResponses();
    loadQuestions();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      console.log('Loading survey:', surveyId);
      
      const response = await axios.get(`/api/survey/${surveyId}`);
      console.log('Survey data response:', response.data);
      
      if (response.data.success) {
        setSurvey(response.data.survey);
      } else {
        setError(response.data.message || 'Failed to load survey');
      }
    } catch (err) {
      setError('Error loading survey');
      console.error('Error loading survey:', err);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`/api/survey/${surveyId}/questions`);
      
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const loadResponses = async () => {
    try {
      setLoading(true);
      console.log('Loading responses for survey:', surveyId);
      
      const response = await axios.get(`/api/survey/${surveyId}/responses`);
      console.log('Responses data:', response.data);
      
      if (response.data.success) {
        setResponses(response.data.responses);
        
        // Load answers for all responses
        const responsesWithAnswersData = await Promise.all(
          response.data.responses.map(async (resp) => {
            try {
              const answersResponse = await axios.get(`/api/survey/responses/${resp._id}`);
              if (answersResponse.data.success) {
                return {
                  ...resp,
                  answers: answersResponse.data.answers
                };
              }
              return resp;
            } catch (err) {
              console.error('Error loading answers for response:', resp._id, err);
              return resp;
            }
          })
        );
        
        setResponsesWithAnswers(responsesWithAnswersData);
      } else {
        setError(response.data.message || 'Failed to load responses');
      }
    } catch (err) {
      console.error('Error loading responses:', err);
      
      // Handle specific error status codes
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || 'Unknown error';
        
        switch (status) {
          case 403:
            setError('Access Denied: You do not have permission to view responses for this survey.');
            break;
          case 401:
            setError('Authentication required. Please log in again.');
            break;
          case 404:
            setError('Survey not found or has been deleted.');
            break;
          default:
            setError(`Failed to load responses: ${message}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Error loading responses');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportResponses = async () => {
    try {
      const response = await axios.get(`/api/survey/${surveyId}/responses/export`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey_${surveyId}_responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error exporting responses');
      console.error('Error exporting responses:', err);
    }
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

  if (loading && !survey) {
    return (
      <div className="page-shell survey-page">
        <div className="survey-form">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell survey-page">
        <div className="survey-form">
          <p className="error-message">{error}</p>
          <Link to="/survey" className="button-secondary">
            <FaArrowLeft /> Back to Surveys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell survey-page">
      <div className="survey-form">
        <div className="survey-form__header">
          <div>
            <div className="survey-form__icon">
              <FaEye aria-hidden="true" />
            </div>
            <h1 className="survey-form__title">Survey Results</h1>
            <p className="survey-form__subtitle">
              Survey #{survey?._id?.slice(-6)}
            </p>
          </div>
          <div className="survey-form__header-actions">
            <Link to="/survey" className="button-secondary">
              <FaArrowLeft /> Back to Surveys
            </Link>
            <button
              type="button"
              className="button-primary"
              onClick={exportResponses}
              disabled={responses.length === 0}
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        <div className="responses-list">
          {responsesWithAnswers.length === 0 ? (
            <div className="survey-empty-state">
              <p>No responses yet</p>
            </div>
          ) : (
            responsesWithAnswers.map((response) => (
              <div key={response._id} className="response-card">
                <div className="response-card__header">
                  <div className="response-card__info">
                    <span className="response-card__date">
                      Response #{response._id.slice(-6)} - {formatDate(response.submittedAt)}
                    </span>
                  </div>
                </div>
                
                {response.answers && response.answers.length > 0 && (
                  <div className="response-answers">
                    {questions.map((question) => {
                      const answer = response.answers.find(a => a.questionId === question._id);
                      return (
                        <div key={question._id} className="response-answer-item">
                          <div className="response-answer-question">
                            {question.question}
                          </div>
                          <div className="response-answer-value">
                            {answer ? (
                              Array.isArray(answer.answer) 
                                ? answer.answer.join(', ') 
                                : String(answer.answer)
                            ) : (
                              <span className="no-answer">No answer</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveyResultsPage;
