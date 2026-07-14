# Progressive Web App (PWA) Setup Guide

Forge has been converted to a Progressive Web App (PWA) to provide native app-like experiences on mobile devices.

## 🔧 QUICK FIX: Install Prompt Not Showing

The install prompt requires PNG icons. Follow these steps:

### Method 1: Use the Built-in Icon Generator (EASIEST)
1. Open your browser and go to: `http://localhost:5173/generate-icons.html` (or your dev server URL + `/generate-icons.html`)
2. Click "Generate Icons" button
3. Wait for all 8 icons to be generated
4. Click "Download All Icons"
5. Place the downloaded PNG files in: `public/icons/` directory
6. Refresh your browser (Ctrl+Shift+R)
7. The install prompt should now appear in the URL bar!

### Method 2: Use Online Tool
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your `public/favicon.svg`
3. Download the generated icons
4. Place them in `public/icons/` directory
5. Refresh browser

### Required Icons
The manifest now requires only 2 icons (minimum for installability):
- `icon-192x192.png`
- `icon-512x512.png`

## What's Been Implemented

### 1. Web App Manifest (`public/manifest.json`)
- App name and description
- Theme colors (yellow theme matching Forge branding)
- Display mode (standalone)
- Icon definitions for PWA installability
- Categories for app store discovery

### 2. Service Worker (`public/sw.js`)
- Offline caching strategy
- Network fallback for failed requests
- Cache management and cleanup
- Background sync support
- Push notification support
- Notification click handling

### 3. HTML Meta Tags (`index.html`)
- PWA manifest link
- Apple mobile web app support
- Theme color for browser UI
- Viewport optimization for mobile
- Description for SEO

### 4. Service Worker Registration (`src/main.jsx`)
- Automatic service worker registration on app load
- Error handling for registration failures
- Console logging for debugging

## Testing the PWA

### 1. Check Installability
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Click "Manifest" in left sidebar
4. Verify manifest loads correctly
5. Check that icons are displayed
6. Look for "Add to home screen" link

### 2. Verify Service Worker
1. In DevTools Application tab
2. Click "Service Workers" in left sidebar
3. Verify service worker is "active" and "running"
4. Check console for any errors

### 3. Test Install Prompt
1. Refresh the page
2. Look for install icon in URL bar (Chrome/Edge)
3. Or check for "Add to Home Screen" in menu (mobile)

### 4. Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run Progressive Web App audit
4. Address any issues found

## Troubleshooting

### Install Prompt Not Showing
**Most common cause: Missing icons**
- Use the icon generator at `/generate-icons.html`
- Ensure icons are in `public/icons/` directory
- Refresh browser after adding icons
- Check DevTools Console for errors

**Other causes:**
- Service worker not registered (check DevTools)
- Manifest not loading (check Application tab)
- Not served over HTTPS (required except localhost)
- Browser doesn't support PWA (use Chrome/Edge/Safari)

### Service Worker Issues
- Check browser console for errors
- Ensure service worker file is served from root
- Try unregistering and re-registering in DevTools
- Clear browser cache and refresh

### Icons Not Displaying
- Verify files exist in `public/icons/`
- Check file names match exactly: `icon-192x192.png`, `icon-512x512.png`
- Ensure files are PNG format
- Check file paths in manifest.json

### Cache Issues
- Clear browser cache
- Unregister service worker in DevTools
- Update CACHE_NAME in sw.js to force cache refresh

## PWA Features

### Offline Functionality
- Core assets are cached for offline access
- Network requests fall back to cache when offline
- Service worker handles background sync

### Installability
- Add to Home Screen on iOS
- Install on Desktop (Chrome/Edge)
- Install on Android
- Standalone app mode

### Push Notifications
- Service worker supports push notifications
- Notifications open the app when clicked
- Vibration feedback on supported devices

## Next Steps

1. ✅ **Generate icons using `/generate-icons.html`** - REQUIRED for install prompt
2. **Test installability** - Check that install prompt appears
3. **Test on mobile devices** - Verify installability and offline mode
4. **Run Lighthouse audit** - Ensure PWA best practices
5. **Deploy to production** - Use HTTPS-enabled hosting

## Additional Resources

- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Builder](https://www.pwabuilder.com/)
