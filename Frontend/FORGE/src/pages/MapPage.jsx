import { useRef, useEffect, useState, useMemo } from 'react'
import { FaFilter, FaPlus, FaMinus } from 'react-icons/fa'
import * as mapboxgl from 'mapbox-gl/esm'
import 'mapbox-gl/dist/mapbox-gl.css'
import NavigationBar from '../Components/NavigationBar'
import Header from '../Components/Header'
import Filtersection from '../Components/Filtersection'
import Usercard from '../Components/Usercard'
import { useAuth } from '../contexts/AuthContext'
// import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URI } from '../mapboxConfig'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_STYLE_URI=import.meta.env.VITE_MAPBOX_STYLE_URI;




function Map() {
  const { user } = useAuth();
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const [selectedUser, setSelectedUser] = useState(null)
  const markersRef = useRef([])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMarkerClick = async (uid) => {
    try {
      console.log('Fetching user profile for:', uid)
      const response = await fetch(`http://localhost:5000/api/profile/${uid}`)
      const data = await response.json()
      console.log('Profile data:', data)
      
      if (data.success && data.profile) {
        const profile = data.profile
        // Format profile data to match Usercard structure
        const userData = {
          name: `${profile.first_name} ${profile.last_name}`,
          profession: profile.department || 'User',
          bio: profile.bio,
          photo: profile.avatar_url,
          isVerified: profile.is_verified || false,
          status: 'Active',
          visibility: 'Public',
          lookingFor: profile.looking_for || [],
          email: uid,
          socialLinks: {
            linkedin: profile.linkedin_url,
            github: profile.github_url,
            twitter: profile.portfolio_url
          },
          visibilitySettings: profile.visibility_settings || {
            show_name: true,
            show_bio: true,
            show_profession: true,
            show_domain: true,
            show_location: true,
            show_social_links: true,
            show_looking_for: true,
            show_services: true
          }
        }
        setSelectedUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

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
        const response = await fetch('http://localhost:5000/api/location/all')
        const data = await response.json()
        console.log('Location data:', data)
        
        if (data.success && data.locations.length > 0) {
          // Clear existing markers
          markersRef.current.forEach(marker => marker.remove())
          markersRef.current = []

          data.locations.forEach((location) => {
            console.log('Adding marker for:', location.uid, 'at:', location.longitude, location.latitude)
            const markerElement = document.createElement('div')
            markerElement.style.width = '30px'
            markerElement.style.height = '30px'
            markerElement.style.backgroundColor = '#22c55e'
            markerElement.style.borderRadius = '50%'
            markerElement.style.border = '3px solid white'
            markerElement.style.cursor = 'pointer'
            markerElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)'
            markerElement.style.transition = 'width 0.3s ease, height 0.3s ease'
            
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
          
          // Center map on first location
          mapRef.current.flyTo({
            center: [data.locations[0].longitude, data.locations[0].latitude],
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
    border: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow: '0 10px 26px rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  }

  const filterBtnStyle = {
    position: 'absolute',
    bottom: isMobile ? 'auto' : '48px',
    top: isMobile ? '16px' : 'auto',
    right: isMobile ? '16px' : '196px',
    zIndex: 1100,
    width: isMobile ? '56px' : '86px',
    height: isMobile ? '56px' : '86px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #fb923c, #f97316)',
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
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #34d399, #10b981)',
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
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #f472b6, #ec4899)',
    color: 'white',
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
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', backgroundImage: 'var(--app-theme-gradient)' }}>
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
            background: 'rgba(15, 23, 42, 0.35)',
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

            <Filtersection />
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
        <NavigationBar />
      </div>
    </div>
  )
}

export default Map;
