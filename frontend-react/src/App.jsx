import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import NavBar from "./Components/NavBar";
import Home from "./Components/Home";
import Dashboard from "./Components/Dashboard";
import CropRecommendation from "./Components/CropRecommendation";
import WeedDetection from "./Components/WeedDetection";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import AuthTabs from "./Components/AuthTabs";
import ProtectedRoute from "./Components/ProtectedRoute";
import { api } from './lib/api';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await api.getUser();
        if (mounted && !user.error) setCurrentUser(user);
      } catch (_) {}
    })();
    return () => { mounted = false };
  }, []);

  const handleLogout = async () => {
    try { await api.logout(); } catch (_) {}
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <NavBar user={currentUser} onLogout={handleLogout} />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={
              <ProtectedRoute user={currentUser}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/crop-recommendation" element={
              <ProtectedRoute user={currentUser}>
                <CropRecommendation />
              </ProtectedRoute>
            } />
            <Route path="/weed-detection" element={
              <ProtectedRoute user={currentUser}>
                <WeedDetection />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<AuthTabs onAuthed={setCurrentUser} defaultTab="login" />} />
            <Route path="/signup" element={<AuthTabs onAuthed={setCurrentUser} defaultTab="signup" />} />
            <Route path="/auth" element={<AuthTabs onAuthed={setCurrentUser} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
