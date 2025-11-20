import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block /admin, /summaries, and related API routes in production
  if (process.env.NODE_ENV === 'production') {
    const path = request.nextUrl.pathname;

    // Block admin pages and their API endpoints
    const blockedPaths = [
      '/admin',
      '/summaries',
      '/api/articles',
      '/api/guardian',
      '/api/process',
      '/api/summaries',
      '/api/deploy'
    ];

    if (blockedPaths.some(blocked => path.startsWith(blocked))) {
      // Return 404 in production
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/admin/:path*',
    '/summaries/:path*',
    '/api/articles/:path*',
    '/api/guardian/:path*',
    '/api/process/:path*',
    '/api/summaries/:path*',
    '/api/deploy/:path*'
  ],
};
