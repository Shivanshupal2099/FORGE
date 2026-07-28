const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const helmet=require('helmet')
const http=require('http')
const { Server }=require('socket.io')
const authRoutes=require('./routes/auth.routes')
const profileRoutes=require('./routes/profile.routes')
const surveyRoutes=require('./routes/survey.routes')
const locationRoutes=require('./routes/location.routes')
const eventRoutes=require('./routes/event.routes')
const connectionRoutes=require('./routes/connection.routes')
const chatRoutes=require('./routes/chat.routes')
const { ConnectDB }=require('./config/database')
const { activityMiddleware, markInactiveUsersOffline }=require('./middlewares/activity.middleware')
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware')
const { generalLimiter, authLimiter, surveyCreationLimiter, surveyResponseLimiter } = require('./middlewares/rateLimiter.middleware')
const SurveySocketHandler = require('./socketHandlers/survey.socket')




const path = require('path');
const fs = require('fs');

// Load .env file with encoding fallback
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Manual fallback if dotenv doesn't load variables (handles encoding issues)
if (!process.env.MONGODB_URI) {
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



// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}))

// Apply general rate limiting
app.use('/api', generalLimiter)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({extended: true, limit: '10mb'}))

// Apply activity tracking middleware to all routes
app.use(activityMiddleware)

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter)

// Apply rate limiting to survey creation
app.use('/api/survey/create', surveyCreationLimiter)

// Apply rate limiting to survey responses
app.use('/api/survey/:surveyId/responses', surveyResponseLimiter)

app.use('/api/auth',authRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/survey',surveyRoutes)
app.use('/api/location',locationRoutes)
app.use('/api/events',eventRoutes)
app.use('/api/connections',connectionRoutes)
app.use('/api/chat',chatRoutes)

// 404 handler (must be before error handler)
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Connect to database before starting server
ConnectDB().then(() => {
  console.log('Database connection established, starting server...');
  
  // Only start server after database is connected
  const PORT = process.env.PORT || 5000

  // Create HTTP server
  const server = http.createServer(app)

  // Configure Socket.io
  const io = new Server(server, {
      cors: {
          origin: process.env.ALLOWED_ORIGINS 
              ? process.env.ALLOWED_ORIGINS.split(',') 
              : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
          credentials: true
      }
  })

  // Initialize Survey Socket Handler
  const surveySocketHandler = new SurveySocketHandler(io)

  // Store online users and their socket IDs
  const onlineUsers = new Map()

  // Socket.io connection handling
  io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // User joins with their user ID
      socket.on('user:join', (userId) => {
          onlineUsers.set(userId, socket.id)
          socket.userId = userId
          console.log(`User ${userId} joined with socket ${socket.id}`)
          
          // Broadcast to all users that this user is online
          io.emit('user:online', { userId, socketId: socket.id })
      })

      // Join a specific connection room for private messaging
      socket.on('join:connection', (connectionId) => {
          socket.join(`connection:${connectionId}`)
          console.log(`Socket ${socket.id} joined connection ${connectionId}`)
      })

      // Leave a connection room
      socket.on('leave:connection', (connectionId) => {
          socket.leave(`connection:${connectionId}`)
          console.log(`Socket ${socket.id} left connection ${connectionId}`)
      })

      // Handle new message
      socket.on('message:send', (data) => {
          const { connectionId, message } = data
          // Broadcast to all users in the connection room
          io.to(`connection:${connectionId}`).emit('message:receive', message)
          console.log(`Message sent to connection ${connectionId}`)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
          if (socket.userId) {
              onlineUsers.delete(socket.userId)
              console.log(`User ${socket.userId} disconnected`)
              // Broadcast that this user is offline
              io.emit('user:offline', { userId: socket.userId })
          }
      })
  })

  // Make io accessible to routes for emitting survey events
  app.set('io', io)
  
  // Make survey socket handler accessible to controllers
  app.set('surveySocketHandler', surveySocketHandler)

  server.listen(PORT,()=>{
      console.log(`Server is running on port ${PORT}`)
  })

  // Schedule inactivity check - run every minute
  setInterval(() => {
      markInactiveUsersOffline();
  }, 60 * 1000); // Every minute

}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

