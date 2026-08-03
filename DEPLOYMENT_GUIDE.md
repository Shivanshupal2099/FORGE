# Deployment Configuration Guide

## Issues Found and Solutions

### Problem: Verification Payment Failing with "Payment Failed" Error

**Root Causes:**
1. Backend on Render is missing Razorpay environment variables
2. Frontend is still pointing to localhost API URL
3. Backend .env.example was missing Razorpay configuration

---

## Step-by-Step Fix Instructions

### 1. Configure Razorpay on Render (Backend)

**Go to your Render Dashboard:**
1. Navigate to your backend service on Render
2. Go to Settings → Environment Variables
3. Add the following environment variables:

```
RAZORPAY_KEY_ID=rzp_test_TKbOHrQTT7JpvT
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
```

**How to get Razorpay credentials:**
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Copy the Key ID and Key Secret (Test mode or Production mode)
4. Add them to Render environment variables

**Important:** 
- Use Test mode credentials for development/testing
- Use Production mode credentials for live deployment
- Never commit secrets to version control

---

### 2. Update Frontend Environment Variables on Amplify

**Option A: Via Amplify Console (Recommended)**
1. Go to AWS Amplify Console
2. Select your app
3. Go to App settings → Environment variables
4. Update/Add these variables:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_TKbOHrQTT7JpvT
```

**Replace `https://your-render-backend-url.onrender.com` with your actual Render backend URL.**

**Option B: Via Git (Update .env.example and commit)**
1. Update `Frontend/FORGE/.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_MAPBOX_STYLE_URI=your_mapbox_style_uri_here
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_TKbOHrQTT7JpvT
```

2. Commit and push to trigger Amplify redeploy

---

### 3. Verify Backend CORS Configuration

**Ensure your Render backend has the correct CORS settings:**

In `Backend/.env` on Render, verify:
```
ALLOWED_ORIGINS=https://main.d3g5qoxagdkgi4.amplifyapp.com
```

This allows your Amplify frontend to make requests to the Render backend.

---

### 4. Test the Configuration

**After making changes:**

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** for any CORS errors
3. **Check Render logs** for Razorpay initialization:
   - Look for: `✅ Razorpay initialized successfully`
   - If you see: `⚠️ Razorpay credentials not found`, the environment variables are not set correctly

---

## Complete Environment Variables Checklist

### Backend (Render) - Required Variables:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
ALLOWED_ORIGINS=https://main.d3g5qoxagdkgi4.amplifyapp.com
RAZORPAY_KEY_ID=rzp_test_TKbOHrQTT7JpvT
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (Amplify) - Required Variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_MAPBOX_STYLE_URI=your_mapbox_style
VITE_API_URL=https://your-backend.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_TKbOHrQTT7JpvT
```

---

## Troubleshooting

### Error: "Payment service not configured"
**Cause:** Razorpay credentials not set on Render
**Fix:** Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Render environment variables

### Error: "Network error" or CORS error
**Cause:** Frontend can't reach backend or CORS not configured
**Fix:** 
1. Update `VITE_API_URL` to your Render backend URL
2. Add your Amplify URL to `ALLOWED_ORIGINS` on Render

### Error: "Payment verification failed"
**Cause:** Razorpay signature verification failed
**Fix:** Ensure `RAZORPAY_KEY_SECRET` matches the key used to create the order

### Error: "User not found"
**Cause:** User lookup by UID is failing
**Fix:** Check that the frontend is sending the correct user identifier (uid or email)

---

## Verification Steps

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Backend Service → Logs
   - Look for: `✅ Razorpay initialized successfully`

2. **Test API Endpoint:**
   ```bash
   curl https://your-backend.onrender.com/api/payment/create-order
   ```

3. **Test Frontend:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click "Verify" button
   - Check if request goes to correct URL
   - Check response status

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to version control
- Use different keys for Test and Production environments
- Rotate secrets periodically
- Use Render's environment variable encryption
- Limit CORS origins to only your trusted domains

---

## Production Deployment Checklist

- [ ] Add Razorpay production credentials to Render
- [ ] Update frontend `VITE_API_URL` to production backend URL
- [ ] Update `ALLOWED_ORIGINS` to include production frontend URL
- [ ] Set `NODE_ENV=production` on Render
- [ ] Use production MongoDB Atlas cluster
- [ ] Enable SSL/TLS on all connections
- [ ] Set up monitoring and error tracking
- [ ] Test payment flow in test mode first
- [ ] Get Razorpay production approval before going live

---

## Contact Support

If issues persist after following this guide:
1. Check Render logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is accessible from Render
