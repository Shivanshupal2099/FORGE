import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHandPaper, FaHandHoldingHeart, FaCoins, FaTags } from 'react-icons/fa';
import NavigationBar from '../Components/NavigationBar';
import Request from '../Components/Request';
import Donation from '../Components/Donation';
import Tokens from '../Components/Tokens';
import Offer from '../Components/Offer';
import Event from '../Components/Event';
import ActiveEvent from '../Components/ActiveEvent';
import SurveyQuestion from '../Components/SurveyQuestion';
import SurveyTaker from '../Components/SurveyTaker';





const topActions = [
  { label: 'Request', icon: FaHandPaper, popup: 'request' },
  { label: 'Donation', icon: FaHandHoldingHeart, popup: 'donation' },
  { label: 'Tokens', icon: FaCoins, popup: 'tokens' },
  { label: 'Offers', icon: FaTags, popup: 'offer' },
];






function HomePage() {
  const [activePopup, setActivePopup] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [surveys, setSurveys] = useState([]);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [mustCompleteSurvey, setMustCompleteSurvey] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadSurveys = () => {
      const savedSurveys = JSON.parse(localStorage.getItem('forge_surveys') || '[]');
      setSurveys(savedSurveys);
    };

    const loadTokenBalance = () => {
      const balance = parseInt(localStorage.getItem('forge_token_balance') || '0');
      setTokenBalance(balance);
    };

    const checkCompulsorySurvey = () => {
      const completedSurveys = JSON.parse(localStorage.getItem('forge_completed_surveys') || '[]');
      const hasCompletedSurvey = completedSurveys.length > 0;
      
      if (!hasCompletedSurvey && surveys.length > 0) {
        setMustCompleteSurvey(true);
        setActiveSurvey(surveys[0]);
      }
    };

    loadSurveys();
    loadTokenBalance();

    const handleStorageChange = () => {
      loadSurveys();
      loadTokenBalance();
      checkCompulsorySurvey();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [surveys.length]);

  const handleAnswerSubmit = (surveyId, answers) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    const answeredCount = Object.keys(answers).length;
    const tokensEarned = answeredCount * 20;

    const currentBalance = parseInt(localStorage.getItem('forge_token_balance') || '0');
    const newBalance = currentBalance + tokensEarned;
    localStorage.setItem('forge_token_balance', newBalance.toString());
    setTokenBalance(newBalance);

    const earnings = JSON.parse(localStorage.getItem('forge_token_earnings') || '[]');
    earnings.unshift({
      id: Date.now(),
      label: `Survey: ${survey.title}`,
      amount: tokensEarned,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
    localStorage.setItem('forge_token_earnings', JSON.stringify(earnings.slice(0, 20)));

    const completedSurveys = JSON.parse(localStorage.getItem('forge_completed_surveys') || '[]');
    if (!completedSurveys.includes(surveyId)) {
      completedSurveys.push(surveyId);
      localStorage.setItem('forge_completed_surveys', JSON.stringify(completedSurveys));
    }

    alert(`Thank you! You earned ${tokensEarned} tokens for ${answeredCount} answered questions.`);
    
    if (mustCompleteSurvey) {
      setMustCompleteSurvey(false);
      setActiveSurvey(null);
    }
  };

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
          <button
            type="button"
            className="home-create-survey-btn"
            onClick={() => setActivePopup('event')}
          >
            <span>+</span>
            {!isMobile && <span>Create Event</span>}
          </button>
          <button
            type="button"
            className="home-create-survey-btn"
            onClick={() => setActivePopup('activeEvent')}
          >
            <span>•</span>
            {!isMobile && <span>Active Events</span>}
          </button>

        </div>

        {surveys.length > 0 && (
          <div className="home-surveys-section">
            <div className="home-surveys-grid">
              {surveys.map((survey) => (
                <SurveyQuestion key={survey.id} survey={survey} onAnswerSubmit={handleAnswerSubmit} />
              ))}
            </div>
          </div>
        )}
      </div>
      <NavigationBar />

      {activePopup === 'request' && <Request onClose={() => setActivePopup(null)} />}
      {activePopup === 'donation' && <Donation onClose={() => setActivePopup(null)} />}
      {activePopup === 'tokens' && <Tokens onClose={() => setActivePopup(null)} />}
      {activePopup === 'offer' && <Offer onClose={() => setActivePopup(null)} />}
      {activePopup === 'event' && <Event onClose={() => setActivePopup(null)} />}
      {activePopup === 'activeEvent' && <ActiveEvent onClose={() => setActivePopup(null)} />}

      {activeSurvey && (
        <SurveyTaker 
          survey={activeSurvey} 
          onClose={() => {
            setActiveSurvey(null);
            if (mustCompleteSurvey) {
              setMustCompleteSurvey(false);
            }
          }}
          isCompulsory={mustCompleteSurvey}
        />
      )}
    </div>
  );
}

export default HomePage;





