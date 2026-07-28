import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaGlobe,
  FaUsers,
  FaTicketAlt,
  FaUserTie,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

function Event({ onClose, eventToEdit, onEventUpdated }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!eventToEdit);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [category, setCategory] = useState(eventToEdit?.category || '');

  const [onlineType, setOnlineType] = useState(eventToEdit?.onlineType || 'Offline');
  const [locationOrLink, setLocationOrLink] = useState(eventToEdit?.locationOrLink || '');

  const [startDate, setStartDate] = useState(eventToEdit?.startAt ? new Date(eventToEdit.startAt).toISOString().split('T')[0] : '');
  const [startTime, setStartTime] = useState(eventToEdit?.startAt ? new Date(eventToEdit.startAt).toTimeString().slice(0, 5) : '');

  const [endDate, setEndDate] = useState(eventToEdit?.endAt ? new Date(eventToEdit.endAt).toISOString().split('T')[0] : '');
  const [endTime, setEndTime] = useState(eventToEdit?.endAt ? new Date(eventToEdit.endAt).toTimeString().slice(0, 5) : '');

  const [organizer, setOrganizer] = useState(eventToEdit?.organizer || '');

  const [registrationRequired, setRegistrationRequired] = useState(eventToEdit?.registrationRequired || false);
  const [maxAttendees, setMaxAttendees] = useState(eventToEdit?.maxAttendees || '');

  const [visibility, setVisibility] = useState(eventToEdit?.visibility || 'Public');
  const [priceType, setPriceType] = useState(eventToEdit?.priceType || 'Free');

  const [contactInformation, setContactInformation] = useState(eventToEdit?.contactInformation || '');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const computedStart = useMemo(() => {
    if (!startDate || !startTime) return null;
    return new Date(`${startDate}T${startTime}:00`).getTime();
  }, [startDate, startTime]);

  const computedEnd = useMemo(() => {
    if (!endDate || !endTime) return null;
    return new Date(`${endDate}T${endTime}:00`).getTime();
  }, [endDate, endTime]);

  const validate = () => {
    if (!title.trim()) return 'Event title is required.';
    if (!startDate || !startTime) return 'Start date and time are required.';

    if ((endDate && !endTime) || (!endDate && endTime)) {
      return 'Please provide both end date and end time (or leave both empty).';
    }

    if (computedEnd != null && computedStart != null && computedEnd < computedStart) {
      return 'End date/time must be after the start date/time.';
    }

    if (registrationRequired) {
      const n = Number(maxAttendees);
      if (!maxAttendees || Number.isNaN(n) || !Number.isFinite(n)) {
        return 'Maximum attendees is required and must be a number when registration is required.';
      }
      if (n <= 0) {
        return 'Maximum attendees must be greater than 0.';
      }
    }

    return null;
  };

  const buildPayload = () => {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category || null,
      onlineType,
      locationOrLink: locationOrLink.trim() || null,
      startAt: computedStart ? new Date(computedStart).toISOString() : null,
      endAt: computedEnd != null ? new Date(computedEnd).toISOString() : null,
      organizer: organizer.trim() || null,
      registrationRequired,
      maxAttendees: registrationRequired && maxAttendees ? Number(maxAttendees) : null,
      visibility,
      priceType,
      contactInformation: contactInformation.trim() || null,
      status: 'published',
    };

    return payload;
  };

  const persistEvent = async (payload) => {
    try {
      setIsLoading(true);
      
      const url = isEditMode 
        ? `/api/events/${eventToEdit._id}`
        : '/api/events';
      
      const method = isEditMode ? 'put' : 'post';
      
      const response = await axios[method](url, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }

      return response.data;
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const payload = buildPayload();

    try {
      await persistEvent(payload);

      alert(`Event "${payload.title}" ${isEditMode ? 'updated and' : ''} published successfully!`);

      if (isEditMode && onEventUpdated) {
        onEventUpdated();
      }

      if (!isEditMode) {
        setTitle('');
        setDescription('');
        setCategory('');
        setOnlineType('Offline');
        setLocationOrLink('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setOrganizer('');
        setRegistrationRequired(false);
        setMaxAttendees('');
        setVisibility('Public');
        setPriceType('Free');
        setContactInformation('');
      }

      onClose?.();
    } catch (error) {
      alert(`Failed to publish event: ${error.message}`);
    }
  };

  return (
    <>
      <style>{`
        .event-modal::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div 
        onClick={onClose} 
        role="presentation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: isMobile ? '0' : '20px',
        }}
      >
        <div
          className="event-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-popup-title"
          style={{
            background: 'var(--app-card-bg)',
            borderRadius: isMobile ? '24px 24px 0 0' : '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: isMobile ? '100vh' : '90vh',
            overflow: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            boxShadow: 'var(--app-soft-shadow)',
            position: 'relative',
            border: '2px solid var(--app-card-border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event popup"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              border: '2px solid var(--app-card-border)',
              background: 'var(--app-surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--app-surface-strong)';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.borderColor = 'var(--app-accent-bg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--app-surface)';
              e.target.style.transform = 'scale(1)';
              e.target.style.borderColor = 'var(--app-card-border)';
            }}
          >
            <FaTimes style={{ fontSize: '20px', color: 'var(--app-text)' }} />
          </button>

          <div style={{ padding: isMobile ? '24px' : '40px' }}>
            <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--app-accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                }}>
                  <FaCalendarAlt style={{ fontSize: '24px', color: 'var(--app-accent-text)' }} />
                </div>
                <div>
                  <h2 id="event-popup-title" style={{
                    margin: 0,
                    fontSize: isMobile ? '24px' : '28px',
                    fontWeight: '800',
                    color: 'var(--app-text)',
                    letterSpacing: '-0.5px',
                  }}>
                    {isEditMode ? 'Edit Event' : 'Create Event'}
                  </h2>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'var(--app-muted-text)',
                    fontWeight: '500',
                  }}>
                    {isEditMode ? 'Update your event details and settings.' : 'Organize community events and reward participants with Forge tokens.'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: isMobile ? '24px' : '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-title" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaCalendarAlt style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="event-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-description" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                  }}>
                    Description
                  </label>
                  <textarea
                    id="event-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your event, what to expect, and who should attend..."
                    rows="4"
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      color: 'var(--app-text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-category" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaTag style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                    Category
                  </label>
                  <select
                    id="event-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                      cursor: 'pointer',
                      color: 'var(--app-text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Conference">Conference</option>
                    <option value="Social">Social</option>
                    <option value="Sports">Sports</option>
                    <option value="Charity">Charity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-start-date" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                    }}>
                      Start date *
                    </label>
                    <input
                      type="date"
                      id="event-start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                        cursor: 'pointer',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-start-time" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                    }}>
                      Start time *
                    </label>
                    <input
                      type="time"
                      id="event-start-time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                        cursor: 'pointer',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-end-date" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                    }}>
                      End date
                    </label>
                    <input
                      type="date"
                      id="event-end-date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                        cursor: 'pointer',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-end-time" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                    }}>
                      End time
                    </label>
                    <input
                      type="time"
                      id="event-end-time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                        cursor: 'pointer',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-online-type" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaGlobe style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                    Event Format
                  </label>
                  <select
                    id="event-online-type"
                    value={onlineType}
                    onChange={(e) => setOnlineType(e.target.value)}
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                      cursor: 'pointer',
                      color: 'var(--app-text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-location-or-link" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaMapMarkerAlt style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                    Location (or meeting link)
                  </label>
                  <input
                    type="text"
                    id="event-location-or-link"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder={
                      onlineType === 'Online'
                        ? 'Paste meeting link'
                        : 'Enter event location or venue'
                    }
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-organizer" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaUserTie style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                    Organizer
                  </label>
                  <input
                    type="text"
                    id="event-organizer"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Organizer name"
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-registration-required" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaUsers style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                    Registration required
                  </label>
                  <select
                    id="event-registration-required"
                    value={registrationRequired ? 'Yes' : 'No'}
                    onChange={(e) => setRegistrationRequired(e.target.value === 'Yes')}
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                      cursor: 'pointer',
                      color: 'var(--app-text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {registrationRequired ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-max-attendees" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                    }}>
                      Maximum attendees *
                    </label>
                    <input
                      type="number"
                      id="event-max-attendees"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      placeholder="e.g. 50"
                      min={1}
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ) : null}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-visibility" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                    }}>
                      Visibility
                    </label>
                    <select
                      id="event-visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                        cursor: 'pointer',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                    <label htmlFor="event-price" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '700',
                      color: 'var(--app-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <FaTicketAlt style={{ color: 'var(--app-accent-bg)', fontSize: '14px' }} />
                      Price Type
                    </label>
                    <select
                      id="event-price"
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid var(--app-card-border)',
                        fontSize: isMobile ? '14px' : '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'var(--app-surface)',
                        cursor: 'pointer',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--app-accent-bg)';
                        e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--app-card-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="Free">Free</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                  <label htmlFor="event-contact-info" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '700',
                    color: 'var(--app-text)',
                  }}>
                    Contact information
                  </label>
                  <input
                    type="text"
                    id="event-contact-info"
                    value={contactInformation}
                    onChange={(e) => setContactInformation(e.target.value)}
                    placeholder="Public contact (email/phone)"
                    style={{
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--app-card-border)',
                      fontSize: isMobile ? '14px' : '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'var(--app-surface)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--app-accent-bg)';
                      e.target.style.boxShadow = '0 0 0 3px var(--app-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--app-card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
                <div style={{
                  background: 'var(--app-accent-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'var(--app-accent-text)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <FaCalendarAlt style={{ fontSize: '20px', color: 'var(--app-accent-text)' }} />
                  </div>
                  <p style={{
                    margin: '0 0 12px',
                    fontSize: '18px',
                    fontWeight: '800',
                    lineHeight: '1.3',
                  }}>
                    {title || 'Event Title'}
                  </p>
                  {startDate ? (
                    <p style={{
                      margin: '0 0 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      opacity: 0.9,
                    }}>
                      {new Date(startDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      {startTime ? `• ${startTime}` : null}
                    </p>
                  ) : null}
                  {endDate && endTime ? (
                    <p style={{
                      margin: '0 0 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      opacity: 0.9,
                    }}>
                      Ends{' '}
                      {new Date(endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {endTime}
                    </p>
                  ) : null}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '12px',
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      {onlineType}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      {visibility}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      {priceType}
                    </span>
                  </div>
                  {locationOrLink ? (
                    <p style={{
                      margin: '12px 0 0',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: 0.85,
                      wordBreak: 'break-word',
                    }}>
                      {locationOrLink}
                    </p>
                  ) : null}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '12px',
                marginTop: isMobile ? '24px' : '32px',
                paddingTop: isMobile ? '20px' : '24px',
                borderTop: '1px solid var(--app-card-border)',
                flexDirection: isMobile ? 'column' : 'row',
              }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: isMobile ? '14px 20px' : '14px 28px',
                  borderRadius: '14px',
                  border: '2px solid var(--app-card-border)',
                  background: 'var(--app-surface)',
                  color: 'var(--app-muted-text)',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: isMobile ? '100%' : 'auto',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'var(--app-surface-strong)';
                    e.target.style.borderColor = 'var(--app-card-border)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--app-surface)';
                  e.target.style.borderColor = 'var(--app-card-border)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: isMobile ? '14px 20px' : '14px 28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'var(--app-accent-bg)',
                  color: 'var(--app-accent-text)',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '800',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 24px var(--app-ring)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 12px 32px var(--app-ring)';
                    e.target.style.filter = 'brightness(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px var(--app-ring)';
                  e.target.style.filter = 'brightness(1)';
                }}
              >
                <FaCalendarAlt style={{ fontSize: '16px' }} />
                {isLoading ? 'Publishing...' : 'Publish Event'}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Event;
