import { useState, useEffect, useCallback } from 'react';
import { gmailGetMe, gmailLogout } from '../services/gmailApi';

export interface GmailUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export function useGmailAuth() {
  const [gmailUser, setGmailUser] = useState<GmailUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(() => {
    setLoading(true);
    gmailGetMe()
      .then(setGmailUser)
      .catch(() => setGmailUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Listen for 401 events dispatched by the Axios interceptor
  useEffect(() => {
    const handler = () => setGmailUser(null);
    window.addEventListener('gmail-auth-expired', handler);
    return () => window.removeEventListener('gmail-auth-expired', handler);
  }, []);

  const login = useCallback(() => {
    window.location.href = '/gmail-api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    await gmailLogout().catch(() => {});
    setGmailUser(null);
  }, []);

  return { gmailUser, loading, login, logout, isAuthenticated: !!gmailUser };
}
