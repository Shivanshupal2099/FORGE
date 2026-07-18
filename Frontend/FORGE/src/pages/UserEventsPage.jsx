import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IoArrowBack, IoCalendarOutline, IoPeopleOutline, IoLocationOutline, IoTimeOutline, IoAdd, IoFilter } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import Event from '../Components/Event';
import ViewEvent from '../Components/ViewEvent';
import FilterPopup from '../Components/FilterPopup';




const MODAL_Z_INDEX = 2000;

function UserEventsPage() {
  const { user } = useAuth();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showViewEvent, setShowViewEvent] = useState(false);
  const [eventFilters, setEventFilters] = useState({
    category: 'Any',
    freeOnly: false,
    paidOnly: false,
  });

  useEffect(() => {
    const loadCreatedEvents = async () => {
      try {
        const uid = user?.email;
        if (!uid) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/events/user/${uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setCreatedEvents(Array.isArray(data.events) ? data.events : []);
        }
      } catch (error) {
        console.error('Error loading user events:', error);
        setCreatedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadCreatedEvents();
  }, [user?.email, showCreateEvent]); // Reload when showCreateEvent changes

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEvents = createdEvents.filter(event => {
    const categoryMatch = eventFilters.category === 'Any' || event.category === eventFilters.category;
    const freeMatch = !eventFilters.freeOnly || event.priceType === 'Free';
    const paidMatch = !eventFilters.paidOnly || event.priceType === 'Paid';
    return categoryMatch && freeMatch && paidMatch;
  });

  const EventCard = ({ event }) => (
    <div 
      className="profile-card__detail-item" 
      style={{ 
        padding: '0',
        border: '1px solid var(--app-card-border)',
        borderRadius: '20px',
        marginBottom: '0',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        minWidth: '200px',
      }}
      onClick={() => {
        setSelectedEvent(event);
        setShowViewEvent(true);
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-8px) scale(1.02)';
        e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0) scale(1)';
        e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
      }}>
      {/* Top Accent Bar */}
      <div style={{ 
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f59e0b 100%)',
        width: '100%',
      }} />
      
      {/* Card Content */}
      <div style={{ padding: 'clamp(24px, 5vw, 32px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
        {/* Event Type Icon */}
        <div style={{ 
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
        }}>
          <IoCalendarOutline style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', color: '#ffffff' }} />
        </div>
        
        {/* Event Type Badge */}
        <div style={{ 
          padding: '8px 20px',
          borderRadius: '25px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          marginBottom: '16px',
        }}>
          {event.category || 'Event'}
        </div>
        
        {/* Event Title */}
        <h4 style={{ 
          margin: '0', 
          fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', 
          fontWeight: '800', 
          color: 'var(--app-text)', 
          letterSpacing: '-0.02em', 
          lineHeight: '1.3',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {event.title || 'Untitled Event'}
        </h4>
        
        {/* Status Badge */}
        <div style={{ 
          padding: '6px 16px',
          borderRadius: '20px',
          background: event.status === 'published' 
            ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' 
            : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
          color: '#ffffff',
          fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          boxShadow: event.status === 'published' 
            ? '0 2px 8px rgba(52, 211, 153, 0.3)' 
            : '0 2px 8px rgba(100, 116, 139, 0.3)',
        }}>
          {event.status || 'Draft'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-shell" style={{ position: 'relative' }}>
      <Header />
      <style>
        {`
          @media (max-width: 1023px) {
            .action-buttons-container {
              position: fixed !important;
              bottom: 80px !important;
              left: 50% !important;
              right: auto !important;
              transform: translateX(-50%) !important;
              flex-direction: row !important;
              width: auto !important;
              gap: 8px !important;
              z-index: 1000 !important;
            }
            .action-buttons-container button {
              padding: 10px 16px !important;
              font-size: 0.85rem !important;
            }
          }
          @media (min-width: 1024px) {
            .action-buttons-container {
              position: absolute;
              top: 0;
              right: 0;
              flex-direction: row;
              gap: 16px;
              z-index: 10;
            }
            .action-buttons-container button {
              min-width: 160px;
            }
            .events-section-wrapper {
              position: relative;
            }
            .profile-card {
              margin-top: 80px;
            }
          }
        `}
      </style>
      <div className="events-section-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px, 3vw, 24px)', position: 'relative' }}>
        <div className="action-buttons-container" style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 28px',
              border: showFilter ? 'none' : '2px solid var(--app-card-border)',
              borderRadius: '16px',
              background: showFilter ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              color: showFilter ? '#ffffff' : 'var(--app-text)',
              fontSize: '1.05rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: showFilter ? '0 12px 32px rgba(16, 185, 129, 0.6)' : '0 8px 24px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              if (!showFilter) {
                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                e.target.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.18)';
                e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilter) {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)';
              }
            }}
          >
            <IoFilter style={{ fontSize: '1.2rem' }} /> Filter
          </button>
          <button
            onClick={() => setShowCreateEvent(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 28px',
              border: '2px solid transparent',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 48px rgba(102, 126, 234, 0.7)';
              e.target.style.background = 'linear-gradient(135deg, #7c8efc 0%, #8a5bd6 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6)';
              e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
          >
            <IoAdd style={{ fontSize: '1.2rem' }} /> Create Event
          </button>
        </div>
        
        <div className="profile-card" style={{ marginTop: '0' }}>
          <div className="profile-card__header" style={{ paddingBottom: 'clamp(12px, 2vw, 16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
              <Link 
                to="/profile" 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(36px, 4vw, 40px)',
                  height: 'clamp(36px, 4vw, 40px)',
                  border: '1px solid var(--app-card-border)',
                  borderRadius: '50%',
                  background: 'var(--app-surface-strong)',
                  color: 'var(--app-text)',
                  cursor: 'pointer',
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  fontWeight: 'bold',
                  marginRight: 'clamp(8px, 2vw, 12px)',
                  textDecoration: 'none',
                  boxShadow: 'var(--app-soft-shadow)',
                }}
              >
                <IoArrowBack />
              </Link>
              <h1 style={{ 
                margin: '0', 
                color: 'var(--app-text)', 
                fontSize: 'clamp(1.5rem, 4vw, 2rem)'
              }}>
                My Events
              </h1>
            </div>

          </div>

        <div className="profile-card__section">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '700', padding: 'clamp(32px, 5vw, 40px)' }}>
              Loading events...
            </p>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(32px, 5vw, 40px)' }}>
              <IoCalendarOutline style={{ fontSize: 'clamp(36px, 6vw, 48px)', color: '#cbd5e1', marginBottom: 'clamp(12px, 2vw, 16px)' }} />
              <p style={{ color: '#64748b', fontWeight: '700', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)' }}>
                {createdEvents.length === 0 ? 'No events created yet' : 'No events match your filters'}
              </p>
              <p style={{ color: '#94a3b8', fontWeight: '500', marginTop: 'clamp(6px, 1.5vw, 8px)' }}>
                {createdEvents.length === 0 ? 'Create your first event to get started!' : 'Try adjusting your filters'}
              </p>




            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                <Link 
                  to="/profile"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'clamp(36px, 4vw, 40px)',
                    height: 'clamp(36px, 4vw, 40px)',
                    border: '1px solid var(--app-card-border)',
                    borderRadius: '50%',
                    background: 'var(--app-surface-strong)',
                    color: 'var(--app-text)',
                    cursor: 'pointer',
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxShadow: 'var(--app-soft-shadow)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateX(-4px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateX(0)';
                    e.target.style.boxShadow = 'var(--app-soft-shadow)';
                  }}
                >
                  <IoArrowBack />
                </Link>
                <h3 style={{ margin: '0', color: 'var(--app-text)', fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', fontWeight: '700' }}>
                  EVENTS {filteredEvents.length !== createdEvents.length && `(${filteredEvents.length} of ${createdEvents.length})`}
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: 'clamp(16px, 3vw, 24px)'
              }}>
                {filteredEvents.map((event, index) => (
                  <EventCard key={event._id || index} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {showFilter && (
        <FilterPopup
          initialFilters={eventFilters}
          onApply={(next) => {
            setEventFilters(next);
            setShowFilter(false);
          }}
          onClose={() => setShowFilter(false)}
        />
      )}
      
      <NavigationBar />
      
      {showCreateEvent && <Event onClose={() => setShowCreateEvent(false)} />}
      {showViewEvent && selectedEvent && <ViewEvent event={selectedEvent} onClose={() => setShowViewEvent(false)} />}
    </div>
  );
}

export default UserEventsPage;


