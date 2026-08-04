import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

function ConnectedUsersPopup({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const response = await axios.get('/api/connections/connected');
        if (response.data.success) {
          setConnectedUsers(response.data.connections || []);
        }
      } catch (error) {
        console.error('Error fetching connected users:', error);
        setConnectedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedUsers();
  }, [user?.email]);

  const handleUserClick = (connectedUser) => {
    const userEmail = connectedUser.email || connectedUser.requester_email || connectedUser.receiver_email;
    if (userEmail) {
      navigate(`/profile/${userEmail}`);
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: isMobile ? '0' : '24px',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: isMobile ? '24px 24px 0 0' : '28px',
            maxWidth: isMobile ? '100%' : '500px',
            width: '100%',
            maxHeight: isMobile ? '85vh' : '80vh',
            overflow: 'hidden',
            position: 'relative',
            border: 'none',
            padding: isMobile ? '24px' : '32px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: isMobile ? '16px' : '20px',
              right: isMobile ? '16px' : '20px',
              width: isMobile ? '44px' : '48px',
              height: isMobile ? '44px' : '48px',
              borderRadius: '999px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
            }}
          >
            <FaTimes style={{ fontSize: isMobile ? '18px' : '20px', color: '#111111' }} />
          </button>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              margin: 0,
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: '800',
              color: '#111111',
              marginBottom: '8px',
            }}>
              Connected Users
            </h2>
            <p style={{
              margin: 0,
              fontSize: isMobile ? '14px' : '15px',
              color: '#64748b',
              fontWeight: '500',
            }}>
              {connectedUsers.length} {connectedUsers.length === 1 ? 'connection' : 'connections'}
            </p>
          </div>

          <div
            style={{
              maxHeight: isMobile ? 'calc(85vh - 120px)' : 'calc(80vh - 120px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '4px',
            }}
          >
            <style>{`
              .connected-users-list::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#FF6B00',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px',
                }} />
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <p style={{ color: '#64748b', fontWeight: '500' }}>Loading connections...</p>
              </div>
            ) : connectedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FaUser style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>No connections yet</p>
                <p style={{ color: '#94a3b8', fontWeight: '400', fontSize: '14px' }}>Start connecting with people to see them here</p>
              </div>
            ) : (
              <div className="connected-users-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connectedUsers.map((connectedUser, index) => {
                  const userEmail = connectedUser.email || connectedUser.requester_email || connectedUser.receiver_email;
                  const userName = connectedUser.name || connectedUser.first_name || userEmail?.split('@')[0] || 'Unknown';
                  const userPhoto = connectedUser.photo || connectedUser.avatar_url || null;

                  return (
                    <div
                      key={connectedUser._id || index}
                      onClick={() => handleUserClick(connectedUser)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 107, 0, 0.08)';
                        e.target.style.borderColor = 'rgba(255, 107, 0, 0.2)';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: isMobile ? '48px' : '56px',
                        height: isMobile ? '48px' : '56px',
                        borderRadius: '50%',
                        background: userPhoto 
                          ? `url(${userPhoto}) center/cover` 
                          : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}>
                        {!userPhoto && (
                          <FaUser style={{ fontSize: isMobile ? '20px' : '24px', color: '#ffffff' }} />
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          margin: '0 0 4px',
                          fontSize: isMobile ? '15px' : '16px',
                          fontWeight: '700',
                          color: '#111111',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {userName}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: isMobile ? '13px' : '14px',
                          color: '#64748b',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {userEmail}
                        </p>
                      </div>

                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
                        color: '#059669',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                      }}>
                        Connected
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ConnectedUsersPopup;
