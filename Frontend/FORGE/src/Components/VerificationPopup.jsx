import { useEffect } from 'react';
import {
  IoClose,
  IoShieldCheckmark,
  IoPeople,
  IoStar,
  IoChatbubbles,
  IoLockClosed,
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: IoPeople,
    label: 'Connect freely',
    desc: 'Reach verified builders across the community',
  },
  {
    icon: IoStar,
    label: 'Premium access',
    desc: 'Unlock features reserved for verified members',
  },
  {
    icon: IoShieldCheckmark,
    label: 'Build trust',
    desc: 'Show others you are a genuine ForgeConnect member',
  },
  {
    icon: IoChatbubbles,
    label: 'Messaging',
    desc: 'Send connection requests and start conversations',
  },
];

function VerificationPopup({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="verification-popup-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="verification-popup"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-popup-title"
      >
        <div className="verification-popup__accent" aria-hidden="true" />

        <button
          type="button"
          className="verification-popup__close"
          onClick={onClose}
          aria-label="Close popup"
        >
          <IoClose aria-hidden="true" />
        </button>

        <div className="verification-popup__header">
          <div className="verification-popup__icon">
            <IoLockClosed aria-hidden="true" />
          </div>
          <div className="verification-popup__headline">
            <span className="verification-popup__badge">Account locked</span>
            <h2 id="verification-popup-title">Verification required</h2>
          </div>
        </div>

        <div className="verification-popup__benefits">
          <p className="verification-popup__benefits-title">What you unlock</p>
          <ul className="verification-popup__benefits-grid">
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="verification-popup__benefit">
                <span className="verification-popup__benefit-icon" aria-hidden="true">
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
            Verify now
            <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className="verification-popup__button verification-popup__button--secondary"
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationPopup;
