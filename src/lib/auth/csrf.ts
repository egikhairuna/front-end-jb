import { NextRequest } from 'next/server';

/**
 * Helper to normalize host string by stripping default port and leading 'www.'
 */
function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, '').split(':')[0];
}

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

  const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const configuredFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  let configuredHost = '';
  if (configuredFrontendUrl) {
    try {
      configuredHost = new URL(configuredFrontendUrl).host;
    } catch {
      configuredHost = configuredFrontendUrl;
    }
  }

  const allowedHosts = new Set(
    [
      requestHost ? normalizeHost(requestHost) : '',
      configuredHost ? normalizeHost(configuredHost) : '',
    ].filter(Boolean)
  );

  // Check Origin header first (most reliable)
  if (origin) {
    try {
      const originHost = normalizeHost(new URL(origin).host);
      return allowedHosts.has(originHost);
    } catch {
      return false;
    }
  }

  // Fall back to Referer header if Origin is not present
  if (referer) {
    try {
      const refererHost = normalizeHost(new URL(referer).host);
      return allowedHosts.has(refererHost);
    } catch {
      return false;
    }
  }

  // No Origin or Referer — reject in production, allow in dev
  return process.env.NODE_ENV === 'development';
}
