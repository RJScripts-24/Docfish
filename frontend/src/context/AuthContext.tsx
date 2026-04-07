import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createGuestSession, getCurrentUser, logoutSession } from '../lib/api';
import { clearStoredSession, readStoredSession, storeSession } from '../lib/session';
import { AuthResponse, AuthUser } from '../lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  loginAsGuest: () => Promise<void>;
  completeOAuth: (session: AuthResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(() => readStoredSession());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      if (!session?.token) {
        if (isActive) {
          setIsReady(true);
        }
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!isActive) {
          return;
        }

        const nextSession = {
          token: session.token,
          user,
        };

        setSession(nextSession);
        storeSession(nextSession);
      } catch (_error) {
        if (!isActive) {
          return;
        }

        clearStoredSession();
        setSession(null);
      } finally {
        if (isActive) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token),
      isReady,
      async loginAsGuest() {
        const nextSession = await createGuestSession();
        setSession(nextSession);
        storeSession(nextSession);
      },
      completeOAuth(nextSession) {
        setSession(nextSession);
        storeSession(nextSession);
      },
      async logout() {
        try {
          if (session?.token) {
            await logoutSession();
          }
        } catch (_error) {
          // Best effort logout; local session still gets cleared.
        } finally {
          clearStoredSession();
          setSession(null);
        }
      },
    }),
    [isReady, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
