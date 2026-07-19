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

function Event({ onClose, eventToEdit, onEventUpdated }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!eventToEdit);
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [category, setCategory] = useState(eventToEdit?.category || '');

  const [onlineType, setOnlineType] = useState(eventToEdit?.onlineType || 'Offline'); // Online / Offline / Hybrid
  const [locationOrLink, setLocationOrLink] = useState(eventToEdit?.locationOrLink || '');

  const [startDate, setStartDate] = useState(eventToEdit?.startAt ? new Date(eventToEdit.startAt).toISOString().split('T')[0] : '');
  const [startTime, setStartTime] = useState(eventToEdit?.startAt ? new Date(eventToEdit.startAt).toTimeString().slice(0, 5) : '');

  const [endDate, setEndDate] = useState(eventToEdit?.endAt ? new Date(eventToEdit.endAt).toISOString().split('T')[0] : '');
  const [endTime, setEndTime] = useState(eventToEdit?.endAt ? new Date(eventToEdit.endAt).toTimeString().slice(0, 5) : '');

  const [organizer, setOrganizer] = useState(eventToEdit?.organizer || '');

  const [registrationRequired, setRegistrationRequired] = useState(eventToEdit?.registrationRequired || false);
  const [maxAttendees, setMaxAttendees] = useState(eventToEdit?.maxAttendees || '');

  const [visibility, setVisibility] = useState(eventToEdit?.visibility || 'Public'); // Public / Private
  const [priceType, setPriceType] = useState(eventToEdit?.priceType || 'Free'); // Free / Paid

  const [contactInformation, setContactInformation] = useState(eventToEdit?.contactInformation || '');

  const [draftStatus, setDraftStatus] = useState(eventToEdit?.status || 'draft'); // 'published' or 'draft'

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
      endAt:
        computedEnd != null ? new Date(computedEnd).toISOString() : null,

      organizer: organizer.trim() || null,

      registrationRequired,
      maxAttendees: registrationRequired ? Number(maxAttendees) : null,

      visibility,
      priceType,

      contactInformation: contactInformation.trim() || null,

      status: draftStatus,
    };

    return payload;
  };

  const persistEvent = async (payload) => {
    try {
      setIsLoading(true);
      
      const url = isEditMode 
        ? `http://localhost:5000/api/events/${eventToEdit._id}`
        : 'http://localhost:5000/api/events';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }

      return data;
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (status) => {
    setDraftStatus(status);

    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    // Build payload with the selected status.
    const payload = buildPayload();
    payload.status = status;

    try {
      await persistEvent(payload);

      alert(
        status === 'published'
          ? `Event "${payload.title}" ${isEditMode ? 'updated and' : ''} published successfully!`
          : `Event "${payload.title}" ${isEditMode ? 'updated and' : ''} saved as draft successfully!`
      );

      // Call onEventUpdated if in edit mode
      if (isEditMode && onEventUpdated) {
        onEventUpdated();
      }

      // Reset form only if in create mode
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

        setDraftStatus('draft');
      }

      // keep behavior: close after action
      onClose?.();
    } catch (error) {
      alert(`Failed to ${status === 'published' ? 'publish' : 'save'} event: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAction('published');
  };

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--event"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close event popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaCalendarAlt aria-hidden="true" />
          </span>
          <div>
            <h2 id="event-popup-title" className="home-popup__title">
              {isEditMode ? 'Edit Event' : 'Create Event'}
            </h2>
            <p className="home-popup__subtitle">
              {isEditMode ? 'Update your event details and settings.' : 'Organize community events and reward participants with Forge tokens.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="event-form__main">
            <div className="form-group">
              <label htmlFor="event-title">
                <FaCalendarAlt aria-hidden="true" /> Event Title *
              </label>
              <input
                type="text"
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event, what to expect, and who should attend..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-category">
                <FaTag aria-hidden="true" /> Category
              </label>
              <select
                id="event-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event-start-date">Start date *</label>
                <input
                  type="date"
                  id="event-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-start-time">Start time *</label>
                <input
                  type="time"
                  id="event-start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event-end-date">End date</label>
                <input
                  type="date"
                  id="event-end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-end-time">End time</label>
                <input
                  type="time"
                  id="event-end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="event-online-type">
                <FaGlobe aria-hidden="true" /> Online / Offline / Hybrid
              </label>
              <select
                id="event-online-type"
                value={onlineType}
                onChange={(e) => setOnlineType(e.target.value)}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-location-or-link">
                <FaMapMarkerAlt aria-hidden="true" /> Location (or meeting link)
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-organizer">
                <FaUserTie aria-hidden="true" /> Organizer
              </label>
              <input
                type="text"
                id="event-organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="Organizer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-registration-required">
                <FaUsers aria-hidden="true" /> Registration required
              </label>
              <select
                id="event-registration-required"
                value={registrationRequired ? 'Yes' : 'No'}
                onChange={(e) => setRegistrationRequired(e.target.value === 'Yes')}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {registrationRequired ? (
              <div className="form-group">
                <label htmlFor="event-max-attendees">Maximum attendees *</label>
                <input
                  type="number"
                  id="event-max-attendees"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  placeholder="e.g. 50"
                  min={1}
                />
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="event-visibility">Public / Private</label>
              <select
                id="event-visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-price">
                <FaTicketAlt aria-hidden="true" /> Free / Paid
              </label>
              <select
                id="event-price"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-contact-info">Contact information</label>
              <input
                type="text"
                id="event-contact-info"
                value={contactInformation}
                onChange={(e) => setContactInformation(e.target.value)}
                placeholder="Public contact (email/phone)"
              />
            </div>
          </div>

          <div className="event-form__sidebar">
            <div className="event-form__preview">
              <div className="event-form__preview-icon">
                <FaCalendarAlt aria-hidden="true" />
              </div>
              <p className="event-form__preview-text">{title || 'Event Title'}</p>

              {startDate ? (
                <p className="event-form__preview-date">
                  {new Date(startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  {startTime ? `• ${startTime}` : null}
                </p>
              ) : null}

              {endDate && endTime ? (
                <p className="event-form__preview-date">
                  Ends{' '}
                  {new Date(endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {endTime}
                </p>
              ) : null}

              <p className="event-form__preview-date">
                {onlineType} • {visibility} • {priceType}
              </p>
              {locationOrLink ? (
                <p className="event-form__preview-date">{locationOrLink}</p>
              ) : null}
            </div>
          </div>

          <div className="home-popup-actions">
            <button type="button" className="button-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => handleAction('draft')}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>

            <button type="submit" className="button-primary" disabled={isLoading}>
              <FaCalendarAlt aria-hidden="true" /> {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Event;

