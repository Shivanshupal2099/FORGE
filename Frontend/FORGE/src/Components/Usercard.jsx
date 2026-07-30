import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Usercard.css';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

const Usercard = ({ user, onClose, visibilitySettings, currentUserEmail }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, sent, error
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(true);

  const settings = visibilitySettings || {
    show_name: true,
    show_bio: true,
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

    try {
      setConnectionLoading(true);
      setConnectionStatus('idle');

      console.log('Sending connection request to:', user.email);
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
        }
      }
    } catch (error) {
      console.error('Connection request error:', error.response?.data);
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
      } else {
        setConnectionStatus('error');
        console.error('Error sending connection request:', error.response?.data?.message || error.message);
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

  return (
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
            {user.isVerified && (
              <div className="usercard__verifiedBadge" title="Verified User">
                ✓
              </div>
            )}
          </div>
          <div className="usercard__headerInfo">
            <h2 className="usercard__name">
              {settings.show_name ? user.name : 'Anonymous'}
              {user.isVerified && <span className="usercard__verifiedText">Verified</span>}
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

        {/* Bio */}
        {user.bio && settings.show_bio && (
          <div className="usercard__section">
            <h3 className="usercard__sectionTitle">About</h3>
            <p className="usercard__bio">{user.bio}</p>
          </div>
        )}

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
  );
};

export default Usercard;
