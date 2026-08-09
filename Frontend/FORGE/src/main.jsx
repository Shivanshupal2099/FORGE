import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './contexts/SocketContext'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './Components/ErrorBoundary'
import { startHealthCheck } from './utils/healthCheck'

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Start health check to keep backend alive (for Render free tier)
// Enable in both production and development for testing
startHealthCheck(2 * 60 * 1000); // 2 minutes interval

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
