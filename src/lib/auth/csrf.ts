/**
 * CSRF protection via Origin header validation.
 * Since auth uses a cookie, we add Origin checking on state-changing requests
 * (POST/PATCH/DELETE) as a lightweight defense-in-depth measure.
 * SameSite=Lax already blocks most cross-site POSTs, but this is a cheap extra layer.
 */

import { NextRequest } from 'next/server';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || '';

/**
 * Validate that the request's Origin matches this site.
 * Returns true if valid, false if suspicious.
 *
 * Only apply to state-changing methods (POST, PATCH, PUT, DELETE).
 * GET/HEAD/OPTIONS are safe to skip.
 */
export function validateOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // In development, be more lenient
  if (process.env.NODE_ENV === 'development') {
    // Allow localhost origins in dev
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return true;
    }
    // Allow requests without Origin header in dev (e.g. from tools like Postman)
    if (!origin && !referer) {
      return true;
    }
  }

  // Check Origin header first (most reliable)
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const frontendUrl = new URL(FRONTEND_URL || 'http://localhost:3000');
      return originUrl.host === frontendUrl.host;
    } catch {
      return false;
    }
  }

  // Fall back to Referer header if Origin is not present
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const frontendUrl = new URL(FRONTEND_URL || 'http://localhost:3000');
      return refererUrl.host === frontendUrl.host;
    } catch {
      return false;
    }
  }

  // No Origin or Referer — reject in production, allow in dev
  return process.env.NODE_ENV === 'development';
}
