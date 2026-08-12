'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ADMIN_PASS_HASH } from '@/components/AdminLoginModal';
import { ADMIN_SESSION_KEY, ADMIN_PASS_PLAINTEXT } from '@/lib/constants';

const PRIMARY_ADMIN_EMAIL = 'kanakrit.pr@rmuti.ac.th';

interface UseAdminAuthResult {
  isAdmin: boolean;
  adminPass: string;
  handleAdminSuccess: (hashOrPass: string) => void;
  handleAdminLogout: () => void;
}

export function useAdminAuth(): UseAdminAuthResult {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    // 1. Automatic Admin grant for primary admin email via Google OAuth
    if (session?.user?.email && session.user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL) {
      setIsAdmin(true);
      setAdminPass('67morethen66');
      return;
    }

    // 2. Restore password-based admin session from sessionStorage
    const storedAuth = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (storedAuth && (storedAuth === ADMIN_PASS_HASH || storedAuth === ADMIN_PASS_PLAINTEXT)) {
      setIsAdmin(true);
      setAdminPass(storedAuth);
    }
  }, [session]);

  const handleAdminSuccess = (hashOrPass: string) => {
    setIsAdmin(true);
    setAdminPass(hashOrPass);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    setAdminPass('');
  };

  return { isAdmin, adminPass, handleAdminSuccess, handleAdminLogout };
}
