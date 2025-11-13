import { NextResponse } from 'next/server';
import { saveArticles, filterNewArticleIds } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 50, 50); // Max 50 articles

    // Calculate date 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fromDate = yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Build Guardian API URL
    const apiKey = process.env.GUARDIAN_API_KEY;
    const guardianUrl = new URL('https://content.guardianapis.com/search');

    guardianUrl.searchParams.set('api-key', apiKey || '');
    guardianUrl.searchParams.set('from-date', fromDate);
    guardianUrl.searchParams.set('page-size', pageSize.toString());
    guardianUrl.searchParams.set('order-by', 'newest');
    guardianUrl.searchParams.set('show-fields', 'thumbnail,trailText,byline');

    // Fetch from Guardian API
    const response = await fetch(guardianUrl.toString());

    if (!response.ok) {
      throw new Error('Failed to fetch from Guardian API');
    }

    const data = await response.json();
    const fetchedArticles = data.response.results;

    // Filter out duplicate articles (already fetched before)
    const articleIds = fetchedArticles.map((article: any) => article.id);
    const newArticleIds = filterNewArticleIds(articleIds);
    const newArticles = fetchedArticles.filter((article: any) =>
      newArticleIds.includes(article.id)
    );

    // Save only new articles to database
    if (newArticles.length > 0) {
      saveArticles(newArticles);
    }

    return NextResponse.json({
      success: true,
      articles: newArticles,
      total: data.response.total,
      fetched: fetchedArticles.length,
      new: newArticles.length,
      duplicates: fetchedArticles.length - newArticles.length,
      currentPage: data.response.currentPage,
      pages: data.response.pages,
    });

  } catch (error) {
    console.error('Guardian API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
