/**
 * Session management for server-side auth.
 * Used in Server Components, Server Actions, and Route Handlers.
 *
 * getSession() — reads the cookie, verifies the JWT, returns AuthUser or null.
 * requireSession() — same as getSession but throws if not authenticated.
 *
 * 🔒 SECURITY: Always verifies the JWT before trusting any user claims.
 */

import { getAuthToken, clearAuthCookie } from './cookies';
import { verifyJWT, extractUserIdFromToken } from './jwt';
import type { AuthUser } from '@/types/auth';
import { getWooCommerceClient } from '@/lib/woocommerce/client';

/**
 * Get the current authenticated session.
 * Returns AuthUser if valid, null if not authenticated or token expired.
 * Automatically clears invalid/expired cookies.
 */
export async function getSession(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;

  // Verify the JWT (local or remote)
  const claims = await verifyJWT(token);
  if (!claims) {
    // Token is invalid or expired — clear the stale cookie
    await clearAuthCookie();
    return null;
  }

  // Extract user ID from verified token
  const userId = extractUserIdFromToken(token);
  if (!userId) {
    await clearAuthCookie();
    return null;
  }

  try {
    // Fetch customer details from WooCommerce to build AuthUser
    const wc = getWooCommerceClient();
    const customer = await wc.getCustomer(userId);

    return {
      id: customer.id,
      email: customer.email,
      displayName: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
    };
  } catch {
    // 🔒 SECURITY: Log minimal info — no PII, no token
    console.error('🔒 Session: Failed to fetch customer data for user ID:', userId);
    // If the customer doesn't exist in WC (e.g. admin user), still return basic info
    // from the JWT claims
    return {
      id: userId,
      email: '',
      displayName: '',
      firstName: '',
      lastName: '',
    };
  }
}

/**
 * Require an authenticated session.
 * Returns AuthUser if valid, throws an error if not authenticated.
 * Use in Route Handlers that need auth.
 */
export async function requireSession(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
