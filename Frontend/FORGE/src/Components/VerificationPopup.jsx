import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IoClose,
  IoShieldCheckmark,
  IoPeople,
  IoStar,
  IoChatbubbles,
  IoLockClosed,
  IoDiamond,
} from 'react-icons/io5';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';

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
  const [loading, setLoading] = useState(false);
  const { user, refreshUser, isVerified } = useAuth();
  const { success, error: showError } = useAlert();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

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

  const handlePayment = async () => {
    if (!privacyAccepted) {
      showError('Please accept the Privacy & Security Policy and Terms & Conditions to proceed.');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Starting payment process...');
      console.log('User:', user?.email);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      
      // Create order
      const orderResponse = await axios.post('/api/payment/create-order', {
        userId: user?.email || user?.id
      });

      console.log('Order response:', orderResponse.data);
      const { order, transaction_id } = orderResponse.data;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxxx",
        amount: order.amount,
        currency: order.currency,
        name: "ForgeConnect",
        description: "Premium Verification",
        order_id: order.id,
        handler: async function(response) {
          try {
            console.log('Payment response:', response);
            // Verify payment on backend
            const verifyResponse = await axios.post('/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.email || user?.id
            });

            console.log('Verification response:', verifyResponse.data);
            if (verifyResponse.data.message === "Payment verified successfully") {
              // Refresh user state in AuthContext
              await refreshUser();
              success("Payment successful! You are now verified.");
              onClose();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            showError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "",
          email: user?.email || "",
          contact: ""
        },
        theme: {
          color: "#667eea"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment initiation failed:", error);
      console.error("Error details:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        showError("Payment service not available. Please restart the backend server.");
      } else if (error.code === 'ERR_NETWORK') {
        showError("Network error. Please check your connection and ensure backend is running.");
      } else {
        showError(`Failed to initiate payment: ${error.message}`);
      }
      setLoading(false);
    }
  };

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

        <div style={{ 
          margin: '24px 0', 
          padding: '20px', 
          background: 'rgba(0, 0, 0, 0.02)', 
          borderRadius: '16px', 
          border: '1px solid rgba(0, 0, 0, 0.05)' 
        }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--app-text)',
              fontWeight: '500'
            }}
          >
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                accentColor: 'var(--app-accent-text)',
                cursor: 'pointer',
                marginTop: '2px',
                flexShrink: 0
              }}
            />
            <span>
              I have read and agree to the{' '}
              <Link
                to="/privacy"
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: 'var(--app-accent-text)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Privacy & Security Policy
              </Link>
              {' '}and{' '}
              <Link
                to="/privacy"
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: 'var(--app-accent-text)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Terms & Conditions
              </Link>
            </span>
          </label>
        </div>

        <div className="verification-popup__actions">
          <button
            type="button"
            className="verification-popup__button verification-popup__button--primary"
            onClick={handlePayment}
            disabled={loading || !privacyAccepted}
          >
            <span className="verification-popup__button-content">
              <IoDiamond aria-hidden="true" />
              {loading ? "Processing..." : "Verify Now for ₹299/year"}
            </span>
            <span className="verification-popup__button-arrow" aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="verification-popup__button verification-popup__button--secondary"
            onClick={onClose}
            disabled={loading}
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
