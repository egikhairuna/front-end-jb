/**
 * Next.js Middleware for auth route protection and IP-based currency geolocation.
 *
 * Optimistic auth check: only checks cookie PRESENCE, no crypto verification.
 * Geolocation: detects visitor's country using ipapi.co to set default currency.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'jb_auth_token';

// Routes that require authentication
const PROTECTED_PREFIX = '/account';

// Auth routes accessible without login (and redirected to /account if logged in)
const isPublicAuthRoute = (pathname: string) =>
  pathname === '/account/login' ||
  pathname === '/account/register' ||
  pathname.startsWith('/account/forgot-password');

function isPrivateIP(ip: string): boolean {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  // Basic checks for standard private ranges: 10.x, 192.168.x, 172.16.x-172.31.x
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const second = parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only want to handle geolocation and cookie for document requests (HTML pages)
  const isPageRequest = !pathname.startsWith('/api') && 
                        !pathname.startsWith('/_next') && 
                        !pathname.includes('.') && 
                        pathname !== '/favicon.ico';

  let response: NextResponse | null = null;
  let currencyToSet: string | null = null;

  if (isPageRequest && !request.cookies.has('preferred_currency')) {
    // Geolocation lookup via x-forwarded-for (first IP in list) or request.ip
    const forwardedFor = request.headers.get('x-forwarded-for');
    let clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '';

    if (!clientIp) {
      clientIp = (request as any).ip || '';
    }

    let country = 'ID'; // Default to Indonesia
    if (clientIp && !isPrivateIP(clientIp)) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      try {
        const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
          signal: controller.signal,
        });
        if (geoRes.ok) {
          const data = await geoRes.json();
          if (data?.country_code) {
            country = data.country_code;
          }
        }
      } catch (err) {
        console.warn(`⚠️ IP Geolocation fetch failed for IP ${clientIp}:`, err);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Indonesia (ID) or Malaysia (MY) -> IDR, else USD
    currencyToSet = (country === 'ID' || country === 'MY') ? 'IDR' : 'USD';
  }

  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  // If user is on a protected route /account
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const isAuth = isPublicAuthRoute(pathname);
    // If user is on public auth pages and already has a cookie, redirect to /account
    if (isAuth && hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.search = '';
      response = NextResponse.redirect(url);
    }
    // If user is on a protected account route and has no cookie, redirect to login
    else if (!isAuth && !hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/login';
      response = NextResponse.redirect(url);
    }
  }

  // Create response if not already created
  if (!response) {
    response = NextResponse.next();
  }

  // If we detected a currency preference, set it in cookie
  if (currencyToSet) {
    response.cookies.set('preferred_currency', currencyToSet, {
      maxAge: 90 * 24 * 60 * 60, // 90 days
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
