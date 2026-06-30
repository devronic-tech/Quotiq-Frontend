// ============================================================
// Auth Provider — Context for authentication state
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProfile, AuthTokens } from '@/shared';
import type { RegisterInput, LoginInput } from '@/shared';
import { loginApi, registerApi, logoutApi, getProfileApi } from '@/features/auth/api/auth.api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = localStorage.getItem('qt_user');
        const tokens = localStorage.getItem('qt_tokens');
        if (stored && tokens) {
          setUser(JSON.parse(stored) as UserProfile);
          // Verify token is still valid by fetching fresh profile
          const freshProfile = await getProfileApi();
          setUser(freshProfile);
          localStorage.setItem('qt_user', JSON.stringify(freshProfile));
        }
      } catch {
        localStorage.removeItem('qt_user');
        localStorage.removeItem('qt_tokens');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginApi(input);
    setUser(result.user);
    localStorage.setItem('qt_user', JSON.stringify(result.user));
    localStorage.setItem('qt_tokens', JSON.stringify(result.tokens));
    toast.success(`Welcome back, ${result.user.firstName}!`);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await registerApi(input);
    setUser(result.user);
    localStorage.setItem('qt_user', JSON.stringify(result.user));
    localStorage.setItem('qt_tokens', JSON.stringify(result.tokens));
    toast.success('Organization created! Welcome to QuotaFlow.');
  }, []);

  const logout = useCallback(async () => {
    try {
      const tokens = localStorage.getItem('qt_tokens');
      if (tokens) {
        const { refreshToken } = JSON.parse(tokens) as AuthTokens;
        await logoutApi(refreshToken);
      }
    } catch {
      // Silent — logout is best-effort
    } finally {
      setUser(null);
      localStorage.removeItem('qt_user');
      localStorage.removeItem('qt_tokens');
      toast.success('Logged out');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
