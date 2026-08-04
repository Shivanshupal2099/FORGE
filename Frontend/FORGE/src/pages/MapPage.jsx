import { useRef, useEffect, useState, useMemo } from 'react'
import { FaFilter, FaPlus, FaMinus } from 'react-icons/fa'
import * as mapboxgl from 'mapbox-gl/esm'
import 'mapbox-gl/dist/mapbox-gl.css'
import NavigationBar from '../Components/NavigationBar'
import Header from '../Components/Header'
import Filtersection from '../Components/Filtersection'
import Usercard from '../Components/Usercard'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import axios from '../api/axios'
// import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URI } from '../mapboxConfig'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_STYLE_URI=import.meta.env.VITE_MAPBOX_STYLE_URI;




function Map() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const [selectedUser, setSelectedUser] = useState(null)
  const markersRef = useRef([])
  const [allLocations, setAllLocations] = useState([])
  const [filteredLocations, setFilteredLocations] = useState([])
  const [filters, setFilters] = useState({
    lookingFor: ""
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Join location updates room when socket is connected
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('location:join');
      console.log('Joined location updates room');

      // Listen for location updates
      socket.on('location:updated', handleLocationUpdate);
      socket.on('location:added', handleLocationAdded);
      socket.on('location:removed', handleLocationRemoved);
      socket.on('user:online_status_changed', handleOnlineStatusChanged);

      return () => {
        socket.emit('location:leave');
        socket.off('location:updated', handleLocationUpdate);
        socket.off('location:added', handleLocationAdded);
        socket.off('location:removed', handleLocationRemoved);
        socket.off('user:online_status_changed', handleOnlineStatusChanged);
      };
    }
  }, [socket, isConnected]);

  const handleLocationUpdate = (updatedLocation) => {
    console.log('Location updated via WebSocket:', updatedLocation);
    setAllLocations(prev => {
      const index = prev.findIndex(loc => loc.uid === updatedLocation.uid);
      if (index !== -1) {
        const newLocations = [...prev];
        newLocations[index] = updatedLocation;
        // Re-apply current filters to update filtered locations
        const filtered = filterLocations(newLocations, filters);
        setFilteredLocations(filtered);
        return newLocations;
      }
      return prev;
    });
  };

  const handleLocationAdded = (newLocation) => {
    console.log('Location added via WebSocket:', newLocation);
    setAllLocations(prev => {
      const newLocations = [...prev, newLocation];
      // Re-apply current filters to update filtered locations
      const filtered = filterLocations(newLocations, filters);
      setFilteredLocations(filtered);
      return newLocations;
    });
  };

  const handleLocationRemoved = ({ locationId, uid }) => {
    console.log('Location removed via WebSocket:', locationId, uid);
    setAllLocations(prev => {
      const newLocations = prev.filter(loc => loc._id !== locationId && loc.uid !== uid);
      // Re-apply current filters to update filtered locations
      const filtered = filterLocations(newLocations, filters);
      setFilteredLocations(filtered);
      return newLocations;
    });
  };

  const handleOnlineStatusChanged = ({ uid, isOnline }) => {
    console.log('User online status changed:', uid, isOnline);
    setAllLocations(prev => {
      const index = prev.findIndex(loc => loc.uid === uid);
      if (index !== -1) {
        const newLocations = [...prev];
        newLocations[index].is_online = isOnline;
        // Re-apply current filters to update filtered locations
        const filtered = filterLocations(newLocations, filters);
        setFilteredLocations(filtered);
        return newLocations;
      }
      return prev;
    });
  };

  const handleMarkerClick = async (uid) => {
    try {
      console.log('Fetching user profile for:', uid)
      const response = await axios.get(`/api/profile/${uid}`)
      console.log('Profile data:', response.data)
      
      if (response.data.success && response.data.profile) {
        const profile = response.data.profile
        console.log('Profile data from backend:', profile);
        console.log('is_verified value:', profile.is_verified);
        console.log('is_verified type:', typeof profile.is_verified);
        
        // Format profile data to match Usercard structure
        const userData = {
          name: `${profile.first_name} ${profile.last_name}`,
          profession: profile.department || 'User',
          bio: profile.bio,
          photo: profile.avatar_url,
          isVerified: profile.is_verified === true,
          status: 'Active',
          visibility: 'Public',
          lookingFor: profile.looking_for || [],
          email: profile.uid || profile.email || uid, // Use profile.uid first, then email, then fallback to uid
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
        }
        console.log('userData isVerified:', userData.isVerified);
        console.log('Setting selected user with email:', userData.email);
        setSelectedUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleFilterChange = (newFilters) => {
    console.log('handleFilterChange called with:', newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = (filterValues = null) => {
    const filtersToApply = filterValues || filters;
    console.log('handleApplyFilters called with filters:', filtersToApply);
    const filtered = filterLocations(allLocations, filtersToApply);
    console.log('Setting filteredLocations to:', filtered.length, 'locations');
    setFilteredLocations(filtered);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      lookingFor: ""
    };
    setFilters(defaultFilters);
    setFilteredLocations(allLocations);
  };

  const filterLocations = (locations, filterCriteria) => {
    console.log('filterLocations called with:', { 
      totalLocations: locations.length, 
      filterCriteria 
    });
    
    let filtered = [...locations];
    
    // Filter by looking_for - exact match with any item in the array
    if (filterCriteria.lookingFor && filterCriteria.lookingFor.trim() !== '') {
      console.log('Filtering by looking_for:', filterCriteria.lookingFor);
      const searchTerm = filterCriteria.lookingFor.trim();
      filtered = filtered.filter(location => {
        const profile = location.profile || {};
        const lookingFor = profile.looking_for || [];
        console.log('Location looking_for array:', lookingFor);
        // Check if the selected option exists in the user's looking_for array (exact match)
        const match = lookingFor.some(item => 
          item.trim() === searchTerm
        );
        console.log('Match for', searchTerm, ':', match);
        return match;
      });
      console.log('After looking_for filter:', filtered.length);
    }
    
    console.log('Final filtered count:', filtered.length);
    return filtered;
  };

  // Removed auto-filtering - filters only applied when Apply button is clicked

  useEffect(() => {
    if (mapRef.current) {
      renderMarkers(filteredLocations);
    }
  }, [filteredLocations]);

  const renderMarkers = (locations) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    locations.forEach((location, index) => {
      const markerElement = document.createElement('div')
      markerElement.style.width = '30px'
      markerElement.style.height = '30px'
      
      // Generate unique color for each marker based on user ID
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7']
      const colorIndex = index % colors.length
      const markerColor = !location.is_online ? '#ef4444' : colors[colorIndex]
      
      markerElement.style.backgroundColor = markerColor
      markerElement.style.borderRadius = '50%'
      markerElement.style.border = '3px solid white'
      markerElement.style.cursor = 'pointer'
      markerElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)'
      markerElement.style.transition = 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease'
      
      markerElement.addEventListener('click', () => {
        handleMarkerClick(location.uid)
      })
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.longitude, location.latitude])
        .addTo(mapRef.current)
      
      // Store marker reference with its element
      marker.element = markerElement
      markersRef.current.push(marker)
    })
    
    // Update marker sizes based on current zoom
    updateMarkerSizes(mapRef.current.getZoom())
  };

  const updateMarkerSizes = (zoom) => {
    // Calculate marker size based on zoom level
    // Global view (zoom 0-3): small markers
    // Regional view (zoom 4-7): medium markers
    // Local view (zoom 8+): large markers
    let size
    if (zoom <= 3) {
      size = 20 // Small for global view
    } else if (zoom <= 7) {
      size = 30 // Medium for regional view
    } else {
      size = 40 // Large for local view
    }

    markersRef.current.forEach((marker) => {
      if (marker.element) {
        marker.element.style.width = `${size}px`
        marker.element.style.height = `${size}px`
      }
    })
  }

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: MAPBOX_TOKEN,
      container: mapContainerRef.current,
      style: MAPBOX_STYLE_URI,
      center: [0, 0],
      zoom: 3
    })

    mapRef.current.on('load', async () => {
      try {
        // Fetch and display all user locations from database
        console.log('Fetching user locations...')
        const response = await axios.get('/api/location/all')
        console.log('Location data:', response.data)
        
        if (response.data.success && response.data.locations.length > 0) {
          // Store all locations with profile data (now included from backend)
          setAllLocations(response.data.locations);
          
          // Initially show all markers (no filters applied)
          setFilteredLocations(response.data.locations);
          
          // Center map on first location
          mapRef.current.flyTo({
            center: [response.data.locations[0].longitude, response.data.locations[0].latitude],
            zoom: 10
          })
        }
      } catch (error) {
        console.error('Error:', error)
      }
    })

    // Update marker sizes on zoom change
    mapRef.current.on('zoom', () => {
      updateMarkerSizes(mapRef.current.getZoom())
    })

    return () => {
      mapRef.current.remove()
    }
  }, [])

  const buttonCommon = {
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  const filterBtnStyle = {
    position: 'absolute',
    bottom: isMobile ? 'auto' : '48px',
    top: isMobile ? '16px' : 'auto',
    right: isMobile ? '16px' : '196px',
    zIndex: 1100,
    width: isMobile ? '56px' : '86px',
    height: isMobile ? '56px' : '86px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...buttonCommon
  }

  const zoomInBtnStyle = {
    position: 'absolute',
    bottom: isMobile ? 'auto' : '48px',
    top: isMobile ? '16px' : 'auto',
    right: isMobile ? '80px' : '328px',
    zIndex: 1100,
    width: isMobile ? '56px' : '86px',
    height: isMobile ? '56px' : '86px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...buttonCommon
  }

  const zoomOutBtnStyle = {
    position: 'absolute',
    bottom: isMobile ? 'auto' : '48px',
    top: isMobile ? '16px' : 'auto',
    right: isMobile ? '144px' : '460px',
    zIndex: 1100,
    width: isMobile ? '56px' : '86px',
    height: isMobile ? '56px' : '86px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffeb3b 100%)',
    color: '#1a1a1a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...buttonCommon
  }

  const _eventsBtnStyle = {
    position: 'absolute',
    bottom: '48px',
    right: '64px',
    zIndex: 1100,
    width: '86px',
    height: '86px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #34d399, #10b981)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    fontSize: '14px',
    ...buttonCommon
  }

  const _markersRef = useRef([])

  const events = useMemo(() => {
    // Placeholder events dataset (no event backend exists in this repo yet)
    const now = Date.now()
    const daysFromNow = (d) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString()

    return [
      {
        id: 'e1',
        title: 'Beginner Tech Meetup',
        category: 'Tech',
        tags: ['Beginner', 'Networking', 'In-person'],
        isFree: true,
        startAt: daysFromNow(5),
        lng: 77.1025,
        lat: 28.7041
      },
      {
        id: 'e2',
        title: 'Community Volunteering Day',
        category: 'Community',
        tags: ['Volunteering', 'In-person'],
        isFree: false,
        startAt: daysFromNow(12),
        lng: 72.8777,
        lat: 19.076
      },
      {
        id: 'e3',
        title: 'Music & Social Night (Online)',
        category: 'Music',
        tags: ['Social', 'Online', 'Free'],
        isFree: true,
        startAt: daysFromNow(2),
        lng: 0,
        lat: 0
      },
      {
        id: 'e4',
        title: 'Sports Fitness Workshop',
        category: 'Sports',
        tags: ['Fitness', 'Advanced', 'In-person'],
        isFree: false,
        startAt: daysFromNow(25),
        lng: 78.4867,
        lat: 17.385
      }
    ]
  }, [])


  return (
    <div className="map-page" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', backgroundImage: 'var(--app-theme-gradient)' }}>
      <Header />
      
      <div id='map-container' ref={mapContainerRef} style={{ width: '100vw', height: '100vh', borderRadius: '0', overflow: 'hidden', boxShadow: 'none', position: 'absolute', inset: 0 }} />

      <button
        type='button'
        onClick={() => setIsFilterOpen(true)}
        aria-label='Open filters'
        style={{ ...filterBtnStyle, border: '1px solid rgba(255,255,255,0.35)' }}
      >
        <FaFilter size={28} />
      </button>

      <button
        type='button'
        onClick={() => mapRef.current.zoomIn()}
        aria-label='Zoom in'
        style={zoomInBtnStyle}
      >
        <FaPlus size={28} />
      </button>

      <button
        type='button'
        onClick={() => mapRef.current.zoomOut()}
        aria-label='Zoom out'
        style={zoomOutBtnStyle}
      >
        <FaMinus size={28} />
      </button>

      {isFilterOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 0,
            width: 'min(920px, 100vw)',
            zIndex: 1200,
            padding: '28px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              background: 'white',
              borderRadius: '26px',
              boxShadow: 'none',
              padding: '28px'
            }}
          >
            <button
              type='button'
              onClick={() => setIsFilterOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', color: '#4b5563' }}
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

      {selectedUser && (
        <Usercard 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          visibilitySettings={selectedUser.visibilitySettings}
          currentUserEmail={user?.email}
        />
      )}

      <div style={{ position: 'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)', width: 'calc(100% - 24px)', maxWidth: '920px', zIndex: 1000 }}>
        <NavigationBar isChatPage={false} />
      </div>
    </div>
  )
}

export default Map;
