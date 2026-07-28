import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHandPaper, FaCoins, FaTags } from 'react-icons/fa';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import Request from '../Components/Request';
import Tokens from '../Components/Tokens';
import Offer from '../Components/Offer';
import WelcomeCard from '../Components/WelcomeCard';
import SurveyRotator from '../Components/SurveyRotator';
import { useAuth } from '../contexts/AuthContext';



const topActions = [
  { label: 'Request', icon: FaHandPaper, popup: 'request' },
  { label: 'Tokens', icon: FaCoins, popup: 'tokens' },
  { label: 'Offers', icon: FaTags, popup: 'offer' },
];


function HomePage() {
  const [activePopup, setActivePopup] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="page-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Header />
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', overflowY: 'auto' }}>
        <div className="home-top-bar" style={{ width: '100%', maxWidth: '1200px', position: 'relative', top: '0', right: 'auto', left: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
          <div className="home-action-dock" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {topActions.map(({ label, icon: Icon, popup }) => (
              <button
                key={label}
                type="button"
                className="home-action-btn"
                onClick={() => setActivePopup(popup)}
                style={{
                  padding: isMobile ? '12px' : '11px 16px',
                }}
              >
                <Icon aria-hidden="true" />
                {!isMobile && <span>{label}</span>}
              </button>
            ))}
          </div>
          <Link to="/survey" className="home-create-survey-btn">
            <span>+</span>
            {!isMobile && <span>Create Survey</span>}
          </Link>
        </div>

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
      <NavigationBar />

      <WelcomeCard />
      
      {activePopup === 'request' && <Request onClose={() => setActivePopup(null)} />}
      {activePopup === 'tokens' && <Tokens onClose={() => setActivePopup(null)} />}
      {activePopup === 'offer' && <Offer onClose={() => setActivePopup(null)} />}
    </div>
  );
}

export default HomePage;
