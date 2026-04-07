import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

function FullScreenMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-lg max-w-md w-full">
        <div className="w-12 h-12 border-4 border-[var(--df-navy)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <FullScreenMessage message="Restoring your Docfish session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <FullScreenMessage message="Checking your session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
