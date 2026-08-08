const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const helmet=require('helmet')
const compression=require('compression')
const http=require('http')
const { Server }=require('socket.io')
const authRoutes=require('./routes/auth.routes')
const profileRoutes=require('./routes/profile.routes')
const surveyRoutes=require('./routes/survey.routes')
const locationRoutes=require('./routes/location.routes')
const eventRoutes=require('./routes/event.routes')
const connectionRoutes=require('./routes/connection.routes')
const chatRoutes=require('./routes/chat.routes')
const tokenRoutes=require('./routes/token.routes')
const offerRoutes=require('./routes/offer.routes')
const waitlistRoutes=require('./routes/waitlist.routes')
const paymentRoutes=require('./routes/payment.routes')
const issueRoutes=require('./routes/issue.routes')
const communityRoutes=require('./routes/community.routes')
const pwaRoutes=require('./routes/pwa.routes')
const pushRoutes=require('./routes/push.routes')
const { ConnectDB }=require('./config/database')
const { activityMiddleware, markInactiveUsersOffline }=require('./middlewares/activity.middleware')
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware')
const { generalLimiter, authLimiter, surveyCreationLimiter, surveyResponseLimiter } = require('./middlewares/rateLimiter.middleware')
const xssProtection = require('./middlewares/xss.middleware')
const SurveySocketHandler = require('./socketHandlers/survey.socket')
const LocationSocketHandler = require('./socketHandlers/location.socket')
const { deleteExpiredEvents } = require('./utils/eventCleanup')




const path = require('path');
const fs = require('fs');

// Load .env file with encoding fallback
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Manual fallback for .env file only in development (handles encoding issues)
// In production, environment variables are set by the platform (Render, etc.)
if (process.env.NODE_ENV !== 'production' && !process.env.MONGODB_URI) {
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    // Handle UTF-16 LE encoding with BOM
    if (envContent.charCodeAt(0) === 0xFEFF || envContent.charCodeAt(0) === 0xFFFE || envContent.includes('��')) {
      envContent = fs.readFileSync(envPath, 'utf16le');
    }
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  } catch (err) {
    console.error('Error reading .env file:', err.message);
  }
}

// Debug: Check if Cashfree credentials are loaded
console.log('Environment check:');
console.log('CASHFREE_APP_ID:', process.env.CASHFREE_APP_ID ? 'Found' : 'Not found');
console.log('CASHFREE_SECRET_KEY:', process.env.CASHFREE_SECRET_KEY ? 'Found' : 'Not found');

// Initialize Cashfree after environment variables are loaded
const getCashfreeInstance = require('./config/cashfree');
getCashfreeInstance();



// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false, // Disable CSP for development
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
}))

// Health check endpoint for Render (must be before rate limiting and other middleware)
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Apply general rate limiting
app.use('/api', generalLimiter)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://www.forgeconnect.site']

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Enable compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({extended: true, limit: '1mb'}))

// XSS Protection Middleware
app.use(xssProtection)

// MongoDB injection protection (custom middleware)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;

    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.params);

  next();
});


// Apply activity tracking middleware to all routes
app.use(activityMiddleware)

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter)

app.use('/api/auth',authRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/survey',surveyRoutes)
app.use('/api/location',locationRoutes)
app.use('/api/events',eventRoutes)
app.use('/api/connections',connectionRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/tokens',tokenRoutes)
app.use('/api/offers',offerRoutes)
app.use('/api/waitlist',waitlistRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/issues',issueRoutes)
app.use('/api/communities',communityRoutes)
app.use('/api/pwa',pwaRoutes)
app.use('/api/push',pushRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Forge API is running 🚀',
    health: '/healthz'
  });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Connect to database before starting server
ConnectDB().then(async () => {
  console.log('Database connection established, starting server...');
  
  // Fix MongoDB indexes for Transaction model
  try {
    const Transaction = require('./models/Transaction.model');
    const indexes = await Transaction.collection.getIndexes();
    console.log('Current Transaction indexes:', Object.keys(indexes));
    
    // Check if old non-sparse index exists
    if (indexes.cashfree_payment_id_1 && !indexes.cashfree_payment_id_1.sparse) {
      console.log('Found old non-sparse index on cashfree_payment_id, dropping...');
      await Transaction.collection.dropIndex('cashfree_payment_id_1');
      console.log('Old index dropped successfully');
    }
    
    if (indexes.cashfree_order_id_1 && !indexes.cashfree_order_id_1.sparse) {
      console.log('Found old non-sparse index on cashfree_order_id, dropping...');
      await Transaction.collection.dropIndex('cashfree_order_id_1');
      console.log('Old index dropped successfully');
    }
    
    // Ensure indexes are created with sparse option
    await Transaction.syncIndexes();
    console.log('Transaction indexes synchronized successfully');
  } catch (indexError) {
    console.error('Error fixing Transaction indexes:', indexError);
  }
  
  // Only start server after database is connected
  const PORT = process.env.PORT || 5000

  // Create HTTP server
  const server = http.createServer(app)

  // Configure Socket.io
  const io = new Server(server, {
      cors: {
          origin: process.env.ALLOWED_ORIGINS
              ? process.env.ALLOWED_ORIGINS.split(',')
              : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://www.forgeconnect.site'],
          credentials: true
      },
      pingTimeout: 60000, // Increased from default to handle slow connections
      pingInterval: 25000, // Increased from default
      upgradeTimeout: 30000, // Increased upgrade timeout
      maxHttpBufferSize: 1e6, // 1MB max buffer size
      transports: ['websocket', 'polling'], // Explicitly specify transports
      allowUpgrades: true, // Allow transport upgrades
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // Initial reconnection delay
      reconnectionDelayMax: 5000, // Maximum reconnection delay
  })

  // Store online users and their socket IDs
  const onlineUsers = new Map()

  // Initialize Survey Socket Handler
  const surveySocketHandler = new SurveySocketHandler(io)

  // Initialize Location Socket Handler
  const locationSocketHandler = new LocationSocketHandler(io)

  // Socket.io connection handling
  io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Handle connection errors
      socket.on('error', (error) => {
          console.error('Socket error:', error)
      })

      // User joins with their user ID
      socket.on('user:join', (userId) => {
          try {
              onlineUsers.set(userId, socket.id)
              socket.userId = userId
              console.log(`User ${userId} joined with socket ${socket.id}`)
              
              // Broadcast to all users that this user is online
              io.emit('user:online', { userId, socketId: socket.id })
          } catch (error) {
              console.error('Error in user:join:', error)
          }
      })

      // Join a specific connection room for private messaging
      socket.on('join:connection', (connectionId) => {
          try {
              socket.join(`connection:${connectionId}`)
              console.log(`Socket ${socket.id} joined connection ${connectionId}`)
          } catch (error) {
              console.error('Error in join:connection:', error)
          }
      })

      // Leave a connection room
      socket.on('leave:connection', (connectionId) => {
          try {
              socket.leave(`connection:${connectionId}`)
              console.log(`Socket ${socket.id} left connection ${connectionId}`)
          } catch (error) {
              console.error('Error in leave:connection:', error)
          }
      })

      // Handle new message
      socket.on('message:send', (data) => {
          try {
              const { connectionId, message } = data
              // Broadcast to all users in the connection room
              io.to(`connection:${connectionId}`).emit('message:receive', message)
              console.log(`Message sent to connection ${connectionId}`)
          } catch (error) {
              console.error('Error in message:send:', error)
          }
      })

      // Handle disconnection
      socket.on('disconnect', (reason) => {
          try {
              if (socket.userId) {
                  onlineUsers.delete(socket.userId)
                  console.log(`User ${socket.userId} disconnected, reason: ${reason}`)
                  // Broadcast that this user is offline
                  io.emit('user:offline', { userId: socket.userId })
              }
          } catch (error) {
              console.error('Error in disconnect:', error)
          }
      })
  })

  // Make io accessible to routes for emitting survey events
  app.set('io', io)
  
  // Make survey socket handler accessible to controllers
  app.set('surveySocketHandler', surveySocketHandler)

  // Make location socket handler accessible to controllers
  app.set('locationSocketHandler', locationSocketHandler)

  server.listen(PORT,()=>{
      console.log(`Server is running on port ${PORT}`)
  })

  // Schedule inactivity check - run every minute
  setInterval(() => {
      markInactiveUsersOffline();
  }, 60 * 1000); // Every minute

  // Schedule expired event cleanup - run daily
  setInterval(() => {
      deleteExpiredEvents();
  }, 24 * 60 * 60 * 1000); // Every 24 hours

  // Run event cleanup immediately on server start
  deleteExpiredEvents();

}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

