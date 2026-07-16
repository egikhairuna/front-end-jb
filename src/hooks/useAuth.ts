/**
 * Client-side auth hook.
 * Checks logged-in state by calling GET /api/auth/me.
 * Used by Navbar and other client components to determine auth state.
 *
 * 🔒 SECURITY: Never exposes the JWT — only reads the safe AuthUser object.
 */

'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

// Global Zustand store for sharing auth state across components
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

// Track background fetch to prevent overlapping concurrent requests
let currentFetchPromise: Promise<void> | null = null;

export function useAuth(): UseAuthReturn {
  const { user, isLoading, setUser, setIsLoading } = useAuthStore();

  const fetchUser = useCallback(async () => {
    if (currentFetchPromise) {
      return currentFetchPromise;
    }

    currentFetchPromise = (async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin', // Include cookies
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
        currentFetchPromise = null;
      }
    })();

    return currentFetchPromise;
  }, [setUser, setIsLoading]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      setUser(null);
      // Redirect to home page
      window.location.href = '/';
    } catch {
      // Still clear state on error
      setUser(null);
    }
  }, [setUser]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser, setIsLoading]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refresh,
    setUser,
  };
}
