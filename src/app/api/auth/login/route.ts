/**
 * POST /api/auth/login
 * Authenticates a user via the WordPress JWT plugin and sets an httpOnly cookie.
 *
 * 🔒 SECURITY:
 * - Rate limited per IP
 * - CSRF origin check
 * - JWT stored in httpOnly cookie only (never in response body)
 * - Passwords never logged
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas/auth';
import { setAuthCookie } from '@/lib/auth/cookies';
import { extractUserIdFromToken } from '@/lib/auth/jwt';
import { validateOrigin } from '@/lib/auth/csrf';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { getWooCommerceClient } from '@/lib/woocommerce/client';
import type { WPJWTResponse, WPJWTError } from '@/types/auth';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

export async function POST(request: NextRequest) {
  try {
    // 🛡️ CSRF check
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // 🛡️ Rate limiting
    const ip = getClientIP(request);
    const rateCheck = await checkRateLimit(`login:${ip}`);
    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': retryAfterSec.toString() },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // 🔒 SECURITY: Proxy to WordPress JWT endpoint — never expose WP credentials
    console.log('🔐 Login attempt for user (email/username hash omitted for security)');

    const wpResponse = await fetch(
      `${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }
    );

    const wpData = await wpResponse.json();

    if (!wpResponse.ok) {
      const wpError = wpData as WPJWTError;
      console.log('❌ Login failed:', { code: wpError.code, status: wpError.data?.status });

      // Map WordPress error codes to user-friendly messages
      let message = 'Invalid email/username or password.';
      if (wpError.code === '[jwt_auth] invalid_username') {
        message = 'No account found with that email or username.';
      } else if (wpError.code === '[jwt_auth] incorrect_password') {
        message = 'Incorrect password. Please try again.';
      }

      return NextResponse.json(
        { error: message },
        { status: 401 }
      );
    }

    const jwtResponse = wpData as WPJWTResponse;

    // Set the JWT in an httpOnly cookie
    await setAuthCookie(jwtResponse.token);

    // Build safe user object from WooCommerce data
    const userId = extractUserIdFromToken(jwtResponse.token);
    let user = {
      id: userId || 0,
      email: jwtResponse.user_email,
      displayName: jwtResponse.user_display_name,
      firstName: '',
      lastName: '',
    };

    // Try to enrich with WooCommerce customer data
    if (userId) {
      try {
        const wc = getWooCommerceClient();
        const customer = await wc.getCustomer(userId);
        user = {
          id: customer.id,
          email: customer.email,
          displayName: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
        };
      } catch {
        // Non-critical: use JWT data if WC customer fetch fails
      }
    }

    console.log('✅ Login successful for user ID:', user.id);

    // 🔒 SECURITY: Never include the token in the JSON response body
    return NextResponse.json({ user });

  } catch (error) {
    console.error('💥 Login error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
