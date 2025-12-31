import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { ThemeProvider, useTheme } from './Context/ThemeContext';
import { WeatherProvider } from './Context/WeatherContext';
import NavBar from "./Components/NavBar";
import Footer from "./Components/Footer";
import './App.css';

import DotGrid from './Components/DotGrid';

const Home = lazy(() => import('./Components/Home'));
const Dashboard = lazy(() => import('./Components/Dashboard'));
const CropRecommendation = lazy(() => import('./Components/CropRecommendation'));
const WeedDetection = lazy(() => import('./Components/WeedDetection'));
const SignIn = lazy(() => import('./Components/SignIn'));
const SignUp = lazy(() => import('./Components/SignUp'));
const Account = lazy(() => import('./Components/Account'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <BrowserRouter>
      <div className="app">
        <div className="app-background">
          <DotGrid
            dotSize={6}
            gap={20}
            /* Change baseColor to update the background dot color based on theme */
            baseColor={theme === 'dark' ? '#161616' : '#edececff'}
            /* Change activeColor to update the dot color on hover based on theme */
            activeColor={'#e017095c'}
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
        <NavBar />
        <div className="content-wrapper">
          <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/crop-recommendation" element={
                <ProtectedRoute>
                  <CropRecommendation />
                </ProtectedRoute>
              } />
              <Route path="/weed-detection" element={
                <ProtectedRoute>
                  <WeedDetection />
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WeatherProvider>
          <AppContent />
        </WeatherProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
