/**
 * JWT verification and decoding helpers.
 * Uses `jose` (Edge-runtime compatible) for local verification when WORDPRESS_JWT_SECRET is available.
 * Falls back to remote validation via the WordPress JWT plugin endpoint.
 *
 * 🔒 SECURITY: Never log the token or secret in plaintext.
 */

import { jwtVerify, decodeJwt } from 'jose';
import type { JWTClaims } from '@/types/auth';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';
const JWT_SECRET = process.env.WORDPRESS_JWT_SECRET || '';

/**
 * Verify a JWT token.
 * - If WORDPRESS_JWT_SECRET is set, verify locally (no network hop).
 * - Otherwise, call the WordPress JWT plugin's validate endpoint.
 *
 * Returns decoded claims on success, null on failure (expired, invalid, etc.).
 */
export async function verifyJWT(token: string): Promise<JWTClaims | null> {
  if (!token) return null;

  try {
    if (JWT_SECRET) {
      const localClaims = await verifyLocally(token);
      if (localClaims) return localClaims;
      console.warn('🔒 verifyJWT: Local validation failed, falling back to remote validation');
    }
    return await verifyRemotely(token);
  } catch (error) {
    console.error('🔒 verifyJWT: Verification error:', error);
    return null;
  }
}

/**
 * Verify JWT locally using jose.
 */
async function verifyLocally(token: string): Promise<JWTClaims | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as JWTClaims;
  } catch (err) {
    console.warn('🔒 verifyLocally error:', err);
    return null;
  }
}

/**
 * Verify JWT by calling the WordPress JWT plugin's validate endpoint.
 */
async function verifyRemotely(token: string): Promise<JWTClaims | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    // If validation succeeds, decode the token to get claims
    // (the validate endpoint only returns { code, data: { status } } on success)
    return decodeJWTClaims(token);
  } catch {
    return null;
  }
}

/**
 * Decode JWT claims WITHOUT verification.
 * Only use after the token has already been verified.
 */
export function decodeJWTClaims(token: string): JWTClaims | null {
  try {
    const payload = decodeJwt(token);
    return payload as unknown as JWTClaims;
  } catch {
    return null;
  }
}

/**
 * Extract the WordPress user ID from a verified JWT token.
 */
export function extractUserIdFromToken(token: string): number | null {
  const claims = decodeJWTClaims(token);
  if (!claims?.data?.user?.id) return null;
  return parseInt(claims.data.user.id, 10);
}

/**
 * Check if a JWT token is expired by inspecting its `exp` claim.
 * Does NOT verify the signature — use verifyJWT for that.
 */
export function isTokenExpired(token: string): boolean {
  const claims = decodeJWTClaims(token);
  if (!claims?.exp) return true;
  return Date.now() >= claims.exp * 1000;
}
