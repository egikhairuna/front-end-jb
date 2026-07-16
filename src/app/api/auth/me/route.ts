/**
 * GET /api/auth/me
 * Returns the current authenticated user or 401.
 * Used by the client-side useAuth() hook for navbar state, etc.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { user: null },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          }
        }
      );
    }

    return NextResponse.json(
      { user: session },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        }
      }
    );
  } catch (error) {
    console.error('💥 /api/auth/me error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { user: null, error: 'Not authenticated' },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        }
      }
    );
  }
}
