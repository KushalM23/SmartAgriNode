import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import './Auth.css';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';

  return (
    <div className="auth-page">
      <div className="auth-container">
        <SignedOut>
          {mode === 'sign-up' ? (
            <SignUp 
              signInUrl="/auth?mode=sign-in"
              afterSignUpUrl="/dashboard"
            />
          ) : (
            <SignIn 
              signUpUrl="/auth?mode=sign-up"
              afterSignInUrl="/dashboard"
            />
          )}
        </SignedOut>
        <SignedIn>
          <div className="auth-already-signed-in">
            <p>You are already signed in.</p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
