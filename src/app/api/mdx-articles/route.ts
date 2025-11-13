import { NextResponse } from 'next/server';
import { getAllArticles, getArticlesByCategory, getAllCategories } from '@/lib/mdx';

// GET - Get all MDX articles or filter by category
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
      // Get articles by category
      const articles = getArticlesByCategory(category);
      return NextResponse.json({
        success: true,
        articles,
        total: articles.length,
      });
    } else {
      // Get all articles
      const articles = getAllArticles();
      const categories = getAllCategories();

      return NextResponse.json({
        success: true,
        articles,
        categories,
        total: articles.length,
      });
    }
  } catch (error) {
    console.error('MDX Articles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
