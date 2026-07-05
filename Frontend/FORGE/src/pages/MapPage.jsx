import { useRef, useEffect, useState, useMemo } from 'react'
import { FaFilter, FaEyeSlash } from 'react-icons/fa'
import * as mapboxgl from 'mapbox-gl/esm'
import 'mapbox-gl/dist/mapbox-gl.css'
import NavigationBar from '../Components/NavigationBar'
import Filtersection from '../Components/Filtersection'
import EventFiltersection from '../Components/EventFiltersection'
import Hideinfo from '../Components/Hideinfo'
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URI } from '../mapboxConfig'





function Map() {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isHideInfoOpen, setIsHideInfoOpen] = useState(false)

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      style: MAPBOX_STYLE_URI,
      center: [0, 0],
      zoom: 3
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
    bottom: '48px',
    right: '196px',
    '@media (max-width: 600px)': {
      right: '120px',
      bottom: '18px',
      width: '72px',
      height: '72px'
    },

    zIndex: 1100,
    width: '86px',
    height: '86px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #fb923c, #f97316)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...buttonCommon
  }

  const hideInfoBtnStyle = {
    position: 'absolute',
    bottom: '48px',
    right: '328px',
    zIndex: 1100,
    width: '86px',
    height: '86px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
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

  const [activeFilterTab, setActiveFilterTab] = useState('people')

  const [eventFilters, setEventFilters] = useState({
    query: '',
    category: 'Any',
    tags: [],
    freeOnly: false,
    paidOnly: false,
    dateDays: 30
  })

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
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', backgroundColor: '#000000' }}>
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
        onClick={() => setIsHideInfoOpen(true)}
        aria-label='Open privacy settings'
        style={hideInfoBtnStyle}
      >
        <FaEyeSlash size={28} />
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

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, marginTop: 18 }}>
              <button
                type='button'
                onClick={() => setActiveFilterTab('people')}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '2px solid #e5e7eb',
                  background: activeFilterTab === 'people' ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' : '#fff',
                  color: activeFilterTab === 'people' ? '#fff' : '#0f172a',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                People
              </button>
              <button
                type='button'
                onClick={() => setActiveFilterTab('event')}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '2px solid #e5e7eb',
                  background: activeFilterTab === 'event' ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' : '#fff',
                  color: activeFilterTab === 'event' ? '#fff' : '#0f172a',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                Event
              </button>
            </div>

            {activeFilterTab === 'people' ? (
              <Filtersection />
            ) : (
              <EventFiltersection
                initialFilters={eventFilters}
                onApply={(next) => {
                  setEventFilters(next)
                }}
              />
            )}
          </div>
        </div>
      )}

      {isHideInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.35)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', maxHeight: '88vh', overflowY: 'auto', background: 'white', borderRadius: '26px', boxShadow: '0 26px 64px rgba(0, 0, 0, 0.22)', padding: '28px' }}>
            <button
              type='button'
              onClick={() => setIsHideInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', color: '#4b5563' }}
            >
              ×
            </button>
            <Hideinfo />
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)', width: 'calc(100% - 24px)', maxWidth: '920px', zIndex: 1000 }}>
        <NavigationBar />
      </div>
    </div>
  )
}

export default Map;