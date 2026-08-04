const Event = require('../models/Event.model');
const User = require('../models/Users.model');
const EventAttendees = require('../models/EventAttendees.model');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Get authenticated user from middleware
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const { 
      title, 
      description, 
      category, 
      onlineType, 
      locationOrLink, 
      startAt, 
      organizer, 
      registrationRequired, 
      maxAttendees, 
      visibility, 
      priceType, 
      contactInformation, 
      status,
      imageUrl 
    } = req.body;

    // Create new event with authenticated user's info
    const event = await Event.create({
      uid: user.uid,
      user_id: user._id,
      title,
      description,
      category,
      onlineType: onlineType || 'Offline',
      locationOrLink,
      startAt: startAt ? new Date(startAt) : null,
      organizer,
      registrationRequired: registrationRequired || false,
      maxAttendees: registrationRequired ? maxAttendees : null,
      visibility: visibility || 'Public',
      priceType: priceType || 'Free',
      contactInformation,
      status: 'published',
      imageUrl
    });

    res.json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    console.log('Received get all events request');
    
    // Fetch all events (no visibility filter for now to debug)
    const events = await Event.find()
      .sort({ created_at: -1 });

    console.log(`Found ${events.length} total events in database`);
    console.log('Events visibility:', events.map(e => ({ title: e.title, visibility: e.visibility })));

    // Filter events based on registration limit and user registration status
    let filteredEvents = events;
    if (req.user) {
      filteredEvents = await Promise.all(events.map(async (event) => {
        // If event has max attendees and requires registration
        if (event.registrationRequired && event.maxAttendees) {
          const currentAttendees = await EventAttendees.countDocuments({
            event_id: event._id,
            status: 'registered'
          });

          // Check if event is full
          if (currentAttendees >= event.maxAttendees) {
            // Check if user is already registered
            const userRegistered = await EventAttendees.findOne({
              event_id: event._id,
              user_id: req.user._id,
              status: 'registered'
            });

            // Only show event if user is registered or is the owner
            if (!userRegistered && event.uid !== req.user.uid) {
              return null; // Don't show this event
            }
          }
        }
        return event;
      }));

      // Filter out null values
      filteredEvents = filteredEvents.filter(event => event !== null);
    }

    // Add ownership and registration information to each event
    const eventsWithInfo = await Promise.all(filteredEvents.map(async (event) => {
      let isRegistered = false;
      let attendeeCount = 0;

      if (req.user) {
        const registration = await EventAttendees.findOne({
          event_id: event._id,
          user_id: req.user._id,
          status: 'registered'
        });
        isRegistered = !!registration;
      }

      if (event.registrationRequired) {
        attendeeCount = await EventAttendees.countDocuments({
          event_id: event._id,
          status: 'registered'
        });
      }

      return {
        ...event.toObject(),
        isOwner: req.user && event.uid === req.user.uid,
        isRegistered,
        attendeeCount,
        spotsRemaining: event.maxAttendees ? event.maxAttendees - attendeeCount : null
      };
    }));

    console.log(`Found ${eventsWithInfo.length} events after filtering`);

    res.json({
      success: true,
      events: eventsWithInfo
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check registration status and attendee count
    let isRegistered = false;
    let attendeeCount = 0;
    let spotsRemaining = null;

    if (req.user) {
      const registration = await EventAttendees.findOne({
        event_id: event._id,
        user_id: req.user._id,
        status: 'registered'
      });
      isRegistered = !!registration;
    }

    if (event.registrationRequired) {
      attendeeCount = await EventAttendees.countDocuments({
        event_id: event._id,
        status: 'registered'
      });
      spotsRemaining = event.maxAttendees ? event.maxAttendees - attendeeCount : null;
    }

    res.json({
      success: true,
      event: {
        ...event.toObject(),
        isOwner: req.user && event.uid === req.user.uid,
        isRegistered,
        attendeeCount,
        spotsRemaining
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Get all events created by a specific user
exports.getUserEvents = async (req, res) => {
  try {
    console.log('Received get user events request');
    const { uid } = req.params;

    // Find user by UID
    const user = await User.findOne({ uid });
    
    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all events created by this user
    const events = await Event.find({ uid: uid })
      .sort({ created_at: -1 });

    // Add ownership information to each event
    const eventsWithOwnership = events.map(event => ({
      ...event.toObject(),
      isOwner: req.user && event.uid === req.user.uid
    }));

    console.log(`Found ${events.length} events for user ${uid}`);

    res.json({
      success: true,
      events: eventsWithOwnership
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching user events',
      error: error.message
    });
  }
};

// Update an event (only the creator can update)
exports.updateEvent = async (req, res) => {
  try {
    console.log('Received event update request');
    const { id } = req.params;
    
    // Get authenticated user from middleware
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator
    if (event.uid !== user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event'
      });
    }

    // Update event fields (ignore client-supplied uid/user_id)
    const { 
      title, 
      description, 
      category, 
      onlineType, 
      locationOrLink, 
      startAt, 
      organizer, 
      registrationRequired, 
      maxAttendees, 
      visibility, 
      priceType, 
      contactInformation, 
      status,
      imageUrl 
    } = req.body;

    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (category) event.category = category;
    if (onlineType) event.onlineType = onlineType;
    if (locationOrLink !== undefined) event.locationOrLink = locationOrLink;
    if (startAt) event.startAt = new Date(startAt);
    if (organizer !== undefined) event.organizer = organizer;
    if (registrationRequired !== undefined) event.registrationRequired = registrationRequired;
    if (maxAttendees !== undefined) event.maxAttendees = maxAttendees;
    if (visibility) event.visibility = visibility;
    if (priceType) event.priceType = priceType;
    if (contactInformation !== undefined) event.contactInformation = contactInformation;
    if (status) event.status = status;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;

    await event.save();
    console.log('Event updated successfully:', event._id);

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete an event (only the creator can delete)
exports.deleteEvent = async (req, res) => {
  try {
    console.log('Received event delete request');
    const { id } = req.params;
    
    // Get authenticated user from middleware
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator
    if (event.uid !== user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(id);
    console.log('Event deleted successfully:', id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Register for an event
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is required
    if (!event.registrationRequired) {
      return res.status(400).json({
        success: false,
        message: 'This event does not require registration'
      });
    }

    // Check if event has reached max attendees
    if (event.maxAttendees) {
      const currentAttendees = await EventAttendees.countDocuments({
        event_id: id,
        status: 'registered'
      });

      if (currentAttendees >= event.maxAttendees) {
        return res.status(400).json({
          success: false,
          message: 'Event registration is full'
        });
      }
    }

    // Check if user is already registered
    const existingRegistration = await EventAttendees.findOne({
      event_id: id,
      user_id: user._id,
      status: 'registered'
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Create registration
    const registration = await EventAttendees.create({
      event_id: id,
      user_id: user._id,
      uid: user.uid,
      status: 'registered'
    });

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      registration
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
};

// Check registration status for an event
exports.checkRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const registration = await EventAttendees.findOne({
      event_id: id,
      user_id: user._id,
      status: 'registered'
    });

    res.json({
      success: true,
      isRegistered: !!registration,
      registration
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking registration status',
      error: error.message
    });
  }
};

// Cancel registration for an event
exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const registration = await EventAttendees.findOneAndUpdate(
      {
        event_id: id,
        user_id: user._id,
        status: 'registered'
      },
      {
        status: 'cancelled'
      }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling registration',
      error: error.message
    });
  }
};
