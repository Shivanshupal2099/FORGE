import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineVerified } from 'react-icons/md';
import axios from '../api/axios';
import { useSocket } from '../contexts/SocketContext';
import './ConnectionsBar.css';

const ConnectionsBar = () => {
  const [connections, setConnections] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchConnections();
  }, []);

  // Listen for connection updates via socket
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('connection:removed', handleConnectionRemoved);
      socket.on('connection:accepted', handleConnectionAdded);

      return () => {
        socket.off('connection:removed', handleConnectionRemoved);
        socket.off('connection:accepted', handleConnectionAdded);
      };
    }
  }, [socket, isConnected]);

  const handleConnectionRemoved = (data) => {
    console.log('Connection removed via socket:', data);
    setConnections(prev => prev.filter(conn => conn._id !== data.connectionId));
  };

  const handleConnectionAdded = (data) => {
    console.log('Connection added via socket:', data);
    fetchConnections();
  };

  const fetchConnections = async () => {
    try {
      const response = await axios.get('/api/connections/accepted');
      console.log('Connections response:', response.data);
      if (response.data.success) {
        // Filter out connections with null collaborator (deleted users)
        const validConnections = (response.data.connections || []).filter(
          connection => connection.collaborator !== null && connection.collaborator !== undefined
        );
        setConnections(validConnections);
        console.log('Connections set (filtered):', validConnections);
        
        // Fetch verification status for all valid connections
        const verificationPromises = validConnections.map(async (connection) => {
          const collaborator = connection.collaborator || connection;
          const email = collaborator.email || collaborator.uid || 
                        connection.email || connection.uid ||
                        connection.requester_profile?.email || connection.requester_profile?.uid ||
                        connection.receiver_profile?.email || connection.receiver_profile?.uid;
          
          if (email) {
            try {
              const verifyResponse = await axios.get(`/api/auth/verification-status/email/${email}`);
              return { email, isVerified: verifyResponse.data.is_verified };
            } catch (error) {
              // Don't block if verification status endpoint is not available
              console.log('Verification status endpoint not available for:', email);
              return { email, isVerified: false };
            }
          }
          return null;
        });
        
        const verificationResults = await Promise.all(verificationPromises);
        const verifiedMap = {};
        verificationResults.forEach(result => {
          if (result) {
            verifiedMap[result.email] = result.isVerified;
          }
        });
        setVerifiedUsers(verifiedMap);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionClick = (connection) => {
    // Navigate to profile when clicking on a connection
    const collaborator = connection.collaborator || connection;
    
    // Try different possible email fields - handle both email and uid field names
    const email = collaborator.email || collaborator.uid || 
                  connection.email || connection.uid ||
                  connection.requester_profile?.email || connection.requester_profile?.uid ||
                  connection.receiver_profile?.email || connection.receiver_profile?.uid;
    
    if (email) {
      // Navigate to profile page with user email as parameter
      console.log('Navigating to profile:', email);
      navigate(`/profile/${encodeURIComponent(email)}`);
    } else {
      console.error('No email found in connection data');
      console.error('Full connection object:', JSON.stringify(connection, null, 2));
    }
  };

  if (loading) {
    return null;
  }

  if (connections.length === 0) {
    return null;
  }

  return (
    <div className="connections-bar">
      <div className="connections-bar__scroll">
        {connections.map((connection) => {
          const collaborator = connection.collaborator || connection;
          const displayName = collaborator.name || collaborator.email?.split('@')[0] || collaborator.uid?.split('@')[0] || 'User';
          const displayEmail = collaborator.email || collaborator.uid || '';
          const avatarUrl = collaborator.avatar_url || collaborator.avatarUrl;
          
          return (
            <div
              key={connection._id || connection.connectionId}
              className="connections-bar__item"
              onClick={() => handleConnectionClick(connection)}
              title={displayName}
            >
              <div className="connections-bar__avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('connections-bar__avatar--fallback');
                    }}
                  />
                ) : (
                  <span className="connections-bar__initial">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="connections-bar__name">
                {displayName}
                {verifiedUsers[displayEmail] && (
                  <MdOutlineVerified 
                    style={{ 
                      color: '#3b82f6', 
                      fontSize: '0.9rem',
                      marginLeft: '4px',
                      verticalAlign: 'middle'
                    }} 
                    title="Verified User"
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectionsBar;
