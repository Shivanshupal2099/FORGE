import { useEffect, useState } from 'react';
import { FaHandPaper, FaTimes, FaCheck, FaUserFriends, FaUnlink, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import './Request.css';

function Request({ onClose, onConnectionAccepted }) {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
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
        console.log('Request component - fetching incoming requests for user:', user?.email, user?.uid);
        const response = await axios.get('/api/connections/incoming');
        console.log('Request component - incoming requests response:', response.data);
        if (response.data.success) {
          const allRequests = response.data.connections || [];
          // Separate pending and declined requests
          setIncomingRequests(allRequests.filter(req => req.status === 'pending'));
          setDeclinedRequests(allRequests.filter(req => req.status === 'declined'));
        }
      } catch (error) {
        console.error('Error fetching incoming requests:', error);
      }
    };

    const fetchSentRequests = async () => {
      try {
        console.log('Request component - fetching sent requests for user:', user?.email, user?.uid);
        const response = await axios.get('/api/connections/sent');
        console.log('Request component - sent requests response:', response.data);
        if (response.data.success) {
          const allRequests = response.data.connections || [];
          // Separate pending and declined sent requests
          setSentRequests(allRequests);
        }
      } catch (error) {
        console.error('Error fetching sent requests:', error);
      }
    };

    const fetchAcceptedConnections = async () => {
      try {
        const response = await axios.get('/api/connections/accepted');
        if (response.data.success) {
          setAcceptedConnections(response.data.connections || []);
        }
      } catch (error) {
        console.error('Error fetching accepted connections:', error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchIncomingRequests(), fetchSentRequests(), fetchAcceptedConnections()]);
      setLoading(false);
    };

    fetchData();
  }, [user?.email, user?.uid]);

  const handleAccept = async (connectionId) => {
    try {
      const response = await axios.put(`/api/connections/${connectionId}/accept`);
      if (response.data.success) {
        setIncomingRequests(prev => prev.filter(req => req._id !== connectionId));
        // Refresh accepted connections
        const acceptedResponse = await axios.get('/api/connections/accepted');
        if (acceptedResponse.data.success) {
          setAcceptedConnections(acceptedResponse.data.connections || []);
        }
        // Notify parent component that a connection was accepted
        if (onConnectionAccepted) {
          onConnectionAccepted();
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      const response = await axios.put(`/api/connections/${connectionId}/decline`);
      if (response.data.success) {
        // Move from pending to declined
        setIncomingRequests(prev => prev.filter(req => req._id !== connectionId));
        // Refresh to get updated declined requests
        const incomingResponse = await axios.get('/api/connections/incoming');
        if (incomingResponse.data.success) {
          const allRequests = incomingResponse.data.connections || [];
          setIncomingRequests(allRequests.filter(req => req.status === 'pending'));
          setDeclinedRequests(allRequests.filter(req => req.status === 'declined'));
        }
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleDisconnect = async (connectionId) => {
    try {
      const response = await axios.delete(`/api/connections/${connectionId}`);
      if (response.data.success) {
        setAcceptedConnections(prev => prev.filter(conn => conn._id !== connectionId));
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleDeleteRequest = async (connectionId) => {
    try {
      const response = await axios.delete(`/api/connections/${connectionId}`);
      if (response.data.success) {
        // Remove from sent requests
        setSentRequests(prev => prev.filter(req => req._id !== connectionId));
        // Remove from declined requests
        setDeclinedRequests(prev => prev.filter(req => req._id !== connectionId));
      }
    } catch (error) {
      console.error('Error deleting request:', error);
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
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          aria-label="Close requests"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="request-popup__header">
          <span className="request-popup__icon">
            {activeTab === 'requests' ? <FaHandPaper aria-hidden="true" /> : 
             activeTab === 'declined' ? <FaTimes aria-hidden="true" /> : 
             activeTab === 'sent' ? <FaPaperPlane aria-hidden="true" /> :
             <FaUserFriends aria-hidden="true" />}
          </span>
          <div>
            <h2 id="request-popup-title" className="request-popup__title">
              {activeTab === 'requests' ? 'Connection Requests' : 
               activeTab === 'declined' ? 'Declined Requests' : 
               activeTab === 'sent' ? 'Sent Requests' :
               'My Connections'}
            </h2>
            <p className="request-popup__subtitle">
              {loading ? 'Loading...' : activeTab === 'requests' 
                ? `${incomingRequests.length} pending request${incomingRequests.length !== 1 ? 's' : ''}`
                : activeTab === 'declined'
                  ? `${declinedRequests.length} declined request${declinedRequests.length !== 1 ? 's' : ''}`
                  : activeTab === 'sent'
                    ? `${sentRequests.length} sent request${sentRequests.length !== 1 ? 's' : ''}`
                    : `${acceptedConnections.length} connection${acceptedConnections.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="request-popup__tabs">
          <button
            type="button"
            className={`request-popup__tab ${activeTab === 'requests' ? 'request-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('requests')}
            aria-label="Requests"
          >
            <FaHandPaper />
            {incomingRequests.length > 0 && (
              <span className="request-popup__tab-badge">{incomingRequests.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`request-popup__tab ${activeTab === 'sent' ? 'request-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('sent')}
            aria-label="Sent"
          >
            <FaPaperPlane />
            {sentRequests.length > 0 && (
              <span className="request-popup__tab-badge">{sentRequests.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`request-popup__tab ${activeTab === 'declined' ? 'request-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('declined')}
            aria-label="Declined"
          >
            <FaTimes />
            {declinedRequests.length > 0 && (
              <span className="request-popup__tab-badge">{declinedRequests.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`request-popup__tab ${activeTab === 'connections' ? 'request-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('connections')}
            aria-label="Connections"
          >
            <FaUserFriends />
          </button>
        </div>

        <div 
          className="request-popup__content"
        >
          {loading ? (
            <div className="request-popup__empty">
              <span className="request-popup__loading">Loading...</span>
            </div>
          ) : activeTab === 'requests' ? (
            incomingRequests.length === 0 ? (
              <div className="request-popup__empty">
                <span className="request-popup__empty-icon">📭</span>
                <p>No pending connection requests</p>
              </div>
            ) : (
              <ul className="request-popup__list">
                {incomingRequests.map((request) => (
                  <li key={request._id} className="request-popup__item">
                    <div className="request-popup__item-avatar">
                      {request.requester_profile?.avatar_url ? (
                        <img 
                          src={request.requester_profile.avatar_url} 
                          alt={`${request.requester_profile.first_name} ${request.requester_profile.last_name}`}
                        />
                      ) : (
                        <span>{request.requester_profile?.first_name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="request-popup__item-info">
                      <div className="request-popup__item-name">
                        {request.requester_profile?.first_name} {request.requester_profile?.last_name}
                      </div>
                      {request.requester_profile?.department && (
                        <div className="request-popup__item-email">{request.requester_profile.department}</div>
                      )}
                      {request.requester_intent && (
                        <div className="request-popup__item-time">{request.requester_intent}</div>
                      )}
                    </div>
                    <div className="request-popup__item-actions">
                      <button
                        type="button"
                        className="request-popup__action-button request-popup__action-button--accept"
                        onClick={() => handleAccept(request._id)}
                        aria-label="Accept request"
                      >
                        <FaCheck aria-hidden="true" />
                        Accept
                      </button>
                      <button
                        type="button"
                        className="request-popup__action-button request-popup__action-button--decline"
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
            )
          ) : activeTab === 'sent' ? (
            sentRequests.length === 0 ? (
              <div className="request-popup__empty">
                <span className="request-popup__empty-icon">📭</span>
                <p>No sent requests</p>
              </div>
            ) : (
              <ul className="request-popup__list">
                {sentRequests.map((request) => (
                  <li key={request._id} className={`request-popup__item ${request.status === 'declined' ? 'request-popup__item--declined' : ''}`}>
                    <div className="request-popup__item-avatar">
                      {request.collaborator?.avatarUrl ? (
                        <img 
                          src={request.collaborator.avatarUrl} 
                          alt={request.collaborator.name}
                        />
                      ) : (
                        <span>{request.collaborator?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="request-popup__item-info">
                      <div className="request-popup__item-name">
                        {request.collaborator?.name}
                      </div>
                      {request.collaborator?.profession && (
                        <div className="request-popup__item-email">{request.collaborator.profession}</div>
                      )}
                      {request.requester_intent && (
                        <div className="request-popup__item-time">{request.requester_intent}</div>
                      )}
                      <div className={`request-popup__item-time ${request.status === 'declined' ? 'request-popup__item-time--declined' : 'request-popup__item-time--pending'}`}>
                        {request.status === 'declined' ? 'Declined' : 'Pending'}
                      </div>
                    </div>
                    <div className="request-popup__item-actions">
                      {request.status === 'declined' ? (
                        <button
                          type="button"
                          className="request-popup__action-button request-popup__action-button--delete"
                          onClick={() => handleDeleteRequest(request._id)}
                          aria-label="Remove request"
                        >
                          <FaUnlink aria-hidden="true" />
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="request-popup__action-button request-popup__action-button--cancel"
                          onClick={() => handleDeleteRequest(request._id)}
                          aria-label="Cancel request"
                        >
                          <FaTimes aria-hidden="true" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === 'declined' ? (
            declinedRequests.length === 0 ? (
              <div className="request-popup__empty">
                <span className="request-popup__empty-icon">📭</span>
                <p>No declined requests</p>
              </div>
            ) : (
              <ul className="request-popup__list">
                {declinedRequests.map((request) => (
                  <li key={request._id} className="request-popup__item request-popup__item--declined">
                    <div className="request-popup__item-avatar">
                      {request.requester_profile?.avatar_url ? (
                        <img 
                          src={request.requester_profile.avatar_url} 
                          alt={`${request.requester_profile.first_name} ${request.requester_profile.last_name}`}
                        />
                      ) : (
                        <span>{request.requester_profile?.first_name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="request-popup__item-info">
                      <div className="request-popup__item-name">
                        {request.requester_profile?.first_name} {request.requester_profile?.last_name}
                      </div>
                      {request.requester_profile?.department && (
                        <div className="request-popup__item-email">{request.requester_profile.department}</div>
                      )}
                      {request.requester_intent && (
                        <div className="request-popup__item-time">{request.requester_intent}</div>
                      )}
                      <div className="request-popup__item-time request-popup__item-time--declined">Declined</div>
                    </div>
                    <div className="request-popup__item-actions">
                      <button
                        type="button"
                        className="request-popup__action-button request-popup__action-button--delete"
                        onClick={() => handleDeleteRequest(request._id)}
                        aria-label="Remove request"
                      >
                        <FaUnlink aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            // Connections tab
            acceptedConnections.length === 0 ? (
              <div className="request-popup__empty">
                <span className="request-popup__empty-icon">👥</span>
                <p>No connections yet</p>
              </div>
            ) : (
              <ul className="request-popup__list">
                {acceptedConnections.map((connection) => {
                  // Determine which profile to show (the other user, not the current user)
                  const isCurrentUserRequester = connection.requester?.uid === user?.email || connection.requester?.email === user?.email;
                  const profile = isCurrentUserRequester ? connection.receiver_profile : connection.requester_profile;
                  
                  if (!profile) return null;
                  
                  // Get the name from the profile or collaborator
                  const displayName = profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : connection.collaborator?.name || 'Unknown User';
                  
                  return (
                    <li key={connection._id} className="request-popup__item request-popup__item--connected">
                      <div className="request-popup__item-avatar">
                        {profile?.avatar_url || connection.collaborator?.avatar_url ? (
                          <img 
                            src={profile?.avatar_url || connection.collaborator?.avatar_url} 
                            alt={displayName}
                          />
                        ) : (
                          <span>{displayName?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="request-popup__item-info">
                        <div className="request-popup__item-name">
                          {displayName}
                        </div>
                        {profile?.department && (
                          <div className="request-popup__item-email">{profile.department}</div>
                        )}
                        <div className="request-popup__item-time">
                          Connected
                        </div>
                      </div>
                      <div className="request-popup__item-actions">
                        <button
                          type="button"
                          className="request-popup__action-button request-popup__action-button--disconnect"
                          onClick={() => handleDisconnect(connection._id)}
                          aria-label="Disconnect"
                        >
                          <FaUnlink aria-hidden="true" />
                          Disconnect
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Request;
