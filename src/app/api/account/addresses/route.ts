/**
 * GET/PATCH /api/account/addresses
 * Get or update the authenticated customer's saved address.
 * Under the hood, this updates both WooCommerce billing and shipping addresses 
 * to keep them in sync, providing a simplified "single address" user experience.
 *
 * 🔒 SECURITY:
 * - Requires authenticated session
 * - Scoped to session.userId
 * - CSRF check on PATCH
 * - Server-side zod re-validation on PATCH
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { validateOrigin } from '@/lib/auth/csrf';
import { addressSchema } from '@/lib/schemas/auth';
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
      address: customer.billing || {},
    });
  } catch (error) {
    console.error('💥 Address fetch error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
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
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const address = parsed.data;

    // WooCommerce shipping address does not have phone/email fields, so strip them
    const { email, phone, ...shippingAddress } = address;

    const updateData = {
      billing: {
        ...address,
        email: email || '',
        phone: phone || '',
      },
      shipping: {
        ...shippingAddress,
        first_name: address.first_name,
        last_name: address.last_name,
      },
    };

    const wc = getWooCommerceClient();
    const updated = await wc.updateCustomer(session.id, updateData);

    return NextResponse.json({
      address: updated.billing || {},
    });
  } catch (error) {
    console.error('💥 Address update error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}
