/**
 * Next.js Middleware for auth route protection.
 *
 * Optimistic check: only checks cookie PRESENCE, no crypto verification.
 * Full JWT verification happens in getSession() within Route Handlers/Server Components.
 *
 * Routes:
 * - /account/* (except /account/login, /account/register): redirect to login if no cookie
 * - /account/login, /account/register: redirect to /account if cookie present
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'jb_auth_token';

// Routes that require authentication
const PROTECTED_PREFIX = '/account';

// Auth routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/account/login', '/account/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process /account routes
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  // If user is on login/register and has a cookie, redirect to /account
  if (AUTH_ROUTES.includes(pathname) && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // If user is on a protected route (not login/register) and has no cookie, redirect to login
  if (!AUTH_ROUTES.includes(pathname) && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/account/login';
    // Preserve a "redirect after login" param if needed
    // Don't set expired=true here — that's only for when a verified session fails
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
