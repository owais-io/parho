import { notFound } from 'next/navigation';
import CategoryArticleGrid from '@/components/CategoryArticleGrid';
import { getAllArticles, getAllCategories, getCategoryBySlug } from '@/lib/mdx';
import { Article } from '@/types';
import { ArrowLeft, FileText, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all categories at build time
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Generate metadata for each category page
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - parho.net`,
    description: `Explore ${category.articleCount} articles in the ${category.name} category. AI-summarized news from The Guardian.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const allArticles = getAllArticles();

  // Filter articles by category
  const categoryArticles = allArticles.filter((article: Article) => {
    const articleCategorySlug = article.category
      .toLowerCase()
      .replace(/\s+/g, '-');
    return articleCategorySlug === params.slug;
  });

  const latestArticle = categoryArticles[0];

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/categories"
              className="inline-flex items-center text-primary-100 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Categories
            </Link>
          </div>

          <div className="text-white">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <FileText size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {category.name}
                </h1>
                <p className="text-xl text-primary-100">
                  {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'} available
                </p>
              </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="glassmorphism rounded-lg p-4">
                <div className="flex items-center text-white">
                  <Calendar size={20} className="mr-2" />
                  <span>Latest: {latestArticle ? new Date(latestArticle.publishedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <div className="glassmorphism rounded-lg p-4">
                <div className="flex items-center text-white">
                  <TrendingUp size={20} className="mr-2" />
                  <span>Updated: Daily</span>
                </div>
              </div>
              <div className="glassmorphism rounded-lg p-4">
                <div className="flex items-center text-white">
                  <FileText size={20} className="mr-2" />
                  <span>Source: The Guardian</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {categoryArticles.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No articles found
              </h2>
              <p className="text-gray-600 mb-6">
                There are currently no articles in the {category.name} category.
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft size={16} className="mr-2" />
                Browse other categories
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Latest in {category.name}
                </h2>
                <p className="text-gray-600 text-lg">
                  Stay updated with the most recent stories and developments
                </p>
              </div>

              <CategoryArticleGrid articles={categoryArticles} />
            </>
          )}

          {/* Category Info */}
          <div className="mt-16 text-center">
            <div className="glassmorphism rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                About {category.name}
              </h3>
              <p className="text-gray-600 mb-6">
                This category features curated articles from The Guardian,
                each summarized into concise 60-80 word summaries using AI technology.
                Stay informed without information overload.
              </p>
              <div className="text-sm text-gray-500">
                Articles updated daily • AI-powered summaries
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
