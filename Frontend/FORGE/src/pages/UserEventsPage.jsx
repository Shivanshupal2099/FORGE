import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IoArrowBack, IoCalendarOutline, IoPeopleOutline, IoLocationOutline, IoTimeOutline, IoAdd, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import Event from '../Components/Event';
import ViewEvent from '../Components/ViewEvent';
import axios from '../api/axios';


const MODAL_Z_INDEX = 2000;  


function UserEventsPage() {
  const { user } = useAuth();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showViewEvent, setShowViewEvent] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [notification, setNotification] = useState(null);




  useEffect(() => {
    const loadCreatedEvents = async () => {
      try {
        const uid = user?.email;
        if (!uid) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/events/user/${uid}`);
        
        if (response.data.success) {
          setCreatedEvents(Array.isArray(response.data.events) ? response.data.events : []);
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


  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await axios.delete(`/api/events/${eventId}`);

      if (response.data.success) {
        showNotification('Event deleted successfully!', 'success');
        // Refresh event list
        const uid = user?.email;
        if (uid) {
          const eventsResponse = await axios.get(`/api/events/user/${uid}`);
          if (eventsResponse.data.success) {
            setCreatedEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);
          }
        }
        return true;
      } else {
        showNotification(response.data.message || 'Failed to delete event', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('An error occurred while deleting the event', 'error');
      return false;
    }
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setShowCreateEvent(true);
    setShowViewEvent(false);
  };

  const EventCard = ({ event }) => (
    <div 
      className="profile-card__detail-item" 
      style={{ 
        padding: '0',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        marginBottom: '0',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(17, 17, 17, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.boxShadow = '0 16px 48px rgba(17, 17, 17, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 8px 32px rgba(17, 17, 17, 0.08)';
      }}>
      {/* Top Accent Bar */}
      <div style={{ 
        height: '4px',
        background: 'rgba(255, 215, 0, 0.5)',
        width: '100%',
      }} />
      
      {/* Card Content */}
      <div style={{ padding: 'clamp(24px, 5vw, 32px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
        {/* Event Type Icon */}
        <div style={{ 
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 215, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(17, 17, 17, 0.08)',
        }}>
          <IoCalendarOutline style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', color: '#111111' }} />
        </div>
        
        {/* Event Type Badge */}
        <div style={{ 
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(255, 215, 0, 0.15)',
          color: '#111111',
          fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '16px',
        }}>
          {event.category || 'Event'}
        </div>
        
        {/* Event Title */}
        <h4 style={{ 
          margin: '0', 
          fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', 
          fontWeight: '600', 
          color: '#111111', 
          letterSpacing: '-0.02em', 
          lineHeight: '1.3',
          marginBottom: '12px',
        }}>
          {event.title || 'Untitled Event'}
        </h4>
        
        {/* Status Badge */}
        <div style={{ 
          padding: '4px 12px',
          borderRadius: '999px',
          background: event.status === 'published' 
            ? 'rgba(255, 215, 0, 0.15)' 
            : 'rgba(255, 107, 0, 0.15)',
          color: '#111111',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {event.status || 'Draft'}
        </div>

        {/* Action Buttons - Only show for owner */}
        {event.isOwner && (
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '16px',
            width: '100%'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditEvent(event);
              }}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 14px',
                border: 'none',
                borderRadius: '999px',
                background: 'rgba(255, 215, 0, 0.15)',
                color: '#111111',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'rgba(255, 215, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(255, 215, 0, 0.15)';
              }}
            >
              <IoCreateOutline /> Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setShowViewEvent(true);
              }}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 14px',
                border: 'none',
                borderRadius: '999px',
                background: 'rgba(255, 107, 0, 0.15)',
                color: '#111111',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'rgba(255, 107, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(255, 107, 0, 0.15)';
              }}
            >
              <IoTrashOutline /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-shell" style={{ position: 'relative' }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '12px',
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          fontSize: '1rem',
          fontWeight: '700',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          zIndex: 5000,
          animation: 'slideIn 0.3s ease',
        }}>
          {notification.message}
        </div>
      )}
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
            onClick={() => setShowCreateEvent(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 32px',
              border: '2px solid transparent',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 48px rgba(102, 126, 234, 0.6)';
              e.target.style.background = 'linear-gradient(135deg, #7c8efc 0%, #8a5bd6 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
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
          ) : createdEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(32px, 5vw, 40px)' }}>
              <IoCalendarOutline style={{ fontSize: 'clamp(36px, 6vw, 48px)', color: '#cbd5e1', marginBottom: 'clamp(12px, 2vw, 16px)' }} />
              <p style={{ color: '#64748b', fontWeight: '700', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)' }}>
                No events created yet
              </p>
              <p style={{ color: '#94a3b8', fontWeight: '500', marginTop: 'clamp(6px, 1.5vw, 8px)' }}>
                Create your first event to get started!
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
                  EVENTS
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: 'clamp(16px, 3vw, 24px)'
              }}>
                {createdEvents.map((event, index) => (
                  <EventCard key={event._id || index} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      <NavigationBar />
      
      {showCreateEvent && (
        <Event 
          onClose={() => {
            setShowCreateEvent(false);
            setEventToEdit(null);
          }}
          eventToEdit={eventToEdit}
          onEventUpdated={() => {
            setShowCreateEvent(false);
            setEventToEdit(null);
            // Refresh event list
            const uid = user?.email;
            if (uid) {
              axios.get(`/api/events/user/${uid}`)
              .then(response => {
                if (response.data.success) {
                  setCreatedEvents(Array.isArray(response.data.events) ? response.data.events : []);
                }
              })
              .catch(error => {
                console.error('Error refreshing events:', error);
              });
            }
          }}
        />
      )}
      {showViewEvent && selectedEvent && (
        <ViewEvent 
          event={selectedEvent} 
          onClose={() => setShowViewEvent(false)} 
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onEventUpdated={async () => {
            // Refresh the event data from the server
            try {
              const response = await axios.get(`/api/events/${selectedEvent._id}`);
              if (response.data.success) {
                setSelectedEvent(response.data.event);
                // Also refresh the events list
                const eventsResponse = await axios.get(`/api/events/user/${user?.email}`);
                if (eventsResponse.data.success) {
                  setCreatedEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);
                }
              }
            } catch (error) {
              console.error('Error refreshing event:', error);
            }
          }}
        />
      )}
    </div>
  );
}

export default UserEventsPage;