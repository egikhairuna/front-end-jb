/**
 * Auth cookie management.
 * The JWT is stored in an httpOnly, Secure (prod), SameSite=Lax cookie.
 * Only set/read by Next.js Route Handlers — never exposed to client JS.
 *
 * 🔒 SECURITY: The cookie is httpOnly, meaning document.cookie cannot access it.
 */

import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'jb_auth_token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds (matches default JWT expiry)

/**
 * Set the auth cookie with the JWT token.
 * Called after successful login or registration.
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  });
}

/**
 * Clear the auth cookie.
 * Called on logout or when a token is found to be expired/invalid.
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Immediately expire
  });
}

/**
 * Read the auth token from the cookie.
 * Returns the raw JWT string or null if not present.
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(AUTH_COOKIE_NAME);
  return cookie?.value || null;
}
