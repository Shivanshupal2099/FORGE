import { useEffect, useState } from 'react';
import { FaHandPaper, FaTimes, FaCheck, FaUserFriends, FaUnlink } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import { generateKeyPair, exportPublicKey } from '../utils/encryption';

function Request({ onClose, onConnectionAccepted }) {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
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
        const response = await axios.get('/api/connections/incoming');
        if (response.data.success) {
          setIncomingRequests(response.data.connections || []);
        }
      } catch (error) {
        console.error('Error fetching incoming requests:', error);
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
      await Promise.all([fetchIncomingRequests(), fetchAcceptedConnections()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      // Generate key pair for E2E encryption
      const keyPair = await generateKeyPair();
      const publicKey = await exportPublicKey(keyPair);

      // Get the requester's email from the request
      const request = incomingRequests.find(req => req._id === connectionId);
      if (!request) return;

      // Store key pair in localStorage for later use
      const privateKeyExported = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
      localStorage.setItem(`encryption_key_${request.collaborator.uid}`, JSON.stringify({
        privateKey: privateKeyExported,
        publicKey: publicKey
      }));

      const response = await axios.put(`/api/connections/${connectionId}/accept`, {
        receiver_public_key: publicKey
      });
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
        setIncomingRequests(prev => prev.filter(req => req._id !== connectionId));
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
            {activeTab === 'requests' ? <FaHandPaper aria-hidden="true" /> : <FaUserFriends aria-hidden="true" />}
          </span>
          <div>
            <h2 id="request-popup-title" className="request-popup__title">
              {activeTab === 'requests' ? 'Connection Requests' : 'My Connections'}
            </h2>
            <p className="request-popup__subtitle">
              {loading ? 'Loading...' : activeTab === 'requests' 
                ? `${incomingRequests.length} pending request${incomingRequests.length !== 1 ? 's' : ''}`
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
          >
            <FaHandPaper />
            Requests
            {incomingRequests.length > 0 && (
              <span className="request-popup__tab-badge">{incomingRequests.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`request-popup__tab ${activeTab === 'connections' ? 'request-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            <FaUserFriends />
            Connections
          </button>
        </div>

        <div className="request-popup__content">
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
            )
          ) : (
            // Connections tab
            acceptedConnections.length === 0 ? (
              <div className="request-popup__empty">
                <span className="request-popup__empty-icon">👥</span>
                <p>No connections yet</p>
              </div>
            ) : (
              <ul className="request-list">
                {acceptedConnections.map((connection) => {
                  // Determine which profile to show (the other user, not the current user)
                  const isCurrentUserRequester = connection.requester?.uid === user?.email;
                  const profile = isCurrentUserRequester ? connection.receiver_profile : connection.requester_profile;
                  
                  if (!profile) return null;
                  
                  return (
                    <li key={connection._id} className="request-card request-card--connected">
                      <div className="request-card__profile">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={`${profile.first_name} ${profile.last_name}`}
                            className="request-card__avatar"
                          />
                        ) : (
                          <div className="request-card__avatar-placeholder">
                            {profile?.first_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="request-card__info">
                          <h3 className="request-card__name">
                            {profile?.first_name} {profile?.last_name}
                          </h3>
                          {profile?.department && (
                            <p className="request-card__profession">{profile.department}</p>
                          )}
                          <p className="request-card__status">
                            {isCurrentUserRequester ? 'Request sent' : 'Connected'}
                          </p>
                        </div>
                      </div>
                      <div className="request-card__actions">
                        <button
                          type="button"
                          className="request-card__button request-card__button--disconnect"
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
