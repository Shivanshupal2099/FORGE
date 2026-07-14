import { useEffect, useState } from 'react';
import { FaHandPaper, FaTimes } from 'react-icons/fa';

function Request({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [activeRequests, setActiveRequests] = useState([]);

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--request"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close request popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaHandPaper aria-hidden="true" />
          </span>
          <div>
            <h2 id="request-popup-title" className="home-popup__title">
              Requests
            </h2>
            <p className="home-popup__subtitle">
              Ask the community for help, resources, or support using Forge tokens.
            </p>
          </div>
        </div>

        <div className="home-popup-actions">
          <button type="button" className="button-primary">
            Create Request
          </button>
          <button type="button" className="button-secondary">
            My Requests
          </button>
        </div>

        <div className="home-popup-section">
          <h3 className="home-popup-section__title">Active requests</h3>
          <ul className="home-popup-list">
            {activeRequests.map(({ id, title, category, tokens, status }) => (
              <li key={id} className="home-popup-list__item">
                <div className="home-popup-list__main">
                  <span className="home-popup-list__label">{title}</span>
                  <span className="home-popup-list__meta">{category}</span>
                </div>
                <div className="home-popup-list__aside">
                  <span className="home-popup-list__badge">{status}</span>
                  <span className="home-popup-list__value">{tokens} tokens</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Request;
