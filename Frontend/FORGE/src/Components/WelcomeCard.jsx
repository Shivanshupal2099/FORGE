import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClipboardList, FaUsers, FaComments, FaTimes, FaRocket } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function WelcomeCard({ onClose }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the welcome message
    const hasSeenWelcome = localStorage.getItem(`forge_welcome_seen_${user?.email}`);
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, [user]);

  const handleClose = () => {
    // Mark as seen in localStorage
    localStorage.setItem(`forge_welcome_seen_${user?.email}`, 'true');
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-card-overlay" onClick={handleClose}>
      <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="welcome-card__close" onClick={handleClose}>
          <FaTimes />
        </button>

        {/* Content */}
        <div className="welcome-card__content">
          {/* Header */}
          <div className="welcome-card__header">
            <div className="welcome-card__icon">
              <FaRocket />
            </div>
            <h1 className="welcome-card__title">
              Welcome to ForgeConnect!
            </h1>
            <p className="welcome-card__subtitle">
              We're excited to have you here, {user?.email?.split('@')[0] || 'User'}!
            </p>
          </div>

          {/* Features */}
          <div className="welcome-card__features">
            <div className="welcome-card__feature">
              <div className="welcome-card__feature-icon">
                <FaCalendarAlt />
              </div>
              <div className="welcome-card__feature-content">
                <h3>Create & Join Events</h3>
                <p>Organize and participate in community events, workshops, and meetups.</p>
              </div>
            </div>

            <div className="welcome-card__feature">
              <div className="welcome-card__feature-icon">
                <FaClipboardList />
              </div>
              <div className="welcome-card__feature-content">
                <h3>Participate in Surveys</h3>
                <p>Share your opinions through surveys and earn Forge tokens for your contributions.</p>
              </div>
            </div>

            <div className="welcome-card__feature">
              <div className="welcome-card__feature-icon">
                <FaUsers />
              </div>
              <div className="welcome-card__feature-content">
                <h3>Discover People</h3>
                <p>Connect with like-minded individuals and expand your professional network. Build, innovate, create, solve complex problems through surveys, launch ideas, and do something better together.</p>
              </div>
            </div>

            <div className="welcome-card__feature">
              <div className="welcome-card__feature-icon">
                <FaComments />
              </div>
              <div className="welcome-card__feature-content">
                <h3>Real-time Communication</h3>
                <p>Engage in instant messaging with connections, participate in group discussions, and stay connected with your network in real-time.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="welcome-card__footer">
            <button className="welcome-card__button" onClick={handleClose}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeCard;