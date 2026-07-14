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
import SettingPage from './pages/SettingPage';
import Survey from './Components/Survey';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import GuestRoute from './components/GuestRoute';

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
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/settings" element={<SettingPage />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
