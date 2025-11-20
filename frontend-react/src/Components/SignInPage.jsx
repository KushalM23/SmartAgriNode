import { SignIn } from '@clerk/clerk-react';
import clerkAppearance from './authAppearance';
export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 py-8 sm:px-6 sm:py-0">
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
