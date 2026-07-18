import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHandPaper, FaHandHoldingHeart, FaCoins, FaTags } from 'react-icons/fa';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import Request from '../Components/Request';
import Donation from '../Components/Donation';
import Tokens from '../Components/Tokens';
import Offer from '../Components/Offer';
import WelcomeCard from '../Components/WelcomeCard';
import { useAuth } from '../contexts/AuthContext';



const topActions = [
  { label: 'Request', icon: FaHandPaper, popup: 'request' },
  { label: 'Donation', icon: FaHandHoldingHeart, popup: 'donation' },
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
      <div style={{ flex: 1, position: 'relative' }}>
        <div className="home-top-bar">
          <div className="home-action-dock">
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
            <span className="home-empty-state__badge">FORGE dashboard</span>
            <h3>Welcome to FORGE</h3>
            <p>Please log in to unlock requests, donations, tokens, offers, and people near you.</p>
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
      </div>
      <NavigationBar />

      <WelcomeCard />
      
      {activePopup === 'request' && <Request onClose={() => setActivePopup(null)} />}
      {activePopup === 'donation' && <Donation onClose={() => setActivePopup(null)} />}
      {activePopup === 'tokens' && <Tokens onClose={() => setActivePopup(null)} />}
      {activePopup === 'offer' && <Offer onClose={() => setActivePopup(null)} />}
    </div>
  );
}

export default HomePage;
