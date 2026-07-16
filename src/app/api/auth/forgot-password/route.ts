import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOrigin } from '@/lib/auth/csrf';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

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
    const rateCheck = await checkRateLimit(`forgot-password:${ip}`);
    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSec.toString() },
        }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Call WordPress REST API
    const response = await fetch(`${WORDPRESS_URL}/wp-json/bdpwr/v1/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorCode = data.code || '';

      // Protect against email enumeration: return success if the email is not found or invalid
      if (
        errorCode.includes('email') ||
        errorCode.includes('user') ||
        errorCode.includes('no_user') ||
        response.status === 400 ||
        response.status === 404
      ) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: data.message || 'Failed to send reset link. Please try again.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Forgot Password handler exception:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again later.' },
      { status: 500 }
    );
  }
}
