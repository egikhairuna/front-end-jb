/**
 * GET/PATCH /api/account/profile
 * Get or update the authenticated customer's profile.
 *
 * 🔒 SECURITY:
 * - Requires authenticated session
 * - Scoped to session.userId (never trust client-provided ID)
 * - CSRF check on PATCH
 * - Server-side zod re-validation on PATCH
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { validateOrigin } from '@/lib/auth/csrf';
import { profileSchema } from '@/lib/schemas/auth';
import { getWooCommerceClient } from '@/lib/woocommerce/client';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const wc = getWooCommerceClient();
    const customer = await wc.getCustomer(session.id);

    return NextResponse.json({
      profile: {
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.billing?.phone || '',
      },
    });
  } catch (error) {
    console.error('💥 Profile fetch error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 🛡️ CSRF check
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone } = parsed.data;

    const wc = getWooCommerceClient();
    const updated = await wc.updateCustomer(session.id, {
      first_name: firstName,
      last_name: lastName || '',
      email,
      billing: { phone: phone || '' },
    });

    return NextResponse.json({
      profile: {
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        phone: updated.billing?.phone || '',
      },
    });
  } catch (error) {
    console.error('💥 Profile update error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
