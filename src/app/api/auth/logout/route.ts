/**
 * POST /api/auth/logout
 * Clears the auth cookie, ending the session.
 * Also invalidates Redis session cache.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { getSession } from '@/lib/auth/session';
import { validateOrigin } from '@/lib/auth/csrf';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    // 🛡️ CSRF check
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // Get session BEFORE clearing cookie (to get the userId for cache invalidation)
    const session = await getSession();

    await clearAuthCookie();

    // Clear session cache
    if (session) {
      try {
        await redis.del(`session:customer:${session.id}`);
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💥 Logout error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
