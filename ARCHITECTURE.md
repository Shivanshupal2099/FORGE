# ForgeConnect Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication Flow](#authentication-flow)
8. [Real-time Features](#real-time-features)
9. [PWA Features](#pwa-features)
10. [Push Notification System](#push-notification-system)
11. [Payment Integration](#payment-integration)
12. [File Structure](#file-structure)

---

## Overview

ForgeConnect is a collaborative networking platform that enables users to connect, chat, collaborate on surveys, attend events, and share offers. The application follows a modern full-stack architecture with:

- **Frontend**: React + Vite with PWA capabilities
- **Backend**: Node.js + Express with MongoDB
- **Real-time**: Socket.io for live features
- **Authentication**: Supabase + JWT
- **Payments**: Cashfree integration
- **Push Notifications**: Web Push API with VAPID

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │  Mobile Web  │  │  PWA App     │     │
│  │  (React)     │  │  (React)     │  │  (Service    │     │
│  │              │  │              │  │   Worker)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS + WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Express    │  │  Socket.io   │  │  Controllers │     │
│  │   Server     │  │   Server     │  │   & Routes   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Middleware  │  │   Services   │  │   Utils      │     │
│  │  (Auth, XSS, │  │  (Survey,    │  │  (Cleanup,   │     │
│  │   Rate Limit)│  │   Payment)   │  │   Sanitizer) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                    MongoDB Atlas                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Users     │  │ Connections  │  │   Messages   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Events     │  │   Surveys    │  │   Offers     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ External APIs
                            │
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Supabase   │  │   Cashfree   │  │  Web Push    │     │
│  │  (Auth)      │  │  (Payments)  │  │  (VAPID)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with Vite build tool
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: React Icons (FontAwesome)
- **PWA**: Workbox for service worker generation
- **Push Notifications**: Web Push API with custom hooks

### Directory Structure

```
Frontend/FORGE/
├── public/
│   ├── sw.js                          # Service Worker
│   ├── manifest.webmanifest           # PWA Manifest
│   └── assets/                        # Static assets
├── src/
│   ├── api/
│   │   └── axios.js                   # Axios configuration
│   ├── assets/                        # Images and assets
│   ├── Components/
│   │   ├── ActiveEvent.jsx            # Active event display
│   │   ├── Alert.jsx                  # Alert notifications
│   │   ├── ChatSidebar.jsx            # Chat sidebar
│   │   ├── CommunityJoinPopup.jsx     # Community join popup
│   │   ├── ConnectedUsersPopup.jsx    # Connected users popup
│   │   ├── ErrorBoundary.jsx         # Error boundary
│   │   ├── Event.jsx                  # Event card
│   │   ├── Filtersection.jsx          # Filter component
│   │   ├── GuestRoute.jsx             # Guest route wrapper
│   │   ├── Header.jsx                 # App header
│   │   ├── NavigationBar.jsx          # Bottom navigation
│   │   ├── Offer.jsx                  # Offer card
│   │   ├── PWAInstallPrompt.jsx       # PWA install prompt
│   │   ├── PWADownloadButton.jsx      # PWA download button
│   │   ├── ProtectedRoute.jsx        # Protected route wrapper
│   │   ├── PushPermissionPrompt.jsx   # Push notification permission
│   │   ├── Request.jsx                # Connection request
│   │   ├── SuccessModal.jsx           # Success modal
│   │   ├── Survey.jsx                 # Survey component
│   │   ├── SurveyCard.jsx             # Survey card
│   │   ├── SurveyQuestion.jsx         # Survey question
│   │   ├── SurveyRotator.jsx          # Survey rotator
│   │   ├── Toast.jsx                  # Toast notifications
│   │   ├── Tokens.jsx                 # Token display
│   │   ├── Usercard.jsx               # User profile card
│   │   ├── VerificationPopup.jsx     # Verification popup
│   │   ├── ViewEvent.jsx              # Event view
│   │   └── WelcomeCard.jsx            # Welcome card
│   ├── contexts/
│   │   ├── AlertContext.jsx           # Alert state management
│   │   ├── AuthContext.jsx            # Authentication state
│   │   └── SocketContext.jsx          # Socket.io connection
│   ├── hooks/
│   │   └── usePushNotifications.js    # Push notification hook
│   ├── pages/
│   │   ├── AccountPage.jsx            # Account management
│   │   ├── AuthCallback.jsx           # OAuth callback
│   │   ├── ChatPage.jsx               # Chat interface
│   │   ├── EditProfilePage.jsx        # Profile editing
│   │   ├── EventDetailPage.jsx        # Event details
│   │   ├── HomePage.jsx               # Home page
│   │   ├── Landing.jsx                # Landing page
│   │   ├── LoginPage.jsx              # Login page
│   │   ├── MapPage.jsx                # Map view
│   │   ├── MessagerPage.jsx           # Messaging page
│   │   ├── NearbyPage.jsx             # Nearby users (radar)
│   │   ├── PrivacyPage.jsx            # Privacy policy
│   │   ├── ProfilePage.jsx            # Profile view
│   │   ├── PublicSurveyPage.jsx       # Public survey
│   │   ├── SettingPage.jsx            # Settings
│   │   ├── SurveyResultsPage.jsx      # Survey results
│   │   └── UserEventsPage.jsx         # User events
│   ├── utils/
│   │   └── mobileDetection.js         # Mobile device detection
│   ├── App.css                        # Global styles
│   ├── App.jsx                        # Main app component
│   └── main.jsx                       # Entry point
├── package.json
└── vite.config.js
```

### Key Frontend Features

#### 1. Authentication Context
- Manages user authentication state
- Handles Supabase session management
- Syncs user data with backend
- Tracks user activity status

#### 2. Socket Context
- Manages Socket.io connection
- Handles real-time events
- Auto-reconnection logic

#### 3. Push Notification Hook
- Mobile device detection (Android/iOS)
- Permission request management
- Subscription/unsubscription handling
- Backend API integration

#### 4. PWA Features
- Service worker for offline support
- App manifest for installation
- Install prompt for eligible devices
- Background sync capabilities

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT + Supabase
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Payments**: Cashfree SDK
- **Push Notifications**: web-push library

### Directory Structure

```
Backend/
├── config/
│   ├── cashfree.js                    # Cashfree configuration
│   └── database.js                    # MongoDB connection
├── controllers/
│   ├── auth.controller.js             # Authentication logic
│   ├── chat.controller.js             # Chat/messaging logic
│   ├── community.controller.js        # Community management
│   ├── connection.controller.js      # Connection management
│   ├── event.controller.js            # Event management
│   ├── issue.controller.js            # Issue reporting
│   ├── location.controller.js         # Location services
│   ├── offer.controller.js            # Offer management
│   ├── payment.controller.js          # Payment processing
│   ├── profile.controller.js          # Profile management
│   ├── push.controller.js             # Push notifications
│   ├── survey.controller.js           # Survey management
│   ├── token.controller.js            # Token management
│   └── waitlist.controller.js         # Waitlist management
├── middlewares/
│   ├── activity.middleware.js         # User activity tracking
│   ├── auth.middleware.js             # Authentication middleware
│   ├── csrf.middleware.js             # CSRF protection
│   ├── error.middleware.js            # Error handling
│   ├── errorHandler.middleware.js      # Global error handler
│   ├── rateLimiter.middleware.js      # Rate limiting
│   ├── validation.middleware.js       # Request validation
│   └── xss.middleware.js              # XSS protection
├── migrations/
│   └── fixCashfreePaymentIdIndex.js  # Database migration
├── models/
│   ├── BlockUser.model.js             # Blocked users
│   ├── Community.model.js             # Communities
│   ├── Connection.model.js            # User connections
│   ├── Event.model.js                 # Events
│   ├── EventAttendees.model.js        # Event attendees
│   ├── Issue.model.js                 # Issues/reports
│   ├── Message.model.js                # Chat messages
│   ├── Notification.model.js          # Notifications
│   ├── Offer.model.js                 # Offers
│   ├── OfferReport.model.js           # Offer reports
│   ├── PWAInstallation.model.js       # PWA installations
│   ├── Profile.model.js                # User profiles
│   ├── PushSubscription.model.js      # Push subscriptions
│   ├── PushToken.model.js             # Push tokens
│   ├── Question.model.js              # Survey questions
│   ├── QuestionAnswer.model.js        # Question answers
│   ├── RefreshToken.model.js          # JWT refresh tokens
│   ├── Reports.model.js               # Reports
│   ├── Survey.model.js                # Surveys
│   ├── SurveyReport.model.js          # Survey reports
│   ├── SurveyResponse.model.js        # Survey responses
│   ├── Token.model.js                 # Tokens
│   ├── Transaction.model.js           # Payment transactions
│   ├── UserLocation.model.js          # User locations
│   ├── UserSession.model.js           # User sessions
│   ├── Users.model.js                 # User accounts
│   └── Waitlist.model.js              # Waitlist entries
├── routes/
│   ├── auth.routes.js                 # Authentication routes
│   ├── chat.routes.js                 # Chat routes
│   ├── community.routes.js            # Community routes
│   ├── connection.routes.js          # Connection routes
│   ├── event.routes.js                # Event routes
│   ├── issue.routes.js                # Issue routes
│   ├── location.routes.js             # Location routes
│   ├── offer.routes.js                # Offer routes
│   ├── payment.routes.js              # Payment routes
│   ├── profile.routes.js              # Profile routes
│   ├── push.routes.js                 # Push notification routes
│   ├── pwa.routes.js                  # PWA routes
│   ├── survey.routes.js               # Survey routes
│   ├── token.routes.js                # Token routes
│   └── waitlist.routes.js             # Waitlist routes
├── socketHandlers/
│   ├── location.socket.js             # Location socket handler
│   ├── survey.socket.js               # Survey socket handler
│   └── chat.socket.js                 # Chat socket handler
├── utils/
│   ├── eventCleanup.js                # Event cleanup utility
│   ├── errors.js                      # Error utilities
│   ├── responseHandler.js             # Response formatting
│   └── sanitizer.js                  # Input sanitization
├── dtos/
│   └── survey.dto.js                  # Survey data transfer objects
├── services/
│   └── survey.service.js              # Survey business logic
├── generate-vapid-keys.js             # VAPID key generator
├── server.js                          # Main server entry
├── package.json
└── .env.example                       # Environment variables template
```

### Key Backend Features

#### 1. Middleware Stack
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Compression**: Response compression
- **Rate Limiting**: Multiple limiters for different endpoints
- **XSS Protection**: Input sanitization
- **Activity Tracking**: User activity monitoring
- **Authentication**: JWT verification

#### 2. Socket.io Integration
- Real-time location updates
- Live survey collaboration
- Real-time messaging
- Connection status updates

#### 3. Payment Integration
- Cashfree SDK integration
- Transaction management
- Webhook handling
- Order creation and verification

---

## Database Schema

### Core Models

#### Users Model
```javascript
{
  uid: String,              // Supabase user ID
  email: String,           // User email
  password_hash: String,   // Password hash (if local auth)
  auth_provider: String,  // Authentication provider
  is_verified: Boolean,   // Email verification status
  activity_status: String, // online/offline/inactive
  last_active: Date,       // Last activity timestamp
  created_at: Date,
  updated_at: Date
}
```

#### Profile Model
```javascript
{
  user_id: ObjectId,       // Reference to Users
  first_name: String,
  last_name: String,
  profession: String,
  department: String,
  bio: String,
  looking_for: [String],   // Collaboration interests
  visibilitySettings: {
    show_name: Boolean,
    show_profession: Boolean,
    show_looking_for: Boolean,
    show_location: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

#### Connection Model
```javascript
{
  requester_id: ObjectId,  // User who sent request
  receiver_id: ObjectId,   // User who received request
  requester_intent: String,// Intent for connection
  status: String,          // pending/accepted/declined
  responded_at: Date,
  created_at: Date,
  updated_at: Date
}
```

#### Message Model
```javascript
{
  connection_id: ObjectId, // Reference to Connection
  sender_id: ObjectId,     // Message sender
  receiver_id: ObjectId,   // Message receiver
  body: String,           // Message content
  read_at: Date,           // Read timestamp
  expires_at: Date,        // Message expiration
  created_at: Date
}
```

#### Event Model
```javascript
{
  creator_id: ObjectId,    // Event creator
  title: String,
  description: String,
  location: {
    type: String,
    coordinates: [Number]
  },
  start_time: Date,
  end_time: Date,
  max_attendees: Number,
  status: String,          // active/cancelled/completed
  created_at: Date,
  updated_at: Date
}
```

#### Survey Model
```javascript
{
  creator_id: ObjectId,    // Survey creator
  title: String,
  description: String,
  questions: [{
    text: String,
    type: String,
    options: [String]
  }],
  is_public: Boolean,
  status: String,          // active/closed
  created_at: Date,
  updated_at: Date
}
```

#### PushSubscription Model
```javascript
{
  user_id: ObjectId,       // Reference to Users
  subscription: Object,   // Push subscription object
  device_type: String,     // android/ios/desktop
  user_agent: String,      // User agent string
  is_active: Boolean,      // Subscription status
  last_used: Date,         // Last used timestamp
  expires_at: Date,        // Subscription expiration
  created_at: Date,
  updated_at: Date
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh JWT token
- `GET /verify` - Verify email
- `POST /forgot-password` - Forgot password
- `POST /reset-password` - Reset password

### Profile Routes (`/api/profile`)
- `GET /` - Get current user profile
- `PUT /` - Update profile
- `GET /:email` - Get user profile by email
- `PUT /visibility` - Update visibility settings

### Connection Routes (`/api/connections`)
- `POST /request` - Send connection request
- `POST /:connectionId/accept` - Accept connection
- `POST /:connectionId/decline` - Decline connection
- `DELETE /:connectionId` - Disconnect
- `GET /sent` - Get sent requests
- `GET /received` - Get received requests
- `GET /accepted` - Get accepted connections

### Chat Routes (`/api/chat`)
- `GET /:connectionId/messages` - Get messages
- `POST /:connectionId/messages` - Send message
- `GET /conversations` - Get conversations

### Event Routes (`/api/events`)
- `POST /` - Create event
- `GET /` - Get events
- `GET /:id` - Get event details
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `POST /:id/attend` - Attend event
- `DELETE /:id/attend` - Cancel attendance

### Survey Routes (`/api/surveys`)
- `POST /` - Create survey
- `GET /` - Get surveys
- `GET /:id` - Get survey details
- `POST /:id/respond` - Respond to survey
- `GET /:id/results` - Get survey results

### Location Routes (`/api/location`)
- `POST /update` - Update user location
- `GET /nearby` - Get nearby users
- `GET /:userId` - Get user location

### Payment Routes (`/api/payment`)
- `POST /create-order` - Create payment order
- `POST /verify` - Verify payment
- `POST /webhook` - Payment webhook

### Push Notification Routes (`/api/push`)
- `GET /vapid-public-key` - Get VAPID public key
- `POST /subscribe` - Subscribe to push notifications
- `POST /unsubscribe` - Unsubscribe
- `GET /subscriptions` - Get user subscriptions

---

## Authentication Flow

### 1. Registration/Login Flow
```
User → Supabase Auth → JWT Token
                ↓
         Backend Verification
                ↓
         User Session Created
                ↓
         Sync with Backend Database
```

### 2. Protected Route Access
```
Request → JWT Verification → User Context
                ↓
         Route Access Granted/Denied
```

### 3. Token Refresh
```
Expired Token → Refresh Endpoint → New JWT
```

---

## Real-time Features

### Socket.io Events

#### Location Events
- `location:update` - User location update
- `location:nearby` - Nearby users notification

#### Survey Events
- `survey:created` - New survey created
- `survey:response` - Survey response received
- `survey:updated` - Survey updated

#### Chat Events
- `message:send` - Send message
- `message:receive` - Receive message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

---

## PWA Features

### Service Worker Capabilities
- Offline asset caching
- Background sync
- Push notification handling
- Network fallback

### Installation Flow
```
App Load → Service Worker Register → Install Prompt → PWA Install
```

---

## Push Notification System

### Architecture
```
Frontend Hook → Permission Request → Subscription Creation
                                              ↓
                                    Backend Storage
                                              ↓
                                    VAPID Keys
                                              ↓
                                    Web Push API
                                              ↓
                                    Service Worker
                                              ↓
                                    Notification Display
```

### Features
- Mobile-only (Android/iOS)
- Permission management
- Subscription lifecycle
- Device type detection
- Deep linking support
- Automatic cleanup

### Triggers
- New connection request
- Connection accepted
- New message
- Event invitation
- Survey response

---

## Payment Integration

### Cashfree Flow
```
Order Creation → Cashfree Payment → Payment Success
                        ↓
                  Webhook Verification
                        ↓
                  Transaction Record
                        ↓
                  User Credit Update
```

### Payment Types
- Token purchases
- Premium features
- Event tickets
- Offer promotions

---

## File Structure

### Root Directory
```
Forge/
├── Backend/                    # Node.js backend
├── Frontend/
│   └── FORGE/                 # React frontend
├── ARCHITECTURE.md            # This file
└── README.md                  # Project documentation
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
SUPABASE_JWT_SECRET=your_supabase_secret
ALLOWED_ORIGINS=http://localhost:5173,...
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENVIRONMENT=SANDBOX
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

---

## Security Features

### Implemented Security Measures
1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - DDoS prevention
4. **XSS Protection** - Input sanitization
5. **CSRF Protection** - Cross-site request forgery prevention
6. **JWT Authentication** - Secure token-based auth
7. **Password Hashing** - Bcrypt hashing
8. **Input Validation** - Request validation middleware
9. **SQL Injection Prevention** - Mongoose parameterized queries
10. **HTTPS Enforcement** - Production HTTPS only

---

## Deployment

### Backend Deployment
- Platform: Render / Railway / Heroku
- Database: MongoDB Atlas
- Environment Variables: Configured in platform

### Frontend Deployment
- Platform:  AWS AMPLIFY
- Build: Static site generation
- API Proxy: Configured for backend API

---

## Monitoring & Logging

### Backend Logging
- Request logging
- Error logging
- Activity tracking
- Payment transaction logs

### Frontend Monitoring
- Error boundary
- Console logging
- Performance monitoring

---

## Future Enhancements

1. **Analytics Integration** - User behavior analytics
2. **Email Notifications** - Transactional emails
3. **File Upload** - Profile pictures, documents
4. **Video Calling** - Real-time video chat
5. **Advanced Search** - Full-text search
6. **Recommendations** - AI-based recommendations
7. **Multi-language** - i18n support
8. **Dark Mode** - Theme switching
9. **Offline Mode** - Enhanced offline capabilities
10. **Admin Dashboard** - Admin panel

---

## Contributing

### Development Setup
1. Clone repository
2. Install backend dependencies: `cd Backend && npm install`
3. Install frontend dependencies: `cd Frontend/FORGE && npm install`
4. Configure environment variables
5. Start backend: `cd Backend && npm start`
6. Start frontend: `cd Frontend/FORGE && npm run dev`

### Code Standards
- ESLint for linting
- Prettier for formatting
- Git hooks for pre-commit checks

---

## License

Proprietary - All rights reserved

---

## Contact

For support and inquiries, contact the development team.
