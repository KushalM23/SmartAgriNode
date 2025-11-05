import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import NavBar from "./Components/NavBar";
const Home = lazy(() => import('./Components/Home'));
const Dashboard = lazy(() => import('./Components/Dashboard'));
const CropRecommendation = lazy(() => import('./Components/CropRecommendation'));
const WeedDetection = lazy(() => import('./Components/WeedDetection'));
const AuthPage = lazy(() => import('./Components/AuthPage'));
import './App.css';

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <div className="app">
          <NavBar />
          <div className="content-wrapper">
            <Suspense fallback={<div style={{padding: 24}}>Loading…</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/*" element={<AuthPage />} />
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
              </Routes>
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </ClerkProvider>
  );
}
