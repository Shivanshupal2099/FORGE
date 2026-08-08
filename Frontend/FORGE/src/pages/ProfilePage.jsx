import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IoSettingsSharp, IoMailOutline, IoBriefcaseOutline, IoLinkOutline, IoLocationOutline } from 'react-icons/io5';
import { FaRegEdit, FaCoins } from 'react-icons/fa';
import { MdEvent, MdOutlineVerified } from 'react-icons/md';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import VerificationPopup from '../Components/VerificationPopup';
import Tokens from '../Components/Tokens';
import axios from '../api/axios';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';




function ProfilePage() {
  const { user, loading: authLoading, signOut, isVerified, refreshUser } = useAuth();
  const { email: profileEmail } = useParams();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
  const [showTokensPopup, setShowTokensPopup] = useState(false);
  const [showVerifyIntro, setShowVerifyIntro] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !profileEmail || profileEmail === user?.email;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      const savedTheme = localStorage.getItem('forge-theme');
      setIsDarkMode(savedTheme === 'dark');
    };
    checkDarkMode();
    window.addEventListener('storage', checkDarkMode);
    return () => window.removeEventListener('storage', checkDarkMode);
  }, []);

  // Check if user has seen verify intro message
  useEffect(() => {
    const hasSeenVerifyIntro = localStorage.getItem('hasSeenVerifyIntro');
    if (!hasSeenVerifyIntro && !isVerified && !profile?.is_verified && isOwnProfile) {
      setShowVerifyIntro(true);
    }
  }, [isVerified, profile?.is_verified, isOwnProfile]);

  // Handle payment success/fail from URL parameters
  useEffect(() => {
    const handlePaymentResult = async () => {
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('order_id');

      console.log('=== CHECKING PAYMENT RESULT ===');
      console.log('Payment status from URL:', paymentStatus);
      console.log('Order ID from URL:', orderId);
      console.log('User email:', user?.email);
      console.log('Auth loading:', authLoading);

      if (paymentStatus === 'success' && orderId) {
        console.log('Payment success detected, verifying...');
        try {
          // Verify payment with backend
          console.log('Calling verify-payment endpoint...');
          const verifyResponse = await axios.post('/api/payment/verify-payment', {
            order_id: orderId,
            payment_id: null,
            signature: null,
            userId: user?.email || user?.id
          });

          console.log('Payment verification response:', verifyResponse.data);

          if (verifyResponse.data.message === "Payment verified successfully") {
            console.log('Payment verified successfully, refreshing user data...');
            
            // Refresh user data to get updated verification status
            await refreshUser();
            
            console.log('User data refreshed, isVerified should now be true');
            
            // Show success message
            setShowVerifiedMessage(true);
            
            // Clear URL parameters
            window.history.replaceState({}, '', '/profile');
            console.log('URL parameters cleared');
          } else {
            console.error('Payment verification returned unexpected message:', verifyResponse.data.message);
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          console.error('Error details:', error.response?.data || error.message);
          
          // Show error to user
          if (error.response?.data?.message === "Payment not completed yet") {
            console.log('Payment still processing, will retry automatically');
            // Retry after 2 seconds
            setTimeout(() => {
              console.log('Retrying payment verification...');
              handlePaymentResult();
            }, 2000);
          }
        }
      } else if (paymentStatus === 'failed') {
        console.log('Payment failed detected');
        // Show error message for failed payment
        alert('Payment failed. Please try again.');
        // Clear URL parameters
        window.history.replaceState({}, '', '/profile');
      }
    };

    if (user?.email && !authLoading) {
      handlePaymentResult();
    }
  }, [searchParams, user?.email, authLoading, refreshUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Use profileEmail from URL if viewing someone else's profile, otherwise use current user's email
        const uid = profileEmail || user?.email;
        
        console.log('Fetching profile for UID:', uid);
        const response = await axios.get(`/api/profile/${uid}`);
        console.log('Profile response:', response.data);
        if (response.data.success) {
          setProfile(response.data.profile);
          console.log('Profile data set:', response.data.profile);
        } else {
          console.log('Profile fetch failed:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSurveys = async () => {
      try {
        const uid = profileEmail || user?.email;
        
        console.log('Fetching surveys for UID:', uid);
        const response = await axios.get(`/api/survey/user/${uid}`);
        console.log('Surveys response:', response.data);
        if (response.data.success) {
          setSurveys(response.data.surveys);
          console.log('Surveys data set:', response.data.surveys);
        } else {
          console.log('Surveys fetch failed:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };

    if ((profileEmail || user?.email) && !authLoading) {
      fetchProfile();
      fetchSurveys();
    }
  }, [profileEmail, user?.email, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="page-shell minimal-ivory-grid" data-dark={isDarkMode}>
      <Header hideLogo={isMobile} />
      {isOwnProfile && (
        <Link 
          to="/settings" 
          aria-label="Settings"
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '44px' : '48px',
            height: isMobile ? '44px' : '48px',
            padding: '0',
            textDecoration: 'none',
            color: isDarkMode ? '#ffffff' : 'var(--app-text)',
            background: isDarkMode ? '#1a1a2e' : 'var(--app-card-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '999px',
            border: isDarkMode ? '1px solid #3a3a5c' : '1px solid var(--app-card-border)',
            boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = isDarkMode ? '#252542' : 'var(--app-surface-strong)';
            e.target.style.borderColor = '#FF6B00';
            e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = isDarkMode ? '#1a1a2e' : 'var(--app-card-bg)';
            e.target.style.borderColor = isDarkMode ? '1px solid #3a3a5c' : 'var(--app-card-border)';
            e.target.style.boxShadow = isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)';
          }}
        >
          <IoSettingsSharp style={{ fontSize: isMobile ? '1.2rem' : '1.3rem' }} />
        </Link>
      )}
      <div className="profile-card" data-dark={isDarkMode}>
        <div className="profile-card__cover"></div>
        
        <div className="profile-card__header" style={isMobile ? { flexDirection: 'column', alignItems: 'center', textAlign: 'center' } : {}}>
          <div className="profile-photo">
            <img
              src={profile?.avatar_url || (profile?.gender === 'Male' ? maleImage : profile?.gender === 'Female' ? femaleImage : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80")}
              alt="Profile"
            />
          </div>
          <div className="profile-card__info" style={isMobile ? { textAlign: 'center', paddingTop: '20px' } : {}}>
            <div className="profile-card__title-row" style={isMobile ? { justifyContent: 'center' } : {}}>
              <h1 data-dark={isDarkMode}>{profile ? `${profile.first_name} ${profile.last_name}` : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User')}</h1>
              {(isVerified || profile?.is_verified) && (
                <span className="profile-card__verify-tag profile-card__verify-tag--verified">Verified</span>
              )}
            </div>
            <p className="profile-card__role" data-dark={isDarkMode}>{profile?.department || 'User'}</p>
            <div className="profile-card__meta" style={isMobile ? { alignItems: 'center' } : {}}>
              <span className="profile-card__meta-item" data-dark={isDarkMode}>
                <IoMailOutline />
                {profile?.email || (isOwnProfile ? user?.email : profileEmail) || 'No email'}
              </span>
            </div>
          </div>
          <div className="profile-card__actions profile-card__actions--mobile" style={isMobile ? { justifyContent: 'center', paddingTop: '20px' } : {}}>
            {isOwnProfile && (
              <Link 
                to="/profile/edit" 
                className="profile-card__edit-button"
                style={{
                  padding: isMobile ? '12px' : '14px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#3b82f6',
                  fontWeight: '600',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  border: '1.5px solid rgba(59, 130, 246, 0.25)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: isMobile ? '44px' : '48px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 100%)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.25)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                }}
              >
                <FaRegEdit />
              </Link>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setShowTokensPopup(true)}
                style={{
                  padding: isMobile ? '12px' : '14px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 200, 0, 0.1) 100%)',
                  color: '#D4A017',
                  fontWeight: '600',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  border: '1.5px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: isMobile ? '44px' : '48px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 200, 0, 0.15) 100%)';
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 200, 0, 0.1) 100%)';
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                }}
              >
                <FaCoins />
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => {
                  if (isVerified || profile?.is_verified) {
                    setShowVerifiedMessage(true);
                  } else {
                    setShowComingSoonPopup(true);
                  }
                }}
                style={{
                  padding: '14px 20px',
                  borderRadius: '999px',
                  background: (isVerified || profile?.is_verified) 
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  border: 'none',
                  boxShadow: (isVerified || profile?.is_verified) 
                    ? '0 4px 16px rgba(16, 185, 129, 0.3)' 
                    : '0 4px 16px rgba(255, 107, 0, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  const isUserVerified = isVerified || profile?.is_verified;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = isUserVerified 
                    ? '0 8px 24px rgba(16, 185, 129, 0.4)' 
                    : '0 8px 24px rgba(255, 107, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  const isUserVerified = isVerified || profile?.is_verified;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = isUserVerified 
                    ? '0 4px 16px rgba(16, 185, 129, 0.3)' 
                    : '0 4px 16px rgba(255, 107, 0, 0.3)';
                }}
              >
                <MdOutlineVerified />
                <span>{(isVerified || profile?.is_verified) ? 'Verified' : 'Non Verified'}</span>
              </button>
            )}
          </div>
        </div>

        {profile?.bio && (
          <div className="profile-card__bio">
            <h3>About</h3>
            <p>{profile.bio}</p>
          </div>
        )}

        {(profile?.department || profile?.contact_number || profile?.portfolio_url) && (
          <div className="profile-card__section">
            <h3>Professional Details</h3>
            <div className="profile-card__details">
              {profile?.department && (
                <div className="profile-card__detail-item">
                  <div className="profile-card__detail-icon">
                    <IoBriefcaseOutline />
                  </div>
                  <div className="profile-card__detail-content">
                    <span className="profile-card__label">Profession</span>
                    <strong>{profile.department}</strong>
                  </div>
                </div>
              )}
              {profile?.contact_number && (
                <div className="profile-card__detail-item">
                  <div className="profile-card__detail-icon">
                    <IoMailOutline />
                  </div>
                  <div className="profile-card__detail-content">
                    <span className="profile-card__label">Contact</span>
                    <strong>{profile.contact_number}</strong>
                  </div>
                </div>
              )}
              {profile?.portfolio_url && (
                <div className="profile-card__detail-item">
                  <div className="profile-card__detail-icon">
                    <IoLinkOutline />
                  </div>
                  <div className="profile-card__detail-content">
                    <span className="profile-card__label">Portfolio</span>
                    <strong><a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{profile.portfolio_url}</a></strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {profile?.looking_for && profile.looking_for.length > 0 && (
          <div className="profile-card__section">
            <h3>Looking For</h3>
            <div className="profile-card__tags">
              {profile.looking_for.map((item, index) => (
                <span key={index} className="profile-card__tag">{item}</span>
              ))}
            </div>
          </div>
        )}

        {surveys && surveys.length > 0 && (
          <div className="profile-card__section">
            <h3>Created Surveys</h3>
            <div className="profile-card__details">
              {surveys.map((survey) => (
                <div key={survey._id} className="profile-card__detail-item">
                  <div className="profile-card__detail-content">
                    <span className="profile-card__label">Survey</span>
                    <strong>Survey #{survey._id?.slice(-6)}</strong>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Status: {survey.status} | Responses: {survey.current_responses}/{survey.target_responses}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(profile?.github_url || profile?.linkedin_url) && (
          <div className="profile-card__section">
            <h3>Social Links</h3>
            <div className="profile-card__details">
              {profile?.github_url && (
                <div className="profile-card__detail-item">
                  <div className="profile-card__detail-icon">
                    <IoLinkOutline />
                  </div>
                  <div className="profile-card__detail-content">
                    <span className="profile-card__label">GitHub</span>
                    <strong><a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{profile.github_url}</a></strong>
                  </div>
                </div>
              )}
              {profile?.linkedin_url && (
                <div className="profile-card__detail-item">
                  <div className="profile-card__detail-icon">
                    <IoLinkOutline />
                  </div>
                  <div className="profile-card__detail-content">
                    <span className="profile-card__label">LinkedIn</span>
                    <strong><a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{profile.linkedin_url}</a></strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showVerificationPopup && (
        <VerificationPopup onClose={() => setShowVerificationPopup(false)} />
      )}

      {/* Verify Intro Popup */}
      {showVerifyIntro && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => {
            setShowVerifyIntro(false);
            localStorage.setItem('hasSeenVerifyIntro', 'true');
          }}
        >
          <div
            style={{
              background: 'var(--app-card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--app-card-border)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
              }}
            >
              <MdOutlineVerified style={{ fontSize: '48px', color: 'white' }} />
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--app-text)',
                margin: '0 0 12px',
              }}
            >
              Verify Your Account
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--app-muted-text)',
                margin: '0 0 32px',
                lineHeight: '1.5',
              }}
            >
              Get verified to unlock premium features including unlimited connections, messaging, and exclusive offers. Stand out from the crowd with a verified badge!
            </p>
            <button
              onClick={() => {
                setShowVerifyIntro(false);
                localStorage.setItem('hasSeenVerifyIntro', 'true');
              }}
              style={{
                padding: '16px 32px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.3)';
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showComingSoonPopup && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(17, 17, 17, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowComingSoonPopup(false)}>
          <div style={{
            background: 'var(--app-card-bg)',
            border: '1px solid var(--app-card-border)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: '800' }}>Coming Soon</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '1rem', lineHeight: '1.6', opacity: 0.85 }}>
              User verification is a premium feature that will be available in the next version.
            </p>
            <p style={{ margin: '0 0 24px 0', fontSize: '1rem', lineHeight: '1.6', opacity: 0.85 }}>
              Stay tuned! Premium users will be able to verify their accounts this Sunday.
            </p>
            <button
              onClick={() => setShowComingSoonPopup(false)}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                background: 'var(--app-accent-bg)',
                color: 'var(--app-accent-text)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Verified Status Message Popup */}
      {showVerifiedMessage && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            padding: '20px',
          }}
          onClick={() => setShowVerifiedMessage(false)}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              }}
            >
              <MdOutlineVerified style={{ fontSize: '48px', color: 'white' }} />
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111111',
                margin: '0 0 12px',
              }}
            >
              Successfully Verified!
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                margin: '0 0 32px',
                lineHeight: '1.5',
              }}
            >
              Your account is verified. You now have access to all premium features including unlimited connections, messaging, and exclusive offers.
            </p>
            <button
              onClick={() => setShowVerifiedMessage(false)}
              style={{
                padding: '16px 32px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
              }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {showTokensPopup && <Tokens onClose={() => setShowTokensPopup(false)} />}

      <NavigationBar isChatPage={false} />
    </div>
  );
}
export default ProfilePage;