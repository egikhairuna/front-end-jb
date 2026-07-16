import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { validateOrigin } from '@/lib/auth/csrf';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { changePasswordSchema } from '@/lib/schemas/auth';
import { getWooCommerceClient } from '@/lib/woocommerce/client';

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

    // 🛡️ Session validation
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 🛡️ Rate limiting (5 attempts per 15 min for change-password)
    const ip = getClientIP(request);
    const rateCheck = await checkRateLimit(`change-password:${ip}`, 5);
    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSec.toString() },
        }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Verify current password via WordPress JWT plugin endpoint
    const wpResponse = await fetch(`${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: session.email, password: currentPassword }),
    });

    if (!wpResponse.ok) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update customer password via WooCommerce REST API
    const wc = getWooCommerceClient();
    await wc.updateCustomer(session.id, { password: newPassword });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💥 Change password handler exception:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
