import { NextResponse } from 'next/server';
import { saveArticles, filterNewArticleIds } from '@/lib/db';

// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';

// Helper function to add delay between requests (rate limiting)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get and validate days parameter (1-30 days, default: 1)
    const daysParam = Number(searchParams.get('days')) || 1;
    const days = Math.max(1, Math.min(daysParam, 30)); // Clamp between 1-30

    const pageSize = 50; // Guardian API max per request

    // Calculate date range
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    const fromDate = startDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Use tomorrow's date to ensure we get all articles published today
    // (Guardian API interprets bare dates as start of day, i.e., midnight)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const toDate = tomorrow.toISOString().split('T')[0];

    console.log(`Fetching articles from last ${days} day(s): ${fromDate} to ${toDate}`);

    const apiKey = process.env.GUARDIAN_API_KEY;
    let allFetchedArticles: any[] = [];
    let totalAvailable = 0;
    let page = 1;

    // Fetch all available articles within the date range
    while (true) {
      // Build Guardian API URL for this page
      const guardianUrl = new URL('https://content.guardianapis.com/search');

      guardianUrl.searchParams.set('api-key', apiKey || '');
      guardianUrl.searchParams.set('from-date', fromDate);
      guardianUrl.searchParams.set('page-size', pageSize.toString());
      guardianUrl.searchParams.set('page', page.toString());
      guardianUrl.searchParams.set('order-by', 'newest');
      guardianUrl.searchParams.set('show-fields', 'thumbnail,trailText,byline');

      // Fetch from Guardian API
      const response = await fetch(guardianUrl.toString());

      if (!response.ok) {
        console.log(`Page ${page} returned status ${response.status}. Stopping pagination.`);
        break; // Stop fetching if we hit an error
      }

      const data = await response.json();
      const pageArticles = data.response.results;
      totalAvailable = data.response.total; // Total articles available in the time range

      // If no articles returned, we've reached the end
      if (!pageArticles || pageArticles.length === 0) {
        console.log(`No more articles available after page ${page - 1}`);
        break;
      }

      allFetchedArticles = allFetchedArticles.concat(pageArticles);

      console.log(`Fetched page ${page}: ${pageArticles.length} articles (${allFetchedArticles.length}/${totalAvailable} total)`);

      // Stop if we've fetched all available articles
      if (allFetchedArticles.length >= totalAvailable) {
        console.log(`All articles fetched: ${allFetchedArticles.length}`);
        break;
      }

      // Rate limiting: Wait 1 second between requests
      await delay(1000); // 1 second delay to respect API rate limit

      page++; // Move to next page
    }

    // Filter out duplicate articles (already fetched before)
    const articleIds = allFetchedArticles.map((article: any) => article.id);
    const newArticleIds = filterNewArticleIds(articleIds);
    const newArticles = allFetchedArticles.filter((article: any) =>
      newArticleIds.includes(article.id)
    );

    // Save only new articles to database
    if (newArticles.length > 0) {
      saveArticles(newArticles);
    }

    return NextResponse.json({
      success: true,
      daysRequested: days,
      dateRange: {
        from: fromDate,
        to: toDate,
      },
      articles: newArticles,
      totalAvailable: totalAvailable, // Total articles in date range
      fetched: allFetchedArticles.length,
      new: newArticles.length,
      duplicates: allFetchedArticles.length - newArticles.length,
    });

  } catch (error) {
    console.error('Guardian API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
