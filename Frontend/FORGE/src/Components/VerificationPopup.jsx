import { useEffect } from 'react';
import { IoClose, IoShieldCheckmark } from 'react-icons/io5';
import { Link } from 'react-router-dom';

function VerificationPopup({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="verification-popup-overlay" onClick={onClose}>
      <div
        className="verification-popup"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-popup-title"
      >
        <button
          type="button"
          className="verification-popup__close"
          onClick={onClose}
          aria-label="Close popup"
        >
          <IoClose aria-hidden="true" />
        </button>

        <div className="verification-popup__icon">
          <IoShieldCheckmark aria-hidden="true" />
        </div>

        <div className="verification-popup__content">
          <h2 id="verification-popup-title">Verification Required</h2>
          <p>
            Verify your account to connect with other users and access premium features.
          </p>
          <p className="verification-popup__highlight">
            <strong>Benefits of verification:</strong>
          </p>
          <ul className="verification-popup__benefits">
            <li>Connect with verified users</li>
            <li>Access premium features</li>
            <li>Build trust in the community</li>
            <li>Unlock messaging capabilities</li>
          </ul>
        </div>

        <div className="verification-popup__actions">
          <Link
            to="/profile"
            className="verification-popup__button verification-popup__button--primary"
            onClick={onClose}
          >
            Verify Now
          </Link>
          <button
            type="button"
            className="verification-popup__button verification-popup__button--secondary"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationPopup;