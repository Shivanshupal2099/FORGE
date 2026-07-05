import { useEffect, useState } from 'react';
import { FaCoins, FaTimes } from 'react-icons/fa';

function Tokens({ onClose }) {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [earnings, setEarnings] = useState([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const loadTokens = () => {
      const balance = parseInt(localStorage.getItem('forge_token_balance') || '0');
      const savedEarnings = JSON.parse(localStorage.getItem('forge_token_earnings') || '[]');
      setTokenBalance(balance);
      setEarnings(savedEarnings);
    };

    loadTokens();

    const handleStorageChange = () => {
      loadTokens();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--tokens"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tokens-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close tokens popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaCoins aria-hidden="true" />
          </span>
          <div>
            <h2 id="tokens-popup-title" className="home-popup__title">
              Earned Tokens
            </h2>
            <p className="home-popup__subtitle">
              Track the tokens you've earned through your contributions.
            </p>
          </div>
        </div>

        <div className="home-popup-highlight">
          <span className="home-popup-highlight__label">Total earned</span>
          <span className="home-popup-highlight__value">{tokenBalance}</span>
        </div>

        <div className="home-popup-section">
          <h3 className="home-popup-section__title">Recent earnings</h3>
          <ul className="home-popup-list">
            {earnings.length > 0 ? (
              earnings.map(({ id, label, amount, date }) => (
                <li key={id} className="home-popup-list__item">
                  <div className="home-popup-list__main">
                    <span className="home-popup-list__label">{label}</span>
                    <span className="home-popup-list__meta">{date}</span>
                  </div>
                  <span className="home-popup-list__value home-popup-list__value--gain">
                    +{amount}
                  </span>
                </li>
              ))
            ) : (
              <li className="home-popup-list__item--empty">
                No earnings yet. Complete surveys to earn tokens!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Tokens;
