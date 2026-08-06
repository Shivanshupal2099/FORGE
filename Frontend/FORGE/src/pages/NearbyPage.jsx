import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaUser, FaSpinner, FaLocationArrow, FaSearch, FaSlidersH, FaFilter, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import NavigationBar from '../Components/NavigationBar';
import Usercard from '../Components/Usercard';
import Filtersection from '../Components/Filtersection';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';

function NearbyPage() {
  const { user, isVerified } = useAuth();
  const navigate = useNavigate();
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    lookingFor: ""
  });

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

  const filterNearbyUsers = (users, filterCriteria) => {
    let filtered = [...users];
    
    // Filter by looking_for - exact match with any item in the array
    if (filterCriteria.lookingFor && filterCriteria.lookingFor.trim() !== '') {
      const searchTerm = filterCriteria.lookingFor.trim();
      filtered = filtered.filter(user => {
        const lookingFor = user.looking_for || [];
        // Check if the selected option exists in the user's looking_for array (exact match)
        const match = lookingFor.some(item => 
          item.trim() === searchTerm
        );
        return match;
      });
    }
    
    return filtered;
  };

  const getFilteredUsers = () => {
    if (!filters.lookingFor) {
      return nearbyUsers;
    }
    return filterNearbyUsers(nearbyUsers, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = (filterValues = null) => {
    const filtersToApply = filterValues || filters;
    setFilters(filtersToApply);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      lookingFor: ""
    };
    setFilters(defaultFilters);
  };

  return (
    <div className="page-shell">
      <Header hideLogo={isMobile} />
      <div style={{
        padding: isMobile ? '16px' : '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
      }}>
        {isMobile && (
          <button
            onClick={() => navigate(-1)}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: '#111111',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateX(-4px)';
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateX(0)';
              e.target.style.background = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <FaArrowLeft />
            Back
          </button>
        )}
        <div style={{
          marginBottom: isMobile ? '20px' : '32px',
          textAlign: isMobile ? 'center' : 'left',
          width: '100%',
        }}>
          <h1 style={{
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            fontWeight: '700',
            color: '#111111',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}>
            <FaMapMarkerAlt style={{ color: '#FF6B00' }} />
            Find Nearby
            {hasSearched && (
              <span style={{
                padding: '4px 12px',
                background: 'rgba(255, 107, 0, 0.1)',
                color: '#FF6B00',
                borderRadius: '20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                fontWeight: '600',
              }}>
                {getFilteredUsers().length} found
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
              onClick={() => setIsFilterOpen(true)}
              style={{
                padding: isMobile ? '12px' : '14px 20px',
                borderRadius: isMobile ? '50%' : '12px',
                background: filters.lookingFor ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)',
                color: '#9333EA',
                border: filters.lookingFor ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(147, 51, 234, 0.3)',
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
                e.target.style.background = 'rgba(147, 51, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = filters.lookingFor ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.1)';
              }}
            >
              <FaFilter />
              {!isMobile && (filters.lookingFor ? `Filter: ${filters.lookingFor}` : 'Filter')}
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
              padding: '24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <FaSlidersH style={{ color: '#3B82F6', fontSize: '1.1rem' }} />
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#1E3A8A',
                    letterSpacing: '-0.3px',
                  }}>
                    Search Radius
                  </span>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  minWidth: '100px',
                  textAlign: 'center',
                }}>
                  {searchRadius} m
                </div>
              </div>
              
              <div style={{
                position: 'relative',
                marginBottom: '24px',
              }}>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '12px',
                    borderRadius: '6px',
                    background: 'linear-gradient(90deg, #3B82F6 0%, #3B82F6 ' + ((searchRadius - 10) / (500 - 10) * 100) + '%, #E5E7EB ' + ((searchRadius - 10) / (500 - 10) * 100) + '%, #E5E7EB 100%)',
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 3px solid white;
                    transition: all 0.2s ease;
                  }
                  input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 3px solid white;
                    transition: all 0.2s ease;
                  }
                  input[type="range"]::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
                  }
                `}</style>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                marginTop: '8px',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6B7280',
                  }}>
                    10 m
                  </span>
                  <div style={{
                    width: '2px',
                    height: '8px',
                    background: '#CBD5E1',
                    borderRadius: '1px',
                  }} />
                </div>
                
                <div style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  position: 'relative',
                }}>
                  {[25, 50, 100, 200, 300, 400].map((value) => (
                    <div key={value} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      position: 'absolute',
                      left: `${((value - 10) / (500 - 10)) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#9CA3AF',
                      }}>
                        {value}
                      </span>
                      <div style={{
                        width: '2px',
                        height: '6px',
                        background: '#E5E7EB',
                        borderRadius: '1px',
                      }} />
                    </div>
                  ))}
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6B7280',
                  }}>
                    500 m
                  </span>
                  <div style={{
                    width: '2px',
                    height: '8px',
                    background: '#CBD5E1',
                    borderRadius: '1px',
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isFilterOpen && (
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
          }} onClick={() => setIsFilterOpen(false)}>
            <div style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }} onClick={(e) => e.stopPropagation()}>
              <button
                type='button'
                onClick={() => setIsFilterOpen(false)}
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer', 
                  fontSize: '24px', 
                  color: '#4b5563',
                  zIndex: 10,
                }}
              >
                ×
              </button>
              <Filtersection 
                onFilterChange={handleFilterChange}
                initialFilters={filters}
                onReset={handleResetFilters}
                onApply={handleApplyFilters}
              />
            </div>
          </div>
        )}
        
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
            {getFilteredUsers().map((nearbyUser) => {
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
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: isMobile ? '20px' : '24px',
                    padding: isMobile ? '24px' : '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 16px 48px rgba(17, 17, 17, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-8px) scale(1.02)';
                    e.target.style.boxShadow = '0 24px 64px rgba(255, 107, 0, 0.15)';
                    e.target.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 16px 48px rgba(17, 17, 17, 0.08)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                  }}
                  onClick={() => handleUserClick(nearbyUser)}
                >
                  {/* Decorative gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '100px',
                    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 159, 64, 0.05) 100%)',
                    borderRadius: isMobile ? '20px' : '24px',
                    borderBottomLeftRadius: '0',
                    borderBottomRightRadius: '0',
                    zIndex: '0',
                  }} />
                  
                  <div style={{
                    width: isMobile ? '90px' : '110px',
                    height: isMobile ? '90px' : '110px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: '4px solid white',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    zIndex: '1',
                    background: 'white',
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
                        bottom: '2px',
                        right: '2px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                        border: '3px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)',
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <h3 style={{
                    fontSize: isMobile ? '1.15rem' : '1.3rem',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    color: '#1E293B',
                    letterSpacing: '-0.3px',
                    position: 'relative',
                    zIndex: '1',
                  }}>
                    {visibilitySettings.show_name ? `${nearbyUser.first_name} ${nearbyUser.last_name}` : 'Anonymous'}
                  </h3>
                  
                  {visibilitySettings.show_profession && (
                    <p style={{
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      color: '#64748B',
                      margin: '0 0 12px 0',
                      fontWeight: '500',
                      position: 'relative',
                      zIndex: '1',
                    }}>
                      {nearbyUser.department || 'User'}
                    </p>
                  )}
                  
                  {visibilitySettings.show_looking_for && nearbyUser.looking_for && nearbyUser.looking_for.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      position: 'relative',
                      zIndex: '1',
                    }}>
                      {nearbyUser.looking_for.slice(0, 2).map((item, index) => (
                        <span key={index} style={{
                          padding: '6px 14px',
                          background: 'rgba(255, 107, 0, 0.1)',
                          color: '#FF6B00',
                          borderRadius: '20px',
                          fontSize: isMobile ? '0.75rem' : '0.8rem',
                          fontWeight: '600',
                          border: '1px solid rgba(255, 107, 0, 0.2)',
                          boxShadow: '0 2px 4px rgba(255, 107, 0, 0.1)',
                        }}>
                          {item}
                        </span>
                      ))}
                      {nearbyUser.looking_for.length > 2 && (
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(148, 163, 184, 0.1)',
                          color: '#64748B',
                          borderRadius: '20px',
                          fontSize: isMobile ? '0.75rem' : '0.8rem',
                          fontWeight: '600',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
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
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 159, 64, 0.1) 100%)',
                      color: '#FF6B00',
                      borderRadius: '24px',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      fontWeight: '700',
                      border: '1px solid rgba(255, 107, 0, 0.2)',
                      boxShadow: '0 2px 8px rgba(255, 107, 0, 0.15)',
                      position: 'relative',
                      zIndex: '1',
                    }}>
                      <FaMapMarkerAlt style={{ fontSize: '0.9rem' }} />
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
