import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
