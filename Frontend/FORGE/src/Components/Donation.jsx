import { useEffect, useState } from 'react';
import { FaHandHoldingHeart, FaTimes } from 'react-icons/fa';

function Donation({ onClose }) {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePresetClick = (presetAmount) => {
    setAmount(presetAmount);
    setSelectedPreset(presetAmount);
  };

  const handleDonate = (e) => {
    e.preventDefault();
    if (amount) {
      alert(`Thank you for your donation of $${amount}!`);
      setAmount('');
      setPurpose('');
      setSelectedPreset('');
    }
  };

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--donation"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close donation popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaHandHoldingHeart aria-hidden="true" />
          </span>
          <div>
            <h2 id="donation-popup-title" className="home-popup__title">
              Make a Donation
            </h2>
            <p className="home-popup__subtitle">
              Support causes you care about with a monetary donation.
            </p>
          </div>
        </div>

        <form onSubmit={handleDonate} className="donation-form">
          <div className="donation-presets">
            <button
              type="button"
              className={`donation-preset ${selectedPreset === '500' ? 'active' : ''}`}
              onClick={() => handlePresetClick('500')}
            >
              ₹500
            </button>
            <button
              type="button"
              className={`donation-preset ${selectedPreset === '1000' ? 'active' : ''}`}
              onClick={() => handlePresetClick('1000')}
            >
              ₹1,000
            </button>
            <button
              type="button"
              className={`donation-preset ${selectedPreset === '2500' ? 'active' : ''}`}
              onClick={() => handlePresetClick('2500')}
            >
              ₹2,500
            </button>
            <button
              type="button"
              className={`donation-preset ${selectedPreset === '5000' ? 'active' : ''}`}
              onClick={() => handlePresetClick('5000')}
            >
              ₹5,000
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Custom Amount (₹)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSelectedPreset('');
              }}
              placeholder="Enter amount"
              min="1"
              step="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Message to support the startups (Optional)</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Share your message of support for the startups..."
              rows="3"
            />
          </div>

          <button type="submit" className="button-primary donation-submit">
            Donate ₹{amount || '0'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Donation;
