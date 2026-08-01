import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './ConnectionsBar.css';

const ConnectionsBar = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('/api/connections/accepted');
      console.log('Connections response:', response.data);
      if (response.data.success) {
        setConnections(response.data.connections || []);
        console.log('Connections set:', response.data.connections);
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
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectionsBar;
