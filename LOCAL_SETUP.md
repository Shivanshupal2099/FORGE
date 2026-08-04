# Local Development Setup Guide

This guide will help you set up ForgeConnect to run locally on your machine.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)
- Supabase account (for authentication)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Shivanshupal2099/FORGE.git
cd Forge
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd Backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment File
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2.4 Configure Backend Environment Variables

Edit `.env` file with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your-cluster.mongodb.net/forge?retryWrites=true&w=majority
# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/forge

# Authentication
JWT_SECRET=generate_a_strong_random_secret_here
# Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
# Get this from Supabase Dashboard > Project Settings > API > JWT Secret

# CORS Configuration (Important for Local Development)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### 2.5 Start Backend Server
```bash
npm start
```

Backend will run on `http://localhost:5000`

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory
```bash
cd ../Frontend/FORGE
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Create Environment File
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3.4 Configure Frontend Environment Variables

Edit `.env` file with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# Backend API URL (Local Development)
VITE_API_URL=http://localhost:5000

# Mapbox Configuration (Optional - for map features)
VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
VITE_MAPBOX_STYLE_URI=mapbox://styles/your-style-url
```

### 3.5 Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 4: Database Setup

### Option A: Use MongoDB Atlas (Recommended)

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from Atlas
6. Update `MONGODB_URI` in Backend `.env`

### Option B: Use Local MongoDB

1. Install MongoDB locally:
   - Windows: Download from mongodb.com
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

3. Update `MONGODB_URI` in Backend `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/forge
   ```

## Step 5: Supabase Setup

1. Create a free Supabase account
2. Create a new project
3. Get your project URL and anon key from Dashboard > Settings > API
4. Get JWT secret from Dashboard > Settings > API
5. Update environment variables in both frontend and backend `.env` files

## Step 6: Verify Setup

1. Open browser to `http://localhost:5173`
2. You should see the ForgeConnect landing page
3. Try signing in with Google (Supabase authentication)
4. Check browser console for any errors
5. Check backend terminal for API logs

## Common Issues & Solutions

### CORS Errors
- Make sure `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:5173`
- Restart backend server after changing `.env`

### Database Connection Errors
- Verify MongoDB connection string is correct
- Check if MongoDB Atlas IP whitelist includes your IP
- For local MongoDB, ensure MongoDB service is running

### Authentication Errors
- Verify Supabase URL and keys are correct
- Ensure JWT secret matches between Supabase and backend
- Check that tokens are being stored in localStorage

### Port Already in Use
- If port 5000 is busy, change `PORT` in backend `.env`
- If port 5173 is busy, Vite will automatically use next available port

## Development Workflow

### Running Both Servers Simultaneously

**Terminal 1 (Backend):**
```bash
cd Backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd Frontend/FORGE
npm run dev
```

### Hot Reload
- Frontend: Vite automatically reloads on file changes
- Backend: Use `nodemon` for auto-restart (install with `npm install -D nodemon`)

### Debugging
- Frontend: Use browser DevTools (F12)
- Backend: Console logs appear in terminal
- Database: Use MongoDB Compass for GUI access

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | JWT signing secret | random_hex_string |
| SUPABASE_JWT_SECRET | Supabase JWT secret | from_supabase_dashboard |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:5173 |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase anon key | eyJhbGciOiJIUzI1NiIsInR5cCI6... |
| VITE_API_URL | Backend API URL | http://localhost:5000 |
| VITE_MAPBOX_TOKEN | Mapbox access token | pk.xxx |
| VITE_MAPBOX_STYLE_URI | Mapbox style URL | mapbox://styles/xxx |

## Production vs Local Differences

| Feature | Local | Production |
|---------|-------|------------|
| Frontend URL | http://localhost:5173 | https://www.forgeconnect.site |
| Backend URL | http://localhost:5000 | Render URL |
| Database | Same Atlas or local | MongoDB Atlas |
| Environment | development | production |
| CORS | Localhost only | forgeconnect.site domain |

## Next Steps

After successful local setup:
1. Test all features (authentication, connections, chat, surveys, events)
2. Make code changes
3. Test changes locally
4. Commit and push to GitHub
5. Deploy to production (Amplify/Render)

## Need Help?

- Check existing issues on GitHub
- Review backend logs for API errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly
