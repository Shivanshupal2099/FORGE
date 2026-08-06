import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    color: '#FF6B00'
  },
  {
    icon: IoStar,
    label: 'Premium access',
    desc: 'Create new surveys, access community offers',
    color: '#FF8533'
  },
  {
    icon: IoShieldCheckmark,
    label: 'Build trust',
    desc: 'Show others you are a genuine ForgeConnect member',
    color: '#FF9520'
  },
  {
    icon: IoChatbubbles,
    label: 'Messaging',
    desc: 'Send connection requests and start conversations',
    color: '#FFA726'
  },
];

function VerificationPopup({ onClose }) {
  const [platform, setPlatform] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const { user, refreshUser, isVerified } = useAuth();
  const { success, error: showError } = useAlert();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const navigate = useNavigate();
  const paymentInProgress = useRef(false);

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

    // Prevent duplicate payment requests
    if (paymentInProgress.current) {
      console.log('Payment already in progress, ignoring duplicate request');
      return;
    }

    paymentInProgress.current = true;
    setLoading(true);

    try {
      console.log('=== PAYMENT PROCESS STARTED ===');
      console.log('User:', user?.email);
      console.log('User ID:', user?.id);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Cashfree App ID:', import.meta.env.VITE_CASHFREE_APP_ID);
      
      // Create order
      console.log('Creating order...');
      const orderResponse = await axios.post('/api/payment/create-order', {
        userId: user?.email || user?.id
      });

      console.log('Order response received:', orderResponse.status);
      console.log('Order response data:', orderResponse.data);
      
      const { order, transaction_id } = orderResponse.data;

      if (!order || !order.order_id) {
        console.error('Invalid order response:', orderResponse.data);
        throw new Error('Invalid order response from backend');
      }

      console.log('Order ID:', order.order_id);
      console.log('Order Amount:', order.order_amount);
      
      // Check if backend returned payment_session_id
      const paymentSessionId = order.payment_session_id;
      console.log('Payment Session ID:', paymentSessionId);
      
      if (!paymentSessionId) {
        console.error('No payment_session_id in order response');
        throw new Error('Payment session ID not returned by backend');
      }
      
      // Load Cashfree SDK if not already loaded
      await loadCashfreeSDK();
      
      // Initialize checkout with payment_session_id
      initializeCheckout(order.order_id, paymentSessionId);

    } catch (error) {
      console.error("Payment initiation failed:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      if (error.response?.data?.code === "DUPLICATE_TRANSACTION") {
        showError("A transaction already exists for this order. Please try again or contact support.");
      } else if (error.response?.data?.code === "PHONE_REQUIRED") {
        setShowPhoneError(true);
      } else if (error.response?.status === 404) {
        showError("Payment service not available. Please restart the backend server.");
      } else if (error.response?.status === 503) {
        showError("Payment service not configured. Please contact support.");
      } else if (error.code === 'ERR_NETWORK') {
        showError("Network error. Please check your connection and ensure backend is running.");
      } else if (error.response?.data?.error) {
        showError(`Payment error: ${error.response.data.error}`);
      } else if (error.response?.data?.message) {
        showError(`Payment error: ${error.response.data.message}`);
      } else if (error.message?.includes('Cashfree')) {
        showError(`Cashfree error: ${error.message}`);
      } else {
        showError(`Failed to initiate payment: ${error.message}`);
      }
      
      setLoading(false);
      paymentInProgress.current = false;
    }
  };

  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      // Check if Cashfree SDK is already loaded
      if (window.Cashfree) {
        console.log('Cashfree SDK already loaded');
        resolve();
        return;
      }

      console.log('Loading Cashfree SDK from CDN...');
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => {
        console.log('Cashfree SDK loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load Cashfree SDK:', error);
        reject(new Error('Failed to load payment gateway'));
      };
      document.head.appendChild(script);
    });
  };

  const initializeCheckout = (orderId, paymentSessionId) => {
    try {
      console.log('=== INITIALIZING CHECKOUT ===');
      console.log('Order ID:', orderId);
      console.log('Payment Session ID:', paymentSessionId);
      
      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded');
      }

      // Initialize Cashfree instance - use Cashfree() without 'new' keyword
      const cashfree = Cashfree({
        mode: 'sandbox'
      });

      console.log('Cashfree instance created');

      // Initialize checkout with payment_session_id
      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        returnUrl: `${window.location.origin}/profile?payment=success&order_id=${orderId}`,
        redirectTarget: '_self'
      };

      console.log('Checkout options:', checkoutOptions);

      // Call checkout - this will redirect user to Cashfree hosted page
      // The promise only returns { redirect: true } or { error: {...} }
      cashfree.checkout(checkoutOptions).then(function(result) {
        console.log('Checkout result:', result);
        
        if (result.error) {
          console.error('Checkout error:', result.error.message);
          showError(result.error.message || 'Payment checkout failed. Please try again.');
          setLoading(false);
          paymentInProgress.current = false;
        }
        
        if (result.redirect) {
          console.log('User will be redirected to Cashfree hosted page');
          // Payment success/failure will be handled via returnUrl redirect
        }
      }).catch(function(error) {
        console.error('Checkout error:', error);
        showError('Payment checkout failed. Please try again.');
        setLoading(false);
        paymentInProgress.current = false;
      });

      console.log('Checkout initialized successfully');

    } catch (error) {
      console.error("Cashfree initialization error:", error);
      showError("Failed to initialize payment gateway. Please try again.");
      setLoading(false);
      paymentInProgress.current = false;
    }
  };

  const handlePaymentSuccess = async (result) => {
    try {
      console.log('=== PAYMENT SUCCESS ===');
      console.log('Payment result:', result);
      
      // Verify payment on backend
      const verifyResponse = await axios.post('/api/payment/verify-payment', {
        order_id: result.order?.orderId || result.orderId,
        payment_id: result.payment?.paymentId || result.paymentId,
        signature: result.signature,
        userId: user?.email || user?.id
      });

      console.log('Verification response:', verifyResponse.data);
      
      if (verifyResponse.data.message === "Payment verified successfully") {
        // Refresh user state in AuthContext
        await refreshUser();
        
        // Show success alert
        success("🎉 Payment successful! You are now verified.");
        
        // Close the verification popup after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showError("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      showError("Payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
      paymentInProgress.current = false;
    }
  };

  const handlePaymentFailure = (result) => {
    console.error('=== PAYMENT FAILED ===');
    console.error('Failure result:', result);
    showError(`Payment failed: ${result.error?.message || 'Unknown error'}`);
    setLoading(false);
    paymentInProgress.current = false;
  };

  const handlePaymentCancellation = () => {
    console.log('=== PAYMENT CANCELLED ===');
    showError('Payment was cancelled by user');
    setLoading(false);
    paymentInProgress.current = false;
  };

  const handleUpdateProfile = () => {
    // Navigate to Edit Profile page
    navigate('/profile/edit');
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

        {/* Phone Number Error Popup */}
        {showPhoneError ? (
          <div className="verification-popup__phone-error">
            <div className="verification-popup__phone-error-icon">
              <IoLockClosed />
            </div>
            <h3>Contact Number Required</h3>
            <p>Please add your contact number in Edit Profile before proceeding with verification payment.</p>
            <div className="verification-popup__phone-error-actions">
              <button
                className="button-primary"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                Update Profile
              </button>
              <button
                className="button-secondary"
                onClick={() => {
                  setShowPhoneError(false);
                  setLoading(false);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default VerificationPopup;
