import { useEffect, useState } from 'react';
import { FaHandPaper, FaTimes, FaCheck } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function Request({ onClose }) {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/connections/incoming', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setIncomingRequests(data.connections || []);
        }
      } catch (error) {
        console.error('Error fetching incoming requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingRequests();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/connections/${connectionId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIncomingRequests(prev => prev.filter(req => req._id !== connectionId));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/connections/${connectionId}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIncomingRequests(prev => prev.filter(req => req._id !== connectionId));
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  return (
    <div className="request-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="request-popup"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-popup-title"
      >
        <button
          type="button"
          className="request-popup__close"
          onClick={onClose}
          aria-label="Close requests"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="request-popup__header">
          <span className="request-popup__icon">
            <FaHandPaper aria-hidden="true" />
          </span>
          <div>
            <h2 id="request-popup-title" className="request-popup__title">
              Connection Requests
            </h2>
            <p className="request-popup__subtitle">
              {loading ? 'Loading...' : `${incomingRequests.length} pending request${incomingRequests.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="request-popup__content">
          {loading ? (
            <div className="request-popup__empty">
              <span className="request-popup__loading">Loading requests...</span>
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="request-popup__empty">
              <span className="request-popup__empty-icon">📭</span>
              <p>No pending connection requests</p>
            </div>
          ) : (
            <ul className="request-list">
              {incomingRequests.map((request) => (
                <li key={request._id} className="request-card">
                  <div className="request-card__profile">
                    {request.requester_profile?.avatar_url ? (
                      <img 
                        src={request.requester_profile.avatar_url} 
                        alt={`${request.requester_profile.first_name} ${request.requester_profile.last_name}`}
                        className="request-card__avatar"
                      />
                    ) : (
                      <div className="request-card__avatar-placeholder">
                        {request.requester_profile?.first_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="request-card__info">
                      <h3 className="request-card__name">
                        {request.requester_profile?.first_name} {request.requester_profile?.last_name}
                      </h3>
                      {request.requester_profile?.department && (
                        <p className="request-card__profession">{request.requester_profile.department}</p>
                      )}
                      {request.requester_intent && (
                        <p className="request-card__message">{request.requester_intent}</p>
                      )}
                    </div>
                  </div>
                  <div className="request-card__actions">
                    <button
                      type="button"
                      className="request-card__button request-card__button--accept"
                      onClick={() => handleAccept(request._id)}
                      aria-label="Accept request"
                    >
                      <FaCheck aria-hidden="true" />
                      Accept
                    </button>
                    <button
                      type="button"
                      className="request-card__button request-card__button--decline"
                      onClick={() => handleDecline(request._id)}
                      aria-label="Decline request"
                    >
                      <FaTimes aria-hidden="true" />
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Request;
