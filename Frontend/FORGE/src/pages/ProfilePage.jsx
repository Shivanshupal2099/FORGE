import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IoSettingsSharp, IoMailOutline, IoBriefcaseOutline, IoLinkOutline, IoLocationOutline } from 'react-icons/io5';
import { FaRegEdit } from 'react-icons/fa';
import { MdEvent, MdOutlineVerified } from 'react-icons/md';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import VerificationPopup from '../Components/VerificationPopup';
import axios from '../api/axios';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';




function ProfilePage() {
  const { user, loading: authLoading, signOut, isVerified } = useAuth();
  const { email: profileEmail } = useParams();
  const [profile, setProfile] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

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

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    setCurrentLocation(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        try {
          const uid = user?.email;
          const response = await axios.put(`/api/profile/${uid}/location`, {
            latitude,
            longitude
          });
          
          if (response.data.success) {
            setProfile(prev => ({
              ...prev,
              latitude,
              longitude
            }));
            setShowLocationPopup(false);
          } else {
            setLocationError('Failed to update location in database');
          }
        } catch (error) {
          console.error('Error updating location:', error);
          setLocationError('Failed to update location. Please try again.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enable location services.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="page-shell">
      <Header />
      <div className="profile-card">
        <div className="profile-card__cover"></div>
        
        <div className="profile-card__header">
          <div className="profile-photo">
            <img
              src={profile?.avatar_url || (profile?.gender === 'Male' ? maleImage : profile?.gender === 'Female' ? femaleImage : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80")}
              alt="Profile"
            />
          </div>
          <div className="profile-card__info">
            <div className="profile-card__title-row">
              <h1>{profile ? `${profile.first_name} ${profile.last_name}` : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User')}</h1>
              {(isVerified || profile?.is_verified) ? (
                <span className="profile-card__verify-tag profile-card__verify-tag--verified">Verified</span>
              ) : (
                <span className="profile-card__verify-tag profile-card__verify-tag--unverified">Non Verified</span>
              )}
            </div>
            <p className="profile-card__role">{profile?.department || 'User'}</p>
            <div className="profile-card__meta">
              <span className="profile-card__meta-item">
                <IoMailOutline />
                {profile?.email || (isOwnProfile ? user?.email : profileEmail) || 'No email'}
              </span>
            </div>
          </div>
          <div className="profile-card__actions profile-card__actions--mobile">
            {isOwnProfile && (
              <Link 
                to="/profile/edit" 
                className="profile-card__edit-button"
                style={{
                  padding: '14px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#666666',
                  fontWeight: '500',
                  fontSize: '1.2rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(17, 17, 17, 0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: '48px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.boxShadow = '0 6px 16px rgba(17, 17, 17, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 4px 12px rgba(17, 17, 17, 0.05)';
                }}
              >
                <FaRegEdit />
              </Link>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setShowLocationPopup(true)}
                style={{
                  padding: '14px',
                  borderRadius: '999px',
                  background: 'rgba(255, 215, 0, 0.25)',
                  color: '#111111',
                  fontWeight: '500',
                  fontSize: '1.2rem',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: '48px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'rgba(255, 215, 0, 0.35)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 215, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 215, 0, 0.25)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.15)';
                }}
              >
                <IoLocationOutline />
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => {
                  if (isVerified || profile?.is_verified) {
                    setShowVerifiedMessage(true);
                  } else {
                    setShowVerificationPopup(true);
                  }
                }}
                style={{
                  padding: '14px',
                  borderRadius: '999px',
                  background: (isVerified || profile?.is_verified) 
                    ? 'rgba(59, 130, 246, 0.25)' 
                    : 'rgba(255, 215, 0, 0.25)',
                  color: (isVerified || profile?.is_verified) 
                    ? '#1e40af' 
                    : '#111111',
                  fontWeight: '500',
                  fontSize: '1.2rem',
                  border: (isVerified || profile?.is_verified) 
                    ? '1px solid rgba(59, 130, 246, 0.4)' 
                    : '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: (isVerified || profile?.is_verified) 
                    ? '0 4px 12px rgba(59, 130, 246, 0.2)' 
                    : '0 4px 12px rgba(255, 215, 0, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: '48px',
                }}
                onMouseEnter={(e) => {
                  const isUserVerified = isVerified || profile?.is_verified;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = isUserVerified 
                    ? 'rgba(59, 130, 246, 0.35)' 
                    : 'rgba(255, 215, 0, 0.35)';
                  e.target.style.boxShadow = isUserVerified 
                    ? '0 6px 16px rgba(59, 130, 246, 0.3)' 
                    : '0 6px 16px rgba(255, 215, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  const isUserVerified = isVerified || profile?.is_verified;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = isUserVerified 
                    ? 'rgba(59, 130, 246, 0.25)' 
                    : 'rgba(255, 215, 0, 0.25)';
                  e.target.style.boxShadow = isUserVerified 
                    ? '0 4px 12px rgba(59, 130, 246, 0.2)' 
                    : '0 4px 12px rgba(255, 215, 0, 0.15)';
                }}
              >
                <MdOutlineVerified />
              </button>
            )}
            {isOwnProfile && (
              <Link 
                to="/settings" 
                className="profile-card__settings-button"
                aria-label="Settings"
               style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '44px' : '40px',
                height: isMobile ? '44px' : '40px',
                padding: '0',
                marginLeft: '8px',
                textDecoration: 'none',
                color: '#111111',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(17, 17, 17, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.target.style.boxShadow = '0 6px 16px rgba(17, 17, 17, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = '0 4px 12px rgba(17, 17, 17, 0.05)';
              }}
            >
              <IoSettingsSharp />
            </Link>
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

      {showLocationPopup && (
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
          zIndex: 2000,
          padding: '20px',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 16px 48px rgba(17, 17, 17, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              background: 'rgba(255, 215, 0, 0.25)',
              marginBottom: '20px',
              margin: '0 auto 20px',
            }}>
              <IoLocationOutline style={{ fontSize: '32px', color: '#111111' }} />
            </div>
            
            <h2 style={{
              margin: '0 0 12px',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#111111',
              textAlign: 'center',
            }}>
              Update Your Location
            </h2>
            
            <p style={{
              margin: '0 0 24px',
              fontSize: '1rem',
              color: '#666666',
              fontWeight: '400',
              textAlign: 'center',
              lineHeight: '1.6',
            }}>
              We'll use your device's location services to get your current coordinates and update them in your profile.
            </p>

            {locationError && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 107, 0, 0.15)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                marginBottom: '20px',
                color: '#FF6B00',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'center',
              }}>
                {locationError}
              </div>
            )}

            {currentLocation && (
              <div style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '400', marginBottom: '4px' }}>
                  Location Found:
                </div>
                <div style={{ fontSize: '1rem', color: '#111111', fontWeight: '600' }}>
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => {
                  setShowLocationPopup(false);
                  setLocationError(null);
                  setCurrentLocation(null);
                }}
                disabled={locationLoading}
                style={{
                  padding: '14px 28px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#666666',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: locationLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(17, 17, 17, 0.05)',
                }}
                onMouseEnter={(e) => {
                  if (!locationLoading) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                style={{
                  padding: '14px 28px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#FF6B00',
                  color: '#111111',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: locationLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(255, 107, 0, 0.25)',
                  opacity: locationLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!locationLoading) {
                    e.target.style.background = '#FF8533';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 0, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FF6B00';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.25)';
                }}
              >
                {locationLoading ? 'Getting Location...' : 'Get Location'}
              </button>
            </div>
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

      <NavigationBar isChatPage={false} />
    </div>
  );
}
export default ProfilePage;