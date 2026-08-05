import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaUser, FaSpinner, FaLocationArrow, FaSearch, FaSlidersH } from 'react-icons/fa';
import Header from '../Components/Header';
import NavigationBar from '../Components/NavigationBar';
import Usercard from '../Components/Usercard';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';

function NearbyPage() {
  const { user, isVerified } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchRadius, setSearchRadius] = useState(500);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
        const response = await axios.get(`/api/profile/nearby/${user.email}`);
        
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

  const handleUpdateLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const uid = user?.email;
          const response = await axios.put(`/api/profile/${uid}/location`, {
            latitude,
            longitude
          });
          
          if (response.data.success) {
            // Refresh user data
            await fetchNearbyUsers();
          } else {
            setLocationError('Failed to update location');
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

  const handleFindPeople = async () => {
    // Check if user is verified
    if (!isVerified) {
      setShowVerificationPopup(true);
      return;
    }
    
    setHasSearched(true);
    await fetchNearbyUsers();
  };

  const handleUserClick = async (nearbyUser) => {
    try {
      const response = await axios.get(`/api/profile/${nearbyUser.uid}`);
      
      if (response.data.success && response.data.profile) {
        const profile = response.data.profile;
        
        const userData = {
          name: `${profile.first_name} ${profile.last_name}`,
          profession: profile.department || 'User',
          bio: profile.bio,
          photo: profile.avatar_url,
          isVerified: profile.is_verified === true,
          status: 'Active',
          visibility: 'Public',
          lookingFor: profile.looking_for || [],
          email: profile.uid || profile.email || nearbyUser.uid,
          socialLinks: {
            linkedin: profile.linkedin_url,
            github: profile.github_url,
            twitter: profile.portfolio_url
          },
          visibilitySettings: profile.visibility_settings || {
            show_name: true,
            show_profession: true,
            show_domain: true,
            show_location: true,
            show_social_links: true,
            show_looking_for: true,
            show_services: true
          }
        };
        
        setSelectedUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchNearbyUsers = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);
      const radiusInKm = searchRadius / 1000; // Convert meters to km for backend
      const response = await axios.get(`/api/profile/nearby/${user.email}?radius=${radiusInKm}`);
      
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
            {hasSearched && (
              <span style={{
                padding: '4px 12px',
                background: 'rgba(255, 107, 0, 0.1)',
                color: '#FF6B00',
                borderRadius: '20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                fontWeight: '600',
              }}>
                {nearbyUsers.length} found
              </span>
            )}
          </h1>
          <p style={{
            fontSize: isMobile ? '0.95rem' : '1rem',
            color: '#666666',
            margin: '0 0 20px 0',
          }}>
            Discover people near your location
          </p>
          
          <div style={{
            display: 'flex',
            gap: isMobile ? '10px' : '12px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={handleUpdateLocation}
              disabled={locationLoading}
              style={{
                padding: isMobile ? '12px' : '14px 20px',
                borderRadius: isMobile ? '50%' : '12px',
                background: locationLoading ? 'rgba(255, 107, 0, 0.5)' : '#FF6B00',
                color: '#111111',
                border: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                cursor: locationLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0' : '8px',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.2)',
                minWidth: isMobile ? '44px' : 'auto',
                width: isMobile ? '44px' : 'auto',
                height: isMobile ? '44px' : 'auto',
              }}
              onMouseEnter={(e) => {
                if (!locationLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = '#FF8533';
                }
              }}
              onMouseLeave={(e) => {
                if (!locationLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = '#FF6B00';
                }
              }}
            >
              <FaLocationArrow />
              {!isMobile && (locationLoading ? 'Updating...' : 'Update Location')}
            </button>
            
            <button
              onClick={() => setShowRadiusSlider(!showRadiusSlider)}
              style={{
                padding: isMobile ? '12px' : '14px 20px',
                borderRadius: isMobile ? '50%' : '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0' : '8px',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '44px' : 'auto',
                width: isMobile ? '44px' : 'auto',
                height: isMobile ? '44px' : 'auto',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              <FaSlidersH />
              {!isMobile && `Radius: ${searchRadius} m`}
            </button>
            
            <button
              onClick={handleFindPeople}
              disabled={loading}
              style={{
                padding: isMobile ? '12px' : '14px 20px',
                borderRadius: isMobile ? '50%' : '12px',
                background: loading ? 'rgba(34, 197, 94, 0.5)' : '#22C55E',
                color: '#111111',
                border: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0' : '8px',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                minWidth: isMobile ? '44px' : 'auto',
                width: isMobile ? '44px' : 'auto',
                height: isMobile ? '44px' : 'auto',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = '#22C55E';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = '#22C55E';
                }
              }}
            >
              <FaSearch />
              {!isMobile && (loading ? 'Searching...' : 'Find People')}
            </button>
          </div>
          
          {locationError && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              color: '#FF6B00',
              fontSize: '0.9rem',
            }}>
              {locationError}
            </div>
          )}
          
          {showRadiusSlider && (
            <div style={{
              marginTop: '16px',
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#3B82F6',
                }}>
                  Search Radius
                </span>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#3B82F6',
                }}>
                  {searchRadius} m
                </span>
              </div>
              
              <input
                type="range"
                min="10"
                max="500"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '0.85rem',
                color: '#666666',
              }}>
                <span>10 m</span>
                <span>500 m</span>
              </div>
            </div>
          )}
        </div>
        
        {showVerificationPopup && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }} onClick={() => setShowVerificationPopup(false)}>
            <div style={{
              background: 'var(--app-card-bg)',
              border: '1px solid var(--app-card-border)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B00, #FF8533)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FaMapMarkerAlt style={{ fontSize: '40px', color: 'white' }} />
              </div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 12px 0',
                color: '#111111',
              }}>
                Verification Required
              </h3>
              
              <p style={{
                fontSize: '1rem',
                color: '#666666',
                margin: '0 0 24px 0',
                lineHeight: '1.5',
              }}>
                You need to verify your account to search for nearby users. Get verified to unlock this feature.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}>
                <button
                  onClick={() => setShowVerificationPopup(false)}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: 'rgba(107, 114, 128, 0.1)',
                    color: '#6B7280',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    setShowVerificationPopup(false);
                    window.location.href = '/profile';
                  }}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: '#FF6B00',
                    color: '#111111',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(255, 107, 0, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.background = '#FF8533';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = '#FF6B00';
                  }}
                >
                  Go to Profile
                </button>
              </div>
            </div>
          </div>
        )}

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
        ) : !hasSearched ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#666666',
          }}>
            <FaSearch style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0' }}>Click "Find People" to discover nearby users</h3>
            <p>Update your location and set your search radius to get started</p>
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

              const visibilitySettings = nearbyUser.visibility_settings || {
                show_name: true,
                show_profession: true,
                show_domain: true,
                show_location: true,
                show_social_links: true,
                show_looking_for: true,
                show_services: true
              };

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
                  onClick={() => handleUserClick(nearbyUser)}
                >
                  <div style={{
                    width: isMobile ? '80px' : '100px',
                    height: isMobile ? '80px' : '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: '3px solid var(--app-card-border)',
                    position: 'relative',
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
                    {nearbyUser.is_verified && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#22C55E',
                        border: '3px solid var(--app-card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    color: '#111111',
                  }}>
                    {visibilitySettings.show_name ? `${nearbyUser.first_name} ${nearbyUser.last_name}` : 'Anonymous'}
                  </h3>
                  {visibilitySettings.show_profession && (
                    <p style={{
                      fontSize: isMobile ? '0.9rem' : '0.95rem',
                      color: '#666666',
                      margin: '0 0 8px 0',
                    }}>
                      {nearbyUser.department || 'User'}
                    </p>
                  )}
                  {visibilitySettings.show_looking_for && nearbyUser.looking_for && nearbyUser.looking_for.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}>
                      {nearbyUser.looking_for.slice(0, 2).map((item, index) => (
                        <span key={index} style={{
                          padding: '4px 10px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3B82F6',
                          borderRadius: '12px',
                          fontSize: isMobile ? '0.75rem' : '0.8rem',
                          fontWeight: '500',
                        }}>
                          {item}
                        </span>
                      ))}
                      {nearbyUser.looking_for.length > 2 && (
                        <span style={{
                          padding: '4px 10px',
                          background: 'rgba(107, 114, 128, 0.1)',
                          color: '#6B7280',
                          borderRadius: '12px',
                          fontSize: isMobile ? '0.75rem' : '0.8rem',
                          fontWeight: '500',
                        }}>
                          +{nearbyUser.looking_for.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  {distance && visibilitySettings.show_location && (
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
      
      {selectedUser && (
        <Usercard 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          visibilitySettings={selectedUser.visibilitySettings}
          currentUserEmail={user?.email}
        />
      )}
      
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
