import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import UserEventsPage from './pages/UserEventsPage';
import SettingPage from './pages/SettingPage';
import Survey from './Components/Survey';
import SurveyResultsPage from './pages/SurveyResultsPage';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import GuestRoute from './Components/GuestRoute';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('forge-theme') || 'sunset';
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
<Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/account" element={<GuestRoute><AccountPage /></GuestRoute>} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="/profile/events" element={<ProtectedRoute><UserEventsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingPage /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
            <Route path="/survey/:surveyId/results" element={<ProtectedRoute><SurveyResultsPage /></ProtectedRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
