import { NextResponse } from 'next/server';
import { getAverageProcessingTime } from '@/lib/db';

// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';

// GET - Get processing metrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const metrics = getAverageProcessingTime(limit);

    return NextResponse.json({
      success: true,
      metrics: {
        averageSeconds: metrics.averageSeconds,
        averageMinutes: metrics.averageSeconds ? metrics.averageSeconds / 60 : null,
        count: metrics.count,
        minSeconds: metrics.minSeconds,
        maxSeconds: metrics.maxSeconds,
        limit,
      },
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
