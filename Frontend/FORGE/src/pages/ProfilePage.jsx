import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IoSettingsSharp, IoMailOutline, IoBriefcaseOutline, IoLinkOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import VerificationPopup from '../Components/VerificationPopup';
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
          <div className="profile-card__actions profile-card__actions--mobile">
            <Link 
              to="/profile/edit" 
              className="profile-card__edit-button"
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.85rem',
                border: 'none',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              <IoSettingsSharp /> Edit Profile
            </Link>
            <Link 
              to="/profile/events" 
              className="profile-card__edit-button"
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.85rem',
                border: 'none',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
              }}
            >
              My Events
            </Link>
            {!profile?.is_verified && (
              <button
                onClick={() => setShowVerificationPopup(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                }}
              >
                Get Verified
              </button>
            )}
            <Link 
              to="/settings" 
              className="profile-card__settings-button"
              aria-label="Settings"
             style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                padding: '0',
                marginLeft: '8px',
                textDecoration: 'none',
                color: 'inherit',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
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
        <VerificationPopup onClose={() => setShowVerificationPopup(false)} />
      )}

      <NavigationBar />
    </div>
  );
}
export default ProfilePage;