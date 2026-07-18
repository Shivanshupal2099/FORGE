import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IoSettingsSharp, IoMailOutline, IoBriefcaseOutline, IoLinkOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';




function ProfilePage() {
  const { user, userId, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Use email as UID to match MongoDB storage
        const uid = user?.email;
        
        console.log('Fetching profile for UID:', uid);
        const response = await fetch(`http://localhost:5000/api/profile/${uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Profile response:', data);
        if (data.success) {
          setProfile(data.profile);
          console.log('Profile data set:', data.profile);
        } else {
          console.log('Profile fetch failed:', data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSurveys = async () => {
      try {
        const uid = user?.email;
        
        console.log('Fetching surveys for UID:', uid);
        const response = await fetch(`http://localhost:5000/api/survey/user/${uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Surveys response:', data);
        if (data.success) {
          setSurveys(data.surveys);
          console.log('Surveys data set:', data.surveys);
        } else {
          console.log('Surveys fetch failed:', data.message);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };

    if (user?.email) {
      fetchProfile();
      fetchSurveys();
    }
  }, [user?.email]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
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
              {profile?.is_verified && <span className="profile-card__verify-tag">Verified</span>}
            </div>
            <p className="profile-card__role">{profile?.department || 'User'}</p>
            <div className="profile-card__meta">
              <span className="profile-card__meta-item">
                <IoMailOutline />
                {user?.email || 'No email'}
              </span>
            </div>
          </div>
          <div className="profile-card__actions">
            <Link 
              to="/profile/edit" 
              className="profile-card__edit-button"
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              <IoSettingsSharp /> Edit Profile
            </Link>
            <Link 
              to="/profile/events" 
              className="profile-card__edit-button"
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              My Events
            </Link>
            {!profile?.is_verified && (
              <button
                onClick={() => setShowVerificationPopup(true)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                Get Verified
              </button>
            )}
            <button
              onClick={handleSignOut}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '8px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              Sign Out
            </button>
            <Link 
              to="/settings" 
              className="profile-card__settings-button"
              aria-label="Settings"
            >
              <IoSettingsSharp />
            </Link>
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
                    <strong>{survey.title}</strong>
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
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowVerificationPopup(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVerificationPopup(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '32px'
                }}
              >
                ✓
              </div>
              <h2 style={{ margin: '0 0 8px', color: '#1f172a', fontSize: '24px' }}>
                Get Verified
              </h2>
              <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                Payment integration coming soon! Stay tuned for verification options.
              </p>
            </div>
            
            <button
              onClick={() => setShowVerificationPopup(false)}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
}
export default ProfilePage;