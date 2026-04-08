import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthResponse } from '../lib/types';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { completeOAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const tryCompleteOAuth = () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const token = params.get('token');
      const user = params.get('user');
      const code = params.get('code');

      if (error) {
        setErrorMessage(error);
        return true;
      }

      if (token && user) {
        try {
          const session: AuthResponse = {
            token,
            user: JSON.parse(user),
          };

          completeOAuth(session);
          navigate('/dashboard', { replace: true });
          return true;
        } catch (_error) {
          setErrorMessage('Failed to complete Google sign-in.');
          return true;
        }
      }

      // If code lands on frontend callback (misconfigured provider callback),
      // forward it to backend callback for token exchange.
      if (code) {
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
        const callbackUrl = `${apiBaseUrl}/api/v1/auth/google/callback${window.location.search}`;
        window.location.replace(callbackUrl);
        return true;
      }

      return false;
    };

    if (tryCompleteOAuth()) {
      return;
    }

    // Avoid transient false-negative flash while URL/session settles.
    const timeoutId = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      if (!tryCompleteOAuth()) {
        setErrorMessage('Google sign-in did not return a valid session.');
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [completeOAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-xl max-w-md w-full text-center">
        {errorMessage ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign-in failed</h1>
            <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-6 py-3 bg-[var(--df-navy)] text-white rounded-xl font-semibold"
            >
              Back to sign-in
            </Link>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-[var(--df-navy)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing sign-in</h1>
            <p className="text-sm text-gray-600">We’re connecting your Google account to Docfish.</p>
          </>
        )}
      </div>
    </div>
  );
}
