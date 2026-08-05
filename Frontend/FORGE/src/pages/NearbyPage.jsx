import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaUser, FaSpinner } from 'react-icons/fa';
import Header from '../Components/Header';
import NavigationBar from '../Components/NavigationBar';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';

function NearbyPage() {
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/users/nearby/${user.email}`);
        
        if (response.data.success) {
          setNearbyUsers(response.data.users || []);
        } else {
          setError('Failed to load nearby users');
        }
      } catch (err) {
        console.error('Error fetching nearby users:', err);
        setError('Error loading nearby users');
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [user]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="page-shell">
      <Header />
      <div style={{
        padding: isMobile ? '16px' : '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          marginBottom: isMobile ? '20px' : '32px',
        }}>
          <h1 style={{
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            fontWeight: '700',
            color: '#111111',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <FaMapMarkerAlt style={{ color: '#FF6B00' }} />
            Nearby Users
          </h1>
          <p style={{
            fontSize: isMobile ? '0.95rem' : '1rem',
            color: '#666666',
            margin: '0',
          }}>
            Discover people near your location
          </p>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: '#666666',
          }}>
            <FaSpinner style={{ fontSize: '3rem', marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
            <p>Loading nearby users...</p>
          </div>
        ) : error ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#666666',
          }}>
            <p>{error}</p>
          </div>
        ) : nearbyUsers.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#666666',
          }}>
            <FaMapMarkerAlt style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0' }}>No nearby users found</h3>
            <p>Make sure your location is enabled in your profile settings</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '16px' : '24px',
          }}>
            {nearbyUsers.map((nearbyUser) => {
              const distance = nearbyUser.latitude && nearbyUser.longitude && user?.latitude && user?.longitude
                ? calculateDistance(user.latitude, user.longitude, nearbyUser.latitude, nearbyUser.longitude)
                : null;

              return (
                <div
                  key={nearbyUser._id}
                  style={{
                    background: 'var(--app-card-bg)',
                    border: '1px solid var(--app-card-border)',
                    borderRadius: isMobile ? '16px' : '20px',
                    padding: isMobile ? '20px' : '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onClick={() => window.location.href = `/profile/${nearbyUser.uid}`}
                >
                  <div style={{
                    width: isMobile ? '80px' : '100px',
                    height: isMobile ? '80px' : '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: '3px solid var(--app-card-border)',
                  }}>
                    <img
                      src={nearbyUser.avatar_url || (nearbyUser.gender === 'Male' ? maleImage : nearbyUser.gender === 'Female' ? femaleImage : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80")}
                      alt={nearbyUser.first_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <h3 style={{
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    color: '#111111',
                  }}>
                    {nearbyUser.first_name} {nearbyUser.last_name}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    color: '#666666',
                    margin: '0 0 12px 0',
                  }}>
                    {nearbyUser.department || 'User'}
                  </p>
                  {distance && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'rgba(255, 107, 0, 0.1)',
                      color: '#FF6B00',
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      fontWeight: '500',
                    }}>
                      <FaMapMarkerAlt style={{ fontSize: '0.8rem' }} />
                      {distance} km away
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <NavigationBar isChatPage={false} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NearbyPage;
