import { useEffect, useState } from 'react';
import { FaCoins, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

function Tokens({ onClose }) {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchTokens = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/tokens/user/${user.email}`);
        
        if (response.data.success) {
          setTokenData(response.data.tokens);
        } else {
          setError('Failed to load tokens');
        }
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Error loading tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [user]);

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const earnedTokens = tokenData?.token_history || [];

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
          <span className="home-popup-highlight__value">
            {loading ? '...' : error ? '0' : tokenData?.total_tokens || 0}
          </span>
        </div>

        <div className="home-popup-section">
          <h3 className="home-popup-section__title">Recent earnings</h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading tokens...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#ef6f96' }}>{error}</p>
          ) : earnedTokens.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>No tokens earned yet. Complete surveys to earn tokens!</p>
          ) : (
            <ul className="home-popup-list">
              {earnedTokens.slice().reverse().map((entry) => (
                <li key={entry._id || entry.earned_at} className="home-popup-list__item">
                  <div className="home-popup-list__main">
                    <span className="home-popup-list__label">{entry.description}</span>
                    <span className="home-popup-list__meta">{formatDate(entry.earned_at)}</span>
                  </div>
                  <span className="home-popup-list__value home-popup-list__value--gain">
                    +{entry.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tokens;
