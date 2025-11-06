import { SignUp } from '@clerk/clerk-react';
import clerkAppearance from './authAppearance';
import './AuthPages.css';

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </div>
  );
}
