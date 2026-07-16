/**
 * POST /api/auth/logout
 * Clears the auth cookie, ending the session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { validateOrigin } from '@/lib/auth/csrf';

export async function POST(request: NextRequest) {
  try {
    // 🛡️ CSRF check
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💥 Logout error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
