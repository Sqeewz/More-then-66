'use client';

import { useState, useEffect } from 'react';
import { ADMIN_PASS_HASH } from '@/components/AdminLoginModal';
import { ADMIN_SESSION_KEY, ADMIN_PASS_PLAINTEXT } from '@/lib/constants';

// ---------------------------------------------------------------------------
// useAdminAuth — Custom Hook (Single Responsibility Principle)
//
// Encapsulates ALL admin-authentication state and logic so that page
// components never need to duplicate session-storage reads, hash comparisons
// or logout routines.  Any component that needs admin capabilities simply
// calls this hook.
// ---------------------------------------------------------------------------

interface UseAdminAuthResult {
  isAdmin: boolean;
  adminPass: string;
  handleAdminSuccess: (hashOrPass: string) => void;
  handleAdminLogout: () => void;
}

export function useAdminAuth(): UseAdminAuthResult {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  // Restore admin session from sessionStorage on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (storedAuth && (storedAuth === ADMIN_PASS_HASH || storedAuth === ADMIN_PASS_PLAINTEXT)) {
      setIsAdmin(true);
      setAdminPass(storedAuth);
    }
  }, []);

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
