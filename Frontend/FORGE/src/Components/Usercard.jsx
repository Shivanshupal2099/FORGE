import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Usercard.css';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import axios from '../api/axios';
import VerificationPopup from './VerificationPopup';

const Usercard = ({ user, onClose, visibilitySettings, currentUserEmail }) => {
  const { user: currentUser, isVerified: currentUserIsVerified } = useAuth();
  const { error: showError, success: showSuccess } = useAlert();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, sent, error
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showSelfVerificationPopup, setShowSelfVerificationPopup] = useState(false);
  const [showTargetUserWarning, setShowTargetUserWarning] = useState(false);

  const settings = visibilitySettings || {
    show_name: true,
    show_profession: true,
    show_domain: true,
    show_location: true,
    show_social_links: true,
    show_looking_for: true,
    show_services: true
  };

  // Check if this is the current user's own card
  const isOwnUser = user?.email === currentUserEmail;

  const handleConnectClick = async () => {
    // Prevent duplicate requests
    if (connectionStatus === 'sent' || connectionLoading) {
      return;
    }

    // Check if current user is verified - use AuthContext as source of truth
    if (currentUserIsVerified === false) {
      console.log('Current user is not verified, showing verification popup');
      setShowSelfVerificationPopup(true);
      return;
    }

    // Check if the target user is verified
    if (user.isVerified === false) {
      setShowTargetUserWarning(true);
      return;
    }

    try {
      setConnectionLoading(true);
      setConnectionStatus('idle');

      console.log('Sending connection request to:', user.email);
      console.log('Current user authenticated:', !!currentUser);
      
      const response = await axios.post('/api/connections', {
        receiver_uid: user.email
      });

      console.log('Connection request response:', response.data);

      if (response.data.success) {
        setConnectionStatus('sent');
      } else {
        // Check if the error is due to an existing request
        const errorMessage = response.data.message?.toLowerCase() || '';
        const isExistingRequest = errorMessage.includes('already') || 
                                  errorMessage.includes('pending') || 
                                  errorMessage.includes('connected') ||
                                  response.status === 409;
        
        if (isExistingRequest) {
          // If request already exists, treat it as sent
          console.log('Connection request already exists, treating as sent');
          setConnectionStatus('sent');
        } else {
          setConnectionStatus('error');
          console.error('Connection request failed:', response.data.message);
          showError('Failed to send connection request: ' + response.data.message);
        }
      }
    } catch (error) {
      console.error('Connection request error:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      
      // Check if the error is due to an existing request
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      const isExistingRequest = errorMessage.includes('already') || 
                                errorMessage.includes('pending') || 
                                errorMessage.includes('connected') ||
                                error.response?.status === 409;
      
      if (isExistingRequest) {
        // If request already exists, treat it as sent
        console.log('Connection request already exists (error case), treating as sent');
        setConnectionStatus('sent');
      } else if (error.response?.status === 401) {
        setConnectionStatus('error');
        console.error('Authentication error - user not logged in');
        showError('You are not authenticated. Please log in again.');
      } else if (error.response?.status === 404) {
        setConnectionStatus('error');
        console.error('User not found error');
        showError('User not found. They may have deleted their account.');
      } else if (error.response?.status === 403) {
        setConnectionStatus('error');
        console.error('Verification required error');
        setShowSelfVerificationPopup(true);
      } else {
        setConnectionStatus('error');
        console.error('Error sending connection request:', error.response?.data?.message || error.message);
        showError('Failed to send connection request. Please try again.');
      }
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleTalkClick = () => {
    // Store the selected user info for ChatPage
    if (connectionId) {
      localStorage.setItem('selectedChatUser', JSON.stringify({
        uid: user.email,
        name: user.name,
        connectionId: connectionId
      }));
      navigate('/chat');
      onClose();
    }
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user?.email) return;

      try {
        setLoadingStatus(true);
        const response = await axios.get(`/api/auth/status/${user.email}`);
        if (response.data.success && response.data.status) {
          setIsOnline(response.data.status.is_online);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        setIsOnline(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchUserStatus();

    // Refresh status every 30 seconds
    const intervalId = setInterval(fetchUserStatus, 30000);

    return () => clearInterval(intervalId);
  }, [user?.email]);

  // Check if user is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!user?.email) return;

      try {
        setCheckingConnection(true);
        const response = await axios.get('/api/connections/accepted');
        if (response.data.success) {
          const connection = response.data.connections.find(conn => {
            const partner = conn.collaborator;
            return partner?.uid === user.email || partner?.email === user.email;
          });
          
          if (connection) {
            setIsConnected(true);
            setConnectionId(connection._id);
          } else {
            setIsConnected(false);
            setConnectionId(null);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkConnection();
  }, [user?.email]);

  if (!user) return null;

  console.log('Usercard received user:', user);
  console.log('Usercard isVerified:', user.isVerified);
  console.log('Usercard isVerified type:', typeof user.isVerified);
  console.log('Current user from AuthContext:', currentUser);
  console.log('Current user isVerified from AuthContext:', currentUserIsVerified);
  console.log('Current user isVerified type:', typeof currentUserIsVerified);

  const handleConnectRequestAnyway = async () => {
    // Double-check current user verification status
    if (currentUserIsVerified === false) {
      console.log('Current user is not verified, showing verification popup');
      setShowSelfVerificationPopup(true);
      return;
    }

    try {
      setConnectionLoading(true);
      setConnectionStatus('idle');

      console.log('Sending connection request to non-verified user:', user.email);
      
      const response = await axios.post('/api/connections', {
        receiver_uid: user.email
      });

      console.log('Connection request response:', response.data);

      if (response.data.success) {
        setConnectionStatus('sent');
      } else {
        const errorMessage = response.data.message?.toLowerCase() || '';
        const isExistingRequest = errorMessage.includes('already') || 
                                  errorMessage.includes('pending') || 
                                  errorMessage.includes('connected') ||
                                  response.status === 409;
        
        if (isExistingRequest) {
          setConnectionStatus('sent');
        } else {
          setConnectionStatus('error');
          showError('Failed to send connection request: ' + response.data.message);
        }
      }
    } catch (error) {
      console.error('Connection request error:', error.response?.data);
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      const isExistingRequest = errorMessage.includes('already') || 
                                errorMessage.includes('pending') || 
                                errorMessage.includes('connected') ||
                                error.response?.status === 409;
      
      if (isExistingRequest) {
        setConnectionStatus('sent');
      } else if (error.response?.status === 401) {
        setConnectionStatus('error');
        showError('You are not authenticated. Please log in again.');
      } else if (error.response?.status === 404) {
        setConnectionStatus('error');
        showError('User not found. They may have deleted their account.');
      } else {
        setConnectionStatus('error');
        showError('Failed to send connection request. Please try again.');
      }
    } finally {
      setConnectionLoading(false);
    }
  };

  return (
    <>
      <div className="usercard-overlay" onClick={onClose}>
        <div className="usercard" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button className="usercard__close" onClick={onClose}>
            ✕
          </button>

          {/* Header with photo and verified badge */}
          <div className="usercard__header">
            <div className="usercard__photoWrapper">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="usercard__photo" />
              ) : (
                <div className="usercard__photoPlaceholder">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {(user.isVerified !== undefined && user.isVerified) && (
                <div className="usercard__verifiedBadge" title="Verified User">
                  ✓
                </div>
              )}
              {(user.isVerified !== undefined && !user.isVerified) && (
                <div className="usercard__verifiedBadge usercard__verifiedBadge--unverified" title="Non Verified">
                  !
                </div>
              )}
            </div>
            <div className="usercard__headerInfo">
              <h2 className="usercard__name">
                {settings.show_name ? user.name : 'Anonymous'}
                {user.isVerified !== undefined && (
                  <span className={`usercard__verifiedText ${user.isVerified ? 'usercard__verifiedText--verified' : 'usercard__verifiedText--unverified'}`}>
                    {user.isVerified ? 'Verified' : 'Non Verified'}
                  </span>
                )}
              </h2>
              {settings.show_profession && <p className="usercard__profession">{user.profession}</p>}
              <div className="usercard__status">
                <span
                  className={`usercard__statusDot ${isOnline ? 'usercard__statusDot--online' : 'usercard__statusDot--offline'}`}
                  style={{
                    backgroundColor: loadingStatus ? '#ccc' : (isOnline ? '#10b981' : '#ef4444')
                  }}
                />
                {loadingStatus ? 'Loading...' : (isOnline ? 'Online' : 'Offline')}
              </div>
            </div>
          </div>

          {/* Looking For */}
          {user.lookingFor && user.lookingFor.length > 0 && settings.show_looking_for && (
            <div className="usercard__section">
              <h3 className="usercard__sectionTitle">Looking For</h3>
              <div className="usercard__tags">
                {user.lookingFor.map((item, index) => (
                  <span key={index} className="usercard__tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {user.socialLinks && Object.keys(user.socialLinks).length > 0 && settings.show_social_links && (
            <div className="usercard__section">
              <h3 className="usercard__sectionTitle">Social Links</h3>
              <div className="usercard__socialLinks">
                {user.socialLinks.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                    LinkedIn
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                    Twitter
                  </a>
                )}
                {user.socialLinks.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                    GitHub
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwnUser && (
            <div className="usercard__actions">
              {checkingConnection ? (
                <button 
                  className="usercard__actionButton usercard__actionButton--primary"
                  disabled
                >
                  Checking...
                </button>
              ) : isConnected ? (
                <button 
                  className="usercard__actionButton usercard__actionButton--primary"
                  onClick={handleTalkClick}
                >
                  Talk
                </button>
              ) : (
                <button 
                  className="usercard__actionButton usercard__actionButton--primary"
                  onClick={handleConnectClick}
                  disabled={connectionLoading || connectionStatus === 'sent'}
                >
                  {connectionLoading ? 'Sending...' : connectionStatus === 'sent' ? 'Request Sent' : connectionStatus === 'error' ? 'Try Again' : 'Connect'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verification Popup for Non-Verified Target User - Outside Usercard */}
      {showTargetUserWarning && (
        <div className="usercard__verificationPopup" onClick={() => setShowTargetUserWarning(false)}>
          <div className="usercard__verificationPopupContent" onClick={(e) => e.stopPropagation()}>
            <div className="usercard__verificationPopupHeader">
              <div className="usercard__verificationPopupIcon">⚠️</div>
              <h3>User Not Verified</h3>
            </div>
            <div className="usercard__verificationPopupBody">
              <p>This user is not verified on ForgeConnect. For your safety, we recommend connecting only with verified users.</p>
              <p>Verified users have completed additional security checks and are more likely to be genuine.</p>
            </div>
            <div className="usercard__verificationPopupActions">
              <button 
                className="usercard__verificationPopupButton usercard__verificationPopupButton--secondary"
                onClick={() => setShowTargetUserWarning(false)}
              >
                Cancel
              </button>
              <button 
                className="usercard__verificationPopupButton usercard__verificationPopupButton--primary"
                onClick={() => {
                  setShowTargetUserWarning(false);
                  // Proceed with connection request anyway
                  handleConnectRequestAnyway();
                }}
              >
                Connect Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self Verification Popup - Current User Not Verified - Outside Usercard */}
      {showSelfVerificationPopup && (
        <VerificationPopup
          onClose={() => setShowSelfVerificationPopup(false)}
        />
      )}
    </>
  );
};

export default Usercard;
