import { NextResponse } from 'next/server';
import { getAllSummaries, countSummaries, deleteSummary } from '@/lib/db';

// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';

// GET - Retrieve all summaries from database
export async function GET() {
  try {
    const summaries = getAllSummaries(); // Already ordered by publishedDate DESC
    const total = countSummaries();

    return NextResponse.json({
      success: true,
      summaries,
      total,
    });

  } catch (error) {
    console.error('Summaries API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch summaries' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a summary
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { guardianId } = body;

    if (!guardianId) {
      return NextResponse.json(
        { success: false, error: 'Guardian ID is required' },
        { status: 400 }
      );
    }

    deleteSummary(guardianId);

    return NextResponse.json({
      success: true,
      message: 'Summary deleted successfully',
    });
  } catch (error) {
    console.error('Delete summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete summary' },
      { status: 500 }
    );
  }
}
