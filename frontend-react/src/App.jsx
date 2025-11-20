import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import NavBar from "./Components/NavBar";
const Home = lazy(() => import('./Components/Home'));
const Dashboard = lazy(() => import('./Components/Dashboard'));
const CropRecommendation = lazy(() => import('./Components/CropRecommendation'));
const WeedDetection = lazy(() => import('./Components/WeedDetection'));
const SignInPage = lazy(() => import('./Components/SignInPage'));
const SignUpPage = lazy(() => import('./Components/SignUpPage'));


import DotGrid from './Components/DotGrid';

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file');
}

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn signInUrl="/sign-in" />
      </SignedOut>
    </>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f5] relative p-6">
        <h1 className="text-[#333] mb-8">Authentication not configured</h1>
        <p>Please set the VITE_CLERK_PUBLISHABLE_KEY environment variable to enable Clerk.</p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#f5f5f5] relative">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <DotGrid
              dotSize={6}
              gap={20}
              baseColor="#edececff"
              activeColor="#ff2727"
              proximity={120}
              shockRadius={250}
              shockStrength={5}
              resistance={750}
              returnDuration={1.5}
            />
          </div>
          <div className="relative z-10">
            <NavBar />
          </div>
          <div className="relative z-10 flex-1 mt-5 p-8 max-w-[1200px] w-full mx-auto">
            <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
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
