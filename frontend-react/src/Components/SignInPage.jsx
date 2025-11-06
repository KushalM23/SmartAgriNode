import { SignIn } from '@clerk/clerk-react';
import clerkAppearance from './authAppearance';
import './AuthPages.css';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </div>
  );
}
