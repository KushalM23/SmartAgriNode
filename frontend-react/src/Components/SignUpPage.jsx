import { SignUp } from '@clerk/clerk-react';
import clerkAppearance from './authAppearance';
export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 py-8 sm:px-6 sm:py-0">
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
