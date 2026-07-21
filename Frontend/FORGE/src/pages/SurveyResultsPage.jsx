import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import './Survey.css';

function SurveyResultsPage() {
  const { surveyId } = useParams();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    loadSurvey();
    loadResponses();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      console.log('Loading survey:', surveyId);
      
      const response = await axios.get(`/survey/${surveyId}`);
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

  const loadResponses = async () => {
    try {
      setLoading(true);
      console.log('Loading responses for survey:', surveyId);
      
      const response = await axios.get(`/survey/${surveyId}/responses`);
      console.log('Responses data:', response.data);
      
      if (response.data.success) {
        setResponses(response.data.responses);
      } else {
        setError(response.data.message || 'Failed to load responses');
      }
    } catch (err) {
      setError('Error loading responses');
      console.error('Error loading responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewResponse = async (responseId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/survey/responses/${responseId}`);
      
      if (response.data.success) {
        setSelectedResponse(response.data.response);
        setAnswers(response.data.answers);
        setShowResponseModal(true);
      } else {
        setError(response.data.message || 'Failed to load response');
      }
    } catch (err) {
      setError('Error loading response');
      console.error('Error loading response:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = async (responseId) => {
    if (!confirm('Are you sure you want to delete this response?')) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`/survey/responses/${responseId}`);
      
      if (response.data.success) {
        await loadResponses();
        await loadSurvey();
      } else {
        setError(response.data.message || 'Failed to delete response');
      }
    } catch (err) {
      setError('Error deleting response');
      console.error('Error deleting response:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportResponses = async () => {
    try {
      const response = await axios.get(`/survey/${surveyId}/responses/export`, {
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
              {survey?.title}
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

        <div className="survey-stats">
          <div className="survey-stat-card">
            <div className="survey-stat-value">{survey?.current_responses || 0}</div>
            <div className="survey-stat-label">Total Responses</div>
          </div>
          <div className="survey-stat-card">
            <div className="survey-stat-value">{survey?.target_responses || 0}</div>
            <div className="survey-stat-label">Target Responses</div>
          </div>
          <div className="survey-stat-card">
            <div className="survey-stat-value">{survey?.status || 'N/A'}</div>
            <div className="survey-stat-label">Status</div>
          </div>
        </div>

        <div className="responses-list">
          {responses.length === 0 ? (
            <div className="survey-empty-state">
              <p>No responses yet</p>
            </div>
          ) : (
            responses.map((response) => (
              <div key={response._id} className="response-card">
                <div className="response-card__header">
                  <div className="response-card__info">
                    <span className="response-card__date">
                      {formatDate(response.submittedAt)}
                    </span>
                    <span className="response-card__submitter">
                      {response.submittedBy?.email || 'Anonymous'}
                    </span>
                  </div>
                  <div className="response-card__actions">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => viewResponse(response._id)}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => deleteResponse(response._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showResponseModal && (
        <div className="survey-popup-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="survey-popup-card survey-popup-card--large" onClick={(e) => e.stopPropagation()}>
            <div className="survey-popup-card__header">
              <h3>Response Details</h3>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Close
              </button>
            </div>
            <div className="survey-popup-card__content">
              {selectedResponse && (
                <div className="response-details">
                  <div className="response-detail-row">
                    <span className="response-detail-label">Submitted At:</span>
                    <span className="response-detail-value">{formatDate(selectedResponse.submittedAt)}</span>
                  </div>
                  <div className="response-detail-row">
                    <span className="response-detail-label">Submitted By:</span>
                    <span className="response-detail-value">
                      {selectedResponse.submittedBy?.email || 'Anonymous'}
                    </span>
                  </div>
                  <div className="response-detail-row">
                    <span className="response-detail-label">Anonymous:</span>
                    <span className="response-detail-value">{selectedResponse.anonymous ? 'Yes' : 'No'}</span>
                  </div>
                  
                  <h4 className="response-answers-title">Answers</h4>
                  {answers.map((answer) => (
                    <div key={answer._id} className="answer-item">
                      <div className="answer-question">{answer.questionId?.question}</div>
                      <div className="answer-value">
                        {Array.isArray(answer.answer) ? answer.answer.join(', ') : String(answer.answer)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyResultsPage;
