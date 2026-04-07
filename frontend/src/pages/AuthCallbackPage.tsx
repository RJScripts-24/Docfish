import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthResponse } from '../lib/types';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { completeOAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const token = params.get('token');
    const user = params.get('user');

    if (error) {
      setErrorMessage(error);
      return;
    }

    if (!token || !user) {
      setErrorMessage('Google sign-in did not return a valid session.');
      return;
    }

    try {
      const session: AuthResponse = {
        token,
        user: JSON.parse(user),
      };

      completeOAuth(session);
      navigate('/dashboard', { replace: true });
    } catch (_error) {
      setErrorMessage('Failed to complete Google sign-in.');
    }
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
