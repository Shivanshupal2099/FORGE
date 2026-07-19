const Event = require('../models/Event.model');
const User = require('../models/Users.model');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    console.log('Received event creation request');
    console.log('Request body:', req.body);
    
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
      endAt, 
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
      endAt: endAt ? new Date(endAt) : null,
      organizer,
      registrationRequired: registrationRequired || false,
      maxAttendees: registrationRequired ? maxAttendees : null,
      visibility: visibility || 'Public',
      priceType: priceType || 'Free',
      contactInformation,
      status: status || 'draft',
      imageUrl
    });

    console.log('Event created successfully:', event._id);

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
    
    const events = await Event.find()
      .sort({ created_at: -1 });

    // Add ownership information to each event
    const eventsWithOwnership = events.map(event => ({
      ...event.toObject(),
      isOwner: req.user && event.uid === req.user.uid
    }));

    console.log(`Found ${events.length} events`);

    res.json({
      success: true,
      events: eventsWithOwnership
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

    res.json({
      success: true,
      event: {
        ...event.toObject(),
        isOwner: req.user && event.uid === req.user.uid
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
      endAt, 
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
    if (endAt) event.endAt = new Date(endAt);
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
