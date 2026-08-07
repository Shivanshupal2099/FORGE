import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHandPaper, FaTags, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import Request from '../Components/Request';
import Offer from '../Components/Offer';
import WelcomeCard from '../Components/WelcomeCard';
import SurveyRotator from '../Components/SurveyRotator';
import ConnectedUsersPopup from '../Components/ConnectedUsersPopup';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';



const topActions = [
  { label: 'Request', icon: FaHandPaper, popup: 'request' },
  { label: 'Connected', icon: FaUserFriends, popup: 'connected' },
  { label: 'Nearby', icon: FaMapMarkerAlt, link: '/nearby' },
  { label: 'Offers', icon: FaTags, popup: 'offer' },
];


function HomePage() {
  const [activePopup, setActivePopup] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pendingRequests, setPendingRequests] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get('/api/connections/incoming');
        if (response.data.success) {
          setPendingRequests(response.data.connections?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
    
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleRequestUpdate = () => {
    // Refresh pending requests count
    const fetchPendingRequests = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get('/api/connections/incoming');
        if (response.data.success) {
          setPendingRequests(response.data.connections?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  };

  return (
    <div
      className="page-shell minimal-ivory-grid"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Header 
        mobileActions={isMobile ? topActions.map(({ label, icon, popup, link }) => ({
          label,
          icon,
          popup,
          link,
          onClick: popup ? () => setActivePopup(popup) : undefined
        })) : null}
        pendingRequests={pendingRequests}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
      `}</style>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', overflowY: 'auto' }}>
        {/* Action buttons - shown only in desktop */}
        {user && !isMobile && (
          <div className="home-action-dock" style={{ 
            width: '100%',
            maxWidth: '1200px',
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: '8px', 
            alignItems: 'center', 
            flexShrink: 0,
            marginBottom: '20px',
          }}>
            {topActions.map(({ label, icon: Icon, popup, link }) => (
              link ? (
                <Link
                  key={label}
                  to={link}
                  className="home-action-btn"
                  style={{
                    padding: '11px 16px',
                    position: 'relative',
                    textDecoration: 'none',
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ) : (
                <button
                  key={label}
                  type="button"
                  className="home-action-btn"
                  onClick={() => setActivePopup(popup)}
                  style={{
                    padding: '11px 16px',
                    position: 'relative',
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  {label === 'Request' && pendingRequests > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#ff0000',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 2px 8px rgba(255, 0, 0, 0.4)',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  )}
                </button>
              )
            ))}
            <Link to="/survey" className="home-create-survey-btn">
              <span>+</span>
              <span>Create Survey</span>
            </Link>
          </div>
        )}
        
        {/* Show message if not logged in */}
        {!user && (
          <div className="home-empty-state">
            <div className="home-empty-state__preview" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="home-empty-state__badge">ForgeConnect dashboard</span>
            <h3>Welcome to ForgeConnect</h3>
            <p>Please log in to unlock requests, tokens, offers, and people near you.</p>
            <div className="home-empty-state__actions">
              <Link to="/login" className="button-primary home-empty-state__cta">
                Get Started
              </Link>
              <Link to="/" className="button-secondary home-empty-state__cta">
                Learn More
              </Link>
            </div>
          </div>
        )}

        {/* Survey Card - shown in center like feed */}
        {user && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SurveyRotator />
          </div>
        )}
      </div>
      <NavigationBar isChatPage={false} />

      <WelcomeCard />
      
      {activePopup === 'request' && <Request onClose={() => setActivePopup(null)} onConnectionAccepted={handleRequestUpdate} />}
      {activePopup === 'connected' && <ConnectedUsersPopup onClose={() => setActivePopup(null)} />}
      {activePopup === 'offer' && <Offer onClose={() => setActivePopup(null)} />}
    </div>
  );
}

export default HomePage;
