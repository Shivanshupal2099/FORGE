import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { IoArrowBack, IoCalendarOutline, IoPeopleOutline, IoLocationOutline, IoTimeOutline, IoAdd, IoCreateOutline, IoTrashOutline, IoChevronBack, IoChevronForward, IoEyeOutline } from 'react-icons/io5';
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
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef(null);




  // Carousel navigation functions
  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= createdEvents.length) return;
    setCurrentIndex(index);
  }, [createdEvents.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch/drag handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (translateX > threshold) {
      prevSlide();
    } else if (translateX < -threshold) {
      nextSlide();
    }
    setTranslateX(0);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (translateX > threshold) {
      prevSlide();
    } else if (translateX < -threshold) {
      nextSlide();
    }
    setTranslateX(0);
  };

  useEffect(() => {
    const loadCreatedEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        
        if (response.data.success) {
          setCreatedEvents(Array.isArray(response.data.events) ? response.data.events : []);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setCreatedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadCreatedEvents();
  }, [showCreateEvent]); // Reload when showCreateEvent changes

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
        const eventsResponse = await axios.get('/api/events');
        if (eventsResponse.data.success) {
          setCreatedEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);
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

  const EventCard = ({ event, isActive, index }) => {
    const isMobile = window.innerWidth <= 768;
    
    return (
    <div 
      className="profile-card__detail-item" 
      style={{ 
        padding: isMobile ? '16px' : '0',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: isMobile ? '24px' : '32px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: isActive 
          ? '0 40px 100px rgba(17, 17, 17, 0.25)' 
          : '0 16px 48px rgba(17, 17, 17, 0.12)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        minWidth: isMobile ? '100%' : '440px',
        maxWidth: isMobile ? '100%' : '500px',
        minHeight: isMobile ? 'auto' : '650px',
        maxHeight: isMobile ? 'auto' : '720px',
        transform: isActive ? 'scale(1)' : isMobile ? 'scale(1)' : 'scale(0.88)',
        opacity: isActive ? 1 : isMobile ? 1 : 0.4,
        flex: isActive ? '0 0 auto' : '0 0 auto',
      }}
      onClick={(e) => {
        console.log('Event card clicked:', event.title);
        setSelectedEvent(event);
        setShowViewEvent(true);
      }}
    >
      {/* Top Accent Bar */}
      <div style={{ 
        height: isMobile ? '6px' : '8px',
        background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 107, 0, 0.6) 100%)',
        width: '100%',
      }} />
      
      {/* Card Content */}
      <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
        {/* Event Type Icon */}
        <div style={{ 
          width: isMobile ? '70px' : 'clamp(80px, 15vw, 140px)',
          height: isMobile ? '70px' : 'clamp(80px, 15vw, 140px)',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 107, 0, 0.3) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '14px' : '18px',
          boxShadow: isActive ? '0 20px 50px rgba(255, 215, 0, 0.3)' : '0 16px 40px rgba(17, 17, 17, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isActive ? 'scale(1)' : 'scale(0.97)',
        }}>
          <IoCalendarOutline style={{ fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 5vw, 4rem)', color: '#111111' }} />
        </div>
        
        {/* Event Type Badge */}
        <div style={{ 
          padding: isMobile ? '6px 14px' : 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 28px)',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 107, 0, 0.25) 100%)',
          color: '#111111',
          fontSize: isMobile ? '0.75rem' : 'clamp(0.8rem, 2vw, 1.1rem)',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: isMobile ? '0.1em' : '0.14em',
          marginBottom: isMobile ? '14px' : '18px',
          boxShadow: '0 8px 20px rgba(255, 215, 0, 0.25)',
        }}>
          {event.category || 'Event'}
        </div>
        
        {/* Event Title */}
        <h4 style={{ 
          margin: '0', 
          fontSize: isMobile ? '1.1rem' : 'clamp(1.2rem, 3vw, 2rem)', 
          fontWeight: '800', 
          color: '#111111', 
          letterSpacing: isMobile ? '-0.02em' : '-0.04em', 
          lineHeight: isMobile ? '1.2' : '1.15',
          marginBottom: isMobile ? '14px' : '18px',
          textShadow: '0 2px 12px rgba(255, 255, 255, 0.95)',
        }}>
          {event.title || 'Untitled Event'}
        </h4>
        
        {/* Event Details - Date, Time, Location */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '8px' : '12px',
          marginBottom: isMobile ? '14px' : '18px',
          width: '100%',
        }}>
          {event.date && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '6px' : '8px',
              color: '#64748b',
              fontSize: isMobile ? '0.8rem' : 'clamp(0.85rem, 2vw, 0.95rem)',
              fontWeight: '500',
            }}>
              <IoCalendarOutline style={{ fontSize: isMobile ? '0.9rem' : 'clamp(1rem, 2.2vw, 1.1rem)' }} />
              <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
          {event.time && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '6px' : '8px',
              color: '#64748b',
              fontSize: isMobile ? '0.8rem' : 'clamp(0.85rem, 2vw, 0.95rem)',
              fontWeight: '500',
            }}>
              <IoTimeOutline style={{ fontSize: isMobile ? '0.9rem' : 'clamp(1rem, 2.2vw, 1.1rem)' }} />
              <span>{event.time}</span>
            </div>
          )}
          {event.location && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '6px' : '8px',
              color: '#64748b',
              fontSize: isMobile ? '0.8rem' : 'clamp(0.85rem, 2vw, 0.95rem)',
              fontWeight: '500',
            }}>
              <IoLocationOutline style={{ fontSize: isMobile ? '0.9rem' : 'clamp(1rem, 2.2vw, 1.1rem)' }} />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div style={{
          padding: isMobile ? '5px 12px' : 'clamp(6px, 1.5vw, 10px) clamp(14px, 2.5vw, 24px)',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          color: '#111111',
          fontSize: isMobile ? '0.7rem' : 'clamp(0.75rem, 1.8vw, 0.85rem)',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
          marginBottom: '20px',
        }}>
          {event.status || 'Draft'}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="page-shell minimal-ivory-grid" style={{ position: 'relative' }}>
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
      <Header hideLogo={true} />
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --forge-orange: #FF6B00;
            --forge-orange-light: #FF8533;
            --forge-orange-shadow: rgba(255, 107, 0, 0.3);
          }
          
          @media (max-width: 1023px) {
            .action-buttons-container {
              position: fixed !important;
              bottom: 90px !important;
              right: 20px !important;
              left: auto !important;
              transform: none !important;
              flex-direction: column !important;
              width: auto !important;
              gap: 0 !important;
              z-index: 1000 !important;
            }
            .action-buttons-container button {
              min-width: 56px !important;
              width: 56px !important;
              height: 56px !important;
              padding: 0 !important;
              border-radius: 50% !important;
              font-size: 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              box-shadow: 0 8px 24px var(--forge-orange-shadow) !important;
              background: linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%) !important;
            }
            .action-buttons-container button span {
              display: none !important;
            }
            .action-buttons-container button svg {
              font-size: 1.5rem !important;
              margin: 0 !important;
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
              min-width: 180px;
            }
            .events-section-wrapper {
              position: relative;
            }
            .profile-card {
              margin-top: 80px;
            }
          }

          /* Carousel Responsive Styles */
          @media (max-width: 767px) {
            .carousel-container {
              min-height: auto !important;
              padding: 24px 16px 20px !important;
              width: 100% !important;
              overflow-x: hidden !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
            }
            .carousel-track {
              gap: 0 !important;
              width: 100% !important;
            }
            .carousel-nav-button.desktop-only {
              display: none !important;
            }
            
            /* Mobile Navigation Buttons - 12-16px outside card, 44x44 */
            .carousel-nav-button.mobile-only {
              display: flex !important;
              position: absolute !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              width: 44px !important;
              height: 44px !important;
              border-radius: 50% !important;
              border: none !important;
              background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 107, 0, 0.9) 100%) !important;
              color: #ffffff !important;
              cursor: pointer !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3) !important;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              z-index: 10 !important;
            }
            .carousel-nav-button.mobile-only:disabled {
              background: rgba(255, 255, 255, 0.3) !important;
              color: rgba(0, 0, 0, 0.3) !important;
              cursor: not-allowed !important;
              box-shadow: none !important;
            }
            .carousel-nav-button.mobile-only.left {
              left: calc(4% - 38px) !important;
            }
            .carousel-nav-button.mobile-only.right {
              right: calc(4% - 38px) !important;
            }
            
            /* Pagination dots - farther from card */
            .carousel-indicator {
              width: 8px !important;
              height: 8px !important;
              margin-top: 20px !important;
            }
            .carousel-indicator.active {
              width: 24px !important;
            }
            
            /* Mobile FAB Create Event Button - 90px from top, 20px from right */
            .create-event-button-mobile {
              position: fixed !important;
              top: 90px !important;
              right: 20px !important;
              bottom: auto !important;
              width: 56px !important;
              height: 56px !important;
              border-radius: 50% !important;
              padding: 0 !important;
              min-width: auto !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              z-index: 1000 !important;
            }
            .create-event-button-mobile button {
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              border-radius: 50% !important;
              font-size: 0 !important;
            }
            .create-event-button-mobile button span {
              display: none !important;
            }
            .create-event-button-mobile button svg {
              font-size: 1.5rem !important;
              margin: 0 !important;
            }
            
            /* Mobile Event Card - 92% width, max 380px, 20px padding, 24px border radius */
            .profile-card__detail-item {
              width: 92% !important;
              max-width: 380px !important;
              minWidth: 280px !important;
              height: auto !important;
              min-height: 420px !important;
              max-height: 520px !important;
              transform: scale(1) !important;
              opacity: 1 !important;
              margin: 0 auto !important;
              border-radius: 24px !important;
              flex-shrink: 0 !important;
            }
          }

          @media (min-width: 768px) and (max-width: 1023px) {
            .carousel-container {
              min-height: 650px !important;
              padding: 24px 0 !important;
            }
            .carousel-track {
              gap: 32px !important;
            }
            .carousel-nav-button.desktop-only {
              width: 56px !important;
              height: 56px !important;
              left: -60px !important;
              right: -60px !important;
            }
            
            /* Tablet Event Card adjustments */
            .profile-card__detail-item {
              minWidth: 380px !important;
              maxWidth: 440px !important;
              minHeight: 580px !important;
              maxHeight: 660px !important;
            }
          }

          @media (min-width: 1024px) {
            .carousel-container {
              min-height: 750px !important;
              padding: 32px 0 !important;
            }
            .carousel-track {
              gap: 56px !important;
            }
            .carousel-nav-button.desktop-only {
              width: 72px !important;
              height: 72px !important;
              left: -100px !important;
              right: -100px !important;
            }
          }
        `
      }} />
      
      {/* Create Event Button - Fixed at top-right - Hide when no events */}
      {createdEvents.length > 0 && (
        <div className="create-event-button-mobile" style={{ 
          position: 'fixed',
          top: 'clamp(80px, 8vh, 100px)',
          right: 'clamp(20px, 3vw, 40px)',
          zIndex: 1000,
        }}>
          <button
            onClick={() => setShowCreateEvent(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 32px',
              border: '2px solid transparent',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 12px 40px var(--forge-orange-shadow)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 16px 48px var(--forge-orange-shadow)';
              e.target.style.background = 'linear-gradient(135deg, var(--forge-orange-light) 0%, var(--forge-orange) 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 12px 40px var(--forge-orange-shadow)';
              e.target.style.background = 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)';
            }}
          >
            <IoAdd style={{ fontSize: '1.2rem' }} /> <span>Create Event</span>
          </button>
        </div>
      )}

      {/* Main Events Container - No wrapper */}
      <div style={{ 
        width: '100%',
        maxWidth: '90vw',
        margin: '0 auto',
        padding: 'clamp(100px, 12vh, 120px) 0 clamp(40px, 5vh, 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: '100%' }}>
          {loading ? (
            <div style={{ padding: 'clamp(40px, 8vh, 60px) 20px' }}>
              {/* Loading Skeleton */}
              <div style={{ 
                maxWidth: '380px',
                margin: '0 auto',
                padding: '24px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}>
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  background: 'linear-gradient(90deg, rgba(200, 200, 200, 0.3) 25%, rgba(230, 230, 230, 0.5) 50%, rgba(200, 200, 200, 0.3) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
                <div style={{ 
                  height: '16px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  background: 'linear-gradient(90deg, rgba(200, 200, 200, 0.3) 25%, rgba(230, 230, 230, 0.5) 50%, rgba(200, 200, 200, 0.3) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
                <div style={{ 
                  height: '24px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: 'linear-gradient(90deg, rgba(200, 200, 200, 0.3) 25%, rgba(230, 230, 230, 0.5) 50%, rgba(200, 200, 200, 0.3) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
                <div style={{ 
                  height: '12px',
                  width: '60%',
                  margin: '0 auto',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(200, 200, 200, 0.3) 25%, rgba(230, 230, 230, 0.5) 50%, rgba(200, 200, 200, 0.3) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
              </div>
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                  }
                `
              }} />
            </div>
          ) : createdEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vh, 80px) 20px' }}>
              <IoCalendarOutline style={{ fontSize: 'clamp(64px, 12vw, 96px)', color: '#cbd5e1', marginBottom: 'clamp(20px, 3vh, 32px)' }} />
              <p style={{ color: '#64748b', fontWeight: '700', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: 'clamp(12px, 2vh, 16px)' }}>
                No events created yet
              </p>
              <p style={{ color: '#94a3b8', fontWeight: '500', marginTop: 'clamp(8px, 1vh, 12px)', marginBottom: 'clamp(24px, 4vh, 32px)' }}>
                Create your first event to get started!
              </p>
              <button
                onClick={() => setShowCreateEvent(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  border: '2px solid transparent',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 12px 40px var(--forge-orange-shadow)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 16px 48px var(--forge-orange-shadow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 12px 40px var(--forge-orange-shadow)';
                }}
              >
                <IoAdd style={{ fontSize: '1.2rem' }} /> <span>Create Event</span>
              </button>
            </div>
          ) : (
            <div>
              {/* Carousel Container */}
              <div 
                ref={carouselRef}
                className="carousel-container"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '750px',
                  padding: 'clamp(24px, 4vw, 48px) 0',
                  width: '100%',
                  overflow: 'hidden',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Navigation Arrow - Left */}
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="carousel-nav-button desktop-only"
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentIndex === 0 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'linear-gradient(135deg, rgba(255, 107, 0, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)',
                    color: currentIndex === 0 ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: currentIndex === 0 
                      ? 'none' 
                      : '0 8px 24px rgba(255, 107, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 10,
                    opacity: currentIndex === 0 ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentIndex !== 0) {
                      e.target.style.transform = 'translateY(-50%) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 0, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentIndex !== 0) {
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                      e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.3)';
                    }
                  }}
                >
                  <IoChevronBack style={{ fontSize: 'clamp(1.4rem, 3vw, 1.6rem)' }} />
                </button>

                {/* Carousel Track */}
                <div
                  className="carousel-track"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    transform: 'translateX(' + String(-currentIndex * 100 + translateX) + '%)',
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '100%',
                  }}
                >
                  {createdEvents.map((event, index) => (
                    <div
                      key={event._id || index}
                      style={{
                        width: '100%',
                        flex: '0 0 100%',
                        padding: '0 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      <EventCard 
                        event={event} 
                        isActive={index === currentIndex}
                        index={index}
                      />
                      {/* Open Event Button - Outside Card */}
                      <button
                        onClick={(e) => {
                          console.log('Open Event button clicked for:', event.title);
                          setSelectedEvent(event);
                          setShowViewEvent(true);
                        }}
                        style={{
                          width: '100%',
                          maxWidth: '500px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          padding: '14px 24px',
                          border: 'none',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)',
                          color: '#ffffff',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)',
                          position: 'relative',
                          zIndex: 10,
                          pointerEvents: 'auto',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.background = 'linear-gradient(135deg, rgba(255, 107, 0, 1) 0%, rgba(255, 215, 0, 1) 100%)';
                          e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 0, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.background = 'linear-gradient(135deg, rgba(255, 107, 0, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)';
                          e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.3)';
                        }}
                      >
                        <IoEyeOutline style={{ fontSize: '1.2rem' }} /> Open Event
                      </button>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrow - Right */}
                <button
                  onClick={nextSlide}
                  disabled={currentIndex === createdEvents.length - 1}
                  className="carousel-nav-button desktop-only"
                  style={{
                    position: 'absolute',
                    right: '-32px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentIndex === createdEvents.length - 1 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'linear-gradient(135deg, rgba(255, 107, 0, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)',
                    color: currentIndex === createdEvents.length - 1 ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
                    cursor: currentIndex === createdEvents.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: currentIndex === createdEvents.length - 1 
                      ? 'none' 
                      : '0 8px 24px rgba(255, 107, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 10,
                    opacity: currentIndex === createdEvents.length - 1 ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentIndex !== createdEvents.length - 1) {
                      e.target.style.transform = 'translateY(-50%) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 0, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentIndex !== createdEvents.length - 1) {
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                      e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.3)';
                    }
                  }}
                >
                  <IoChevronForward style={{ fontSize: 'clamp(1.4rem, 3vw, 1.6rem)' }} />
                </button>

                {/* Mobile Navigation Button - Left */}
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="carousel-nav-button mobile-only left"
                  style={{ display: 'none' }}
                >
                  <IoChevronBack style={{ fontSize: '1.2rem' }} />
                </button>

                {/* Mobile Navigation Button - Right */}
                <button
                  onClick={nextSlide}
                  disabled={currentIndex === createdEvents.length - 1}
                  className="carousel-nav-button mobile-only right"
                  style={{ display: 'none' }}
                >
                  <IoChevronForward style={{ fontSize: '1.2rem' }} />
                </button>

                {/* Carousel Indicators */}
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(16px, 2vw, 24px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '10px',
                  zIndex: 10,
                }}>
                  {createdEvents.map((_, index) => {
                    const indicatorClass = 'carousel-indicator' + (index === currentIndex ? ' active' : '');
                    return (
                      <div
                        key={index}
                        className={indicatorClass}
                        onClick={() => goToSlide(index)}
                        style={{
                        width: index === currentIndex ? '28px' : '10px',
                        height: '10px',
                        borderRadius: '999px',
                        background: index === currentIndex 
                          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 107, 0, 0.8) 100%)' 
                          : 'rgba(255, 255, 255, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: index === currentIndex 
                          ? '0 6px 16px rgba(255, 215, 0, 0.3)' 
                          : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (index !== currentIndex) {
                          e.target.style.width = '18px';
                          e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== currentIndex) {
                          e.target.style.width = '10px';
                          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                        }
                      }}
                    />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <NavigationBar isChatPage={false} />
      
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