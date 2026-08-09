import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import GuestRoute from './Components/GuestRoute';
import ProtectedRoute from './Components/ProtectedRoute';
import { AlertProvider } from './contexts/AlertContext';
import PWAInstallPrompt from './Components/PWAInstallPrompt';
import PWADownloadButton from './Components/PWADownloadButton';

// Lazy load route components for better performance
const Landing = lazy(() => import("./pages/Landing"));
const VisitorPage = lazy(() => import("./pages/VisitorPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const UserEventsPage = lazy(() => import('./pages/UserEventsPage'));
const SettingPage = lazy(() => import('./pages/SettingPage'));            
const Survey = lazy(() => import('./Components/Survey'));
const SurveyResultsPage = lazy(() => import('./pages/SurveyResultsPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const PublicSurveyPage = lazy(() => import('./pages/PublicSurveyPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NearbyPage = lazy(() => import('./pages/NearbyPage'));

// Loading component for Suspense fallback with quotes
const PageLoader = () => {
  const quotes = [
    { text: "Connecting minds, building futures", emoji: "🌟" },
    { text: "Your network is your net worth", emoji: "💼" },
    { text: "Collaboration breeds innovation", emoji: "🚀" },
    { text: "Together we achieve more", emoji: "🤝" },
    { text: "Every connection matters", emoji: "✨" },
    { text: "Building bridges, not walls", emoji: "🌉" },
    { text: "Your next opportunity awaits", emoji: "🎯" },
    { text: "Success starts with a connection", emoji: "💡" },
  ];
  
  const [currentQuote, setCurrentQuote] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        animation: 'bounce 2s infinite',
      }}>
        {quotes[currentQuote].emoji}
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: '16px',
        maxWidth: '500px',
        lineHeight: '1.4',
      }}>
        {quotes[currentQuote].text}
      </h2>
      <p style={{
        fontSize: '18px',
        color: '#666',
        marginBottom: '20px',
        fontWeight: '500',
      }}>
        Waking up the server... This won't take long! ⚡
      </p>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

function App() {
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;
      const body = document.body;
      const savedAccent = localStorage.getItem('forge-accent') || '#FFD700';
      
      // Apply accent color
      root.style.setProperty('--app-accent-bg', savedAccent);
      
      // Apply theme
      if (theme === 'dark') {
        body.style.setProperty('--app-background', '#0a0a0f');
        body.style.setProperty('--app-surface', '#1a1a2e');
        body.style.setProperty('--app-surface-strong', '#252542');
        body.style.setProperty('--app-text', '#ffffff');
        body.style.setProperty('--app-text-secondary', '#b8b8d0');
        body.style.setProperty('--app-border', '#3a3a5c');
        body.style.setProperty('--app-card-bg', '#1a1a2e');
        body.style.setProperty('--app-card-border', '#3a3a5c');
        body.style.setProperty('--app-input-bg', '#1a1a2e');
        body.style.setProperty('--app-input-border', '#3a3a5c');
        body.style.setProperty('--app-button-bg', savedAccent);
        body.style.setProperty('--app-button-text', '#ffffff');
        body.style.setProperty('--app-soft-shadow', '0 8px 32px rgba(0, 0, 0, 0.4)');
        body.style.setProperty('--app-soft-shadow-lg', '0 16px 48px rgba(0, 0, 0, 0.5)');
      } else {
        body.style.setProperty('--app-background', '#FFFDF0');
        body.style.setProperty('--app-surface', '#FFFFFF');
        body.style.setProperty('--app-surface-strong', '#F5F5F0');
        body.style.setProperty('--app-text', '#111111');
        body.style.setProperty('--app-text-secondary', '#666666');
        body.style.setProperty('--app-border', '#E0E0D8');
        body.style.setProperty('--app-card-bg', '#FFFFFF');
        body.style.setProperty('--app-card-border', '#E0E0D8');
        body.style.setProperty('--app-input-bg', '#FFFFFF');
        body.style.setProperty('--app-input-border', '#E0E0D8');
        body.style.setProperty('--app-button-bg', '#FFD700');
        body.style.setProperty('--app-button-text', '#000000');
        body.style.setProperty('--app-soft-shadow', '0 8px 32px rgba(17, 17, 17, 0.08)');
        body.style.setProperty('--app-soft-shadow-lg', '0 16px 48px rgba(17, 17, 17, 0.12)');
      }
      
      root.dataset.theme = theme;
    };

    const savedTheme = localStorage.getItem('forge-theme') || 'light';
    applyTheme(savedTheme);
  }, []);

  return (
    <AlertProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/visitor" element={<VisitorPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/account" element={<GuestRoute><AccountPage /></GuestRoute>} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />   
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute><NearbyPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/:email" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><UserEventsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingPage /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
            <Route path="/survey/:surveyId/results" element={<ProtectedRoute><SurveyResultsPage /></ProtectedRoute>} />
            <Route path="/survey/view/:surveyId" element={<PublicSurveyPage />} />
            <Route path="/event/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Suspense>
        <PWAInstallPrompt />
        <PWADownloadButton />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
