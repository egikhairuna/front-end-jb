/**
 * POST /api/auth/register
 * Creates a new WooCommerce customer and auto-logs them in.
 *
 * 🔒 SECURITY:
 * - Creates customer via admin-auth WooCommerce REST API (server-side only)
 * - Rate limited per IP
 * - CSRF origin check
 * - Duplicate email detection with clear error message
 * - Read-only API key detection
 * - Auto-login after registration (sets httpOnly cookie)
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/schemas/auth';
import { setAuthCookie } from '@/lib/auth/cookies';
import { extractUserIdFromToken } from '@/lib/auth/jwt';
import { validateOrigin } from '@/lib/auth/csrf';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { getWooCommerceClient } from '@/lib/woocommerce/client';
import type { WPJWTResponse } from '@/types/auth';

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
    const rateCheck = await checkRateLimit(`register:${ip}`);
    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSec.toString() },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone, birthDate } = parsed.data;

    // 🔒 SECURITY: Create customer via admin-authenticated WooCommerce REST API
    console.log('👤 Registering new customer...');

    const wc = getWooCommerceClient();

    let customer;
    try {
      customer = await wc.createCustomer({
        email,
        password,
        first_name: firstName,
        last_name: lastName || '',
        username: email, // Use email as username
        billing: {
          first_name: firstName,
          last_name: lastName || '',
          email,
          phone,
        },
        meta_data: [
          {
            key: 'birth_date',
            value: birthDate,
          }
        ]
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';

      // Handle specific WooCommerce errors
      if (
        errorMessage.includes('registration-error-email-exists') ||
        errorMessage.includes('An account is already registered with your email address') ||
        errorMessage.includes('already registered')
      ) {
        return NextResponse.json(
          { error: 'This email is already registered — try logging in instead.' },
          { status: 409 }
        );
      }

      if (
        errorMessage.includes('registration-error-username-exists') ||
        errorMessage.includes('already taken')
      ) {
        return NextResponse.json(
          { error: 'This username is already taken. Please try a different email.' },
          { status: 409 }
        );
      }

      // Detect read-only API key
      if (
        errorMessage.includes('woocommerce_rest_cannot_create') ||
        errorMessage.includes('Sorry, you are not allowed to create resources')
      ) {
        console.error('🔑 WooCommerce API key appears to be read-only. Customer creation requires Read/Write permissions.');
        return NextResponse.json(
          { error: 'Registration is temporarily unavailable. Please contact support.' },
          { status: 503 }
        );
      }

      throw error; // Re-throw unknown errors
    }

    console.log('✅ Customer created:', { id: customer.id });

    // Auto-login: get a JWT token for the new user
    console.log('🔐 Auto-logging in new customer...');

    const wpResponse = await fetch(
      `${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      }
    );

    if (!wpResponse.ok) {
      // Registration succeeded but auto-login failed — user can still log in manually
      console.error('⚠️ Auto-login failed after registration. Customer can log in manually.');
      return NextResponse.json({
        user: {
          id: customer.id,
          email: customer.email,
          displayName: `${customer.first_name} ${customer.last_name}`.trim(),
          firstName: customer.first_name,
          lastName: customer.last_name,
        },
        message: 'Account created successfully! Please log in.',
        requiresLogin: true,
      });
    }

    const jwtData = (await wpResponse.json()) as WPJWTResponse;

    // Set the JWT cookie
    await setAuthCookie(jwtData.token);

    const userId = extractUserIdFromToken(jwtData.token);

    const user = {
      id: userId || customer.id,
      email: customer.email,
      displayName: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
    };

    console.log('✅ Registration + auto-login complete for user ID:', user.id);

    return NextResponse.json({ user });

  } catch (error) {
    console.error('💥 Registration error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
