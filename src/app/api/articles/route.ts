import { NextResponse } from 'next/server';
import { getAllArticles, deleteArticle, deleteArticles, countArticles } from '@/lib/db';

// GET - Retrieve all articles from database
export async function GET() {
  try {
    const articles = getAllArticles();
    const total = countArticles();

    // Transform articles to match the frontend format
    const transformedArticles = articles.map(article => ({
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

    return NextResponse.json({
      success: true,
      articles: transformedArticles,
      total: total,
    });

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
