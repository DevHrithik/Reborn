'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AdminUser } from '@/lib/auth';
import { ROUTES } from '@/utils/constants';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        const validatedUser = await authService.validateSession(sessionToken);
        if (validatedUser) {
          setUser(validatedUser);
          // Set cookie for middleware
          document.cookie = `admin_session_token=${sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
        } else {
          // Invalid session, clear storage
          localStorage.removeItem('admin_session_token');
          localStorage.removeItem('admin_user');
          document.cookie =
            'admin_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
      }
    } catch (error) {
      console.error('Session validation error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    try {
      const result = await authService.signIn(email, password);
      if (result) {
        setUser(result.user);
        localStorage.setItem('admin_session_token', result.session_token);
        localStorage.setItem('admin_user', JSON.stringify(result.user));
        // Set cookie for middleware
        document.cookie = `admin_session_token=${result.session_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  }

  async function signOut() {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        await authService.signOut(sessionToken);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_user');
      document.cookie =
        'admin_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.push('/auth/login');
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
