import { SignedIn, SignedOut, SignIn, SignUp } from '../lib/clerk';
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
              routing="path" 
              path="/auth"
              signInUrl="/auth?mode=sign-in"
              afterSignUpUrl="/dashboard"
              redirectUrl="/dashboard"
            />
          ) : (
            <SignIn 
              routing="path" 
              path="/auth"
              signUpUrl="/auth?mode=sign-up"
              afterSignInUrl="/dashboard"
              redirectUrl="/dashboard"
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
