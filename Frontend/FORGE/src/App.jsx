import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import GuestRoute from './Components/GuestRoute';
import ProtectedRoute from './Components/ProtectedRoute';
import { AlertProvider } from './contexts/AlertContext';
import PWAInstallPrompt from './Components/PWAInstallPrompt';
import PWADownloadButton from './Components/PWADownloadButton';
import PushPermissionPrompt from './Components/PushPermissionPrompt';

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

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      
      width: '40px',
      height: '40px',
      border: '4px solid #3182ce',
      borderTop: '4px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('forge-theme') || 'light';
    document.documentElement.dataset.theme = savedTheme;
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
        <PushPermissionPrompt />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
