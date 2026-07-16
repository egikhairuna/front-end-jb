import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOrigin } from '@/lib/auth/csrf';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { passwordSchema } from '@/lib/schemas/auth';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
  password: passwordSchema,
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
    const rateCheck = await checkRateLimit(`reset-password:${ip}`);
    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new reset link.' },
        { status: 429, headers: { 'Retry-After': retryAfterSec.toString() } }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const { email, code, password } = parsed.data;

    // Call WordPress REST API
    const response = await fetch(`${WORDPRESS_URL}/wp-json/bdpwr/v1/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorCode = data.code || '';

      // Map WordPress error codes to user-friendly messages
      if (errorCode === 'bad_request' || data.message?.toLowerCase().includes('code') || data.message?.toLowerCase().includes('invalid')) {
        return NextResponse.json(
          { error: 'The reset code is invalid or has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      if (errorCode === 'bad_email') {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: data.message || 'Failed to reset password. Please try again.' },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Reset Password handler exception:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again later.' },
      { status: 500 }
    );
  }
}
