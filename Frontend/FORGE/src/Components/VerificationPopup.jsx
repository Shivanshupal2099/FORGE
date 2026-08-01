import { useEffect, useState } from 'react';
import {
  IoClose,
  IoShieldCheckmark,
  IoPeople,
  IoStar,
  IoChatbubbles,
  IoLockClosed,
  IoDiamond,
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: IoPeople,
    label: 'Connect freely',
    desc: 'Reach verified builders across the community',
    color: '#667eea'
  },
  {
    icon: IoStar,
    label: 'Premium access',
    desc: 'Create new surveys, access community offers',
    color: '#f093fb'
  },
  {
    icon: IoShieldCheckmark,
    label: 'Build trust',
    desc: 'Show others you are a genuine ForgeConnect member',
    color: '#4facfe'
  },
  {
    icon: IoChatbubbles,
    label: 'Messaging',
    desc: 'Send connection requests and start conversations',
    color: '#43e97b'
  },
];

function VerificationPopup({ onClose }) {
  const [platform, setPlatform] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect platform
    const detectPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
      }
      if (/android/i.test(userAgent)) {
        return 'android';
      }
      return 'desktop';
    };

    // Detect mobile
    const checkMobile = () => {
      return window.innerWidth <= 768;
    };

    setPlatform(detectPlatform());
    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const platformClass = `verification-popup--${platform}`;
  const mobileClass = isMobile ? 'verification-popup--mobile' : '';

  return (
    <div
      className={`verification-popup-overlay ${platformClass} ${mobileClass}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`verification-popup ${platformClass} ${mobileClass}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-popup-title"
      >
        <div className="verification-popup__accent" aria-hidden="true" />
        <div className="verification-popup__accent2" aria-hidden="true" />

        <button
          type="button"
          className="verification-popup__close"
          onClick={onClose}
          aria-label="Close popup"
        >
          <IoClose aria-hidden="true" />
        </button>

        <div className="verification-popup__header">
          <div className="verification-popup__icon-wrapper">
            <div className="verification-popup__icon-bg" />
            <div className="verification-popup__icon">
              <IoLockClosed aria-hidden="true" />
            </div>
          </div>
          <div className="verification-popup__headline">
            <span className="verification-popup__badge">Premium Verification</span>
            <h2 id="verification-popup-title">Unlock Your Full Potential</h2>
            <p className="verification-popup__subtitle">
              Verify your account to access exclusive features and connect with the community
            </p>
          </div>
        </div>

        <div className="verification-popup__pricing">
          <div className="verification-popup__price-tag">
            <span className="verification-popup__price-amount">₹299</span>
            <span className="verification-popup__price-period">/year</span>
          </div>
          <div className="verification-popup__price-features">
            <span>Annual verification</span>
            <span>All premium features</span>
          </div>
        </div>

        <div className="verification-popup__benefits">
          <p className="verification-popup__benefits-title">What you unlock</p>
          <ul className="verification-popup__benefits-grid">
            {BENEFITS.map(({ icon: Icon, label, desc, color }) => (
              <li key={label} className="verification-popup__benefit">
                <span 
                  className="verification-popup__benefit-icon" 
                  aria-hidden="true"
                  style={{ background: color }}
                >
                  <Icon />
                </span>
                <div>
                  <strong>{label}</strong>
                  <span>{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="verification-popup__actions">
          <Link
            to="/profile"
            className="verification-popup__button verification-popup__button--primary"
            onClick={onClose}
          >
            <span className="verification-popup__button-content">
              <IoDiamond aria-hidden="true" />
              Verify Now for ₹299/year
            </span>
            <span className="verification-popup__button-arrow" aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className="verification-popup__button verification-popup__button--secondary"
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>

        <div className="verification-popup__trust">
          <span className="verification-popup__trust-item">
            <IoShieldCheckmark aria-hidden="true" />
            Secure payment
          </span>
        </div>
      </div>
    </div>
  );
}

export default VerificationPopup;
