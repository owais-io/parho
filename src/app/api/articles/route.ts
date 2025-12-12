import { NextResponse } from 'next/server';
import { getAllArticles, getArticlesPaginated, deleteArticle, deleteArticles } from '@/lib/db';

// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';

// GET - Retrieve articles from database with optional pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let articles;
    let total;
    let responseData;

    if (fetchAll) {
      // Fetch all articles without pagination
      articles = getAllArticles();
      total = articles.length;

      responseData = {
        success: true,
        articles: articles.map(article => ({
          id: article.id,
          type: article.type,
          sectionId: article.sectionId,
          sectionName: article.sectionName,
          webPublicationDate: article.webPublicationDate,
          webTitle: article.webTitle,
          webUrl: article.webUrl,
          pillarId: article.pillarId,
          pillarName: article.pillarName,
          fields: {
            thumbnail: article.thumbnail,
            trailText: article.trailText,
            byline: article.byline,
          }
        })),
        total,
      };
    } else {
      // Use pagination
      const validPage = Math.max(1, page);
      const validLimit = Math.min(Math.max(1, limit), 500); // Max 500 per page

      const result = getArticlesPaginated(validPage, validLimit);

      // Transform articles to match the frontend format
      const transformedArticles = result.articles.map(article => ({
        id: article.id,
        type: article.type,
        sectionId: article.sectionId,
        sectionName: article.sectionName,
        webPublicationDate: article.webPublicationDate,
        webTitle: article.webTitle,
        webUrl: article.webUrl,
        pillarId: article.pillarId,
        pillarName: article.pillarName,
        fields: {
          thumbnail: article.thumbnail,
          trailText: article.trailText,
          byline: article.byline,
        }
      }));

      responseData = {
        success: true,
        articles: transformedArticles,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles from database' },
      { status: 500 }
    );
  }
}

// DELETE - Delete one or multiple articles
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json().catch(() => null);

    if (body && body.ids && Array.isArray(body.ids)) {
      // Bulk delete
      deleteArticles(body.ids);
      return NextResponse.json({
        success: true,
        message: `Deleted ${body.ids.length} articles`,
        count: body.ids.length,
      });
    } else if (id) {
      // Single delete
      deleteArticle(id);
      return NextResponse.json({
        success: true,
        message: 'Article deleted successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'No article ID(s) provided' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article(s)' },
      { status: 500 }
    );
  }
}
