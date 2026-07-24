const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const helmet=require('helmet')
const rateLimit=require('express-rate-limit')
const authRoutes=require('./routes/auth.routes')
const profileRoutes=require('./routes/profile.routes')
const surveyRoutes=require('./routes/survey.routes')
const locationRoutes=require('./routes/location.routes')
const eventRoutes=require('./routes/event.routes')
const { ConnectDB }=require('./config/database')
const { activityMiddleware, markInactiveUsersOffline }=require('./middlewares/activity.middleware')
const errorHandler = require('./middlewares/error.middleware')




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



ConnectDB();



// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}))

// Rate limiting (disabled for development)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// })
// app.use('/api/auth', limiter)

// Stricter rate limiting for auth routes (disabled for development)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 auth requests per windowMs
//   message: 'Too many authentication attempts, please try again later.'
// })
// app.use('/api/auth/google', authLimiter)
// app.use('/api/auth/sync', authLimiter)

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

app.use('/api/auth',authRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/survey',surveyRoutes)
app.use('/api/location',locationRoutes)
app.use('/api/events',eventRoutes)                    
// Error handling middleware (must be last)            
app.use(errorHandler)




const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})

// Schedule inactivity check - run every minute
setInterval(() => {
    markInactiveUsersOffline();
}, 60 * 1000); // Every minute

