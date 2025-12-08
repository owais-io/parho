import ArticleGrid from '@/components/ArticleGrid';
import CategorySections from '@/components/CategorySections';
import StructuredData from '@/components/StructuredData';
import { getAllArticles, getAllCategories, getArticlesByCategory } from '@/lib/mdx';
import { TrendingUp, Clock, Globe } from 'lucide-react';
import { Metadata } from 'next';
import { getItemListSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'parho.net - AI-Powered News Summaries',
  description: 'Get the latest stories from The Guardian, summarized by AI into digestible 60-80 word summaries. Stay updated without the overwhelm.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  const allArticles = getAllArticles();
  const categories = getAllCategories();
  const featuredArticles = allArticles.slice(0, 4);

  // Get all categories with their articles (sorted by latest article date)
  const categoriesWithArticles = categories.map(category => ({
    category,
    articles: getArticlesByCategory(category.slug).slice(0, 8)
  }));

  const stats = [
    { icon: Globe, label: 'Global Coverage', value: `${allArticles.length}+` },
    { icon: TrendingUp, label: 'Categories', value: categories.length.toString() },
    { icon: Clock, label: 'Updated', value: 'Daily' },
  ];

  return (
    <>
      <StructuredData data={getItemListSchema(featuredArticles, 'Featured Stories')} />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Stay{' '}
              <span className="gradient-text font-['Playfair_Display']">
                Informed
              </span>
              {' '}with AI-Powered News
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed">
              Get the latest stories from The Guardian, summarized by AI into digestible
              60-80 word summaries. Stay updated without the overwhelm.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="glassmorphism rounded-xl p-4 text-center">
                  <stat.icon className="mx-auto mb-2 text-primary-600" size={24} />
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
            <p className="text-gray-600 text-lg">
              Today&apos;s most important news, summarized for you
            </p>
          </div>

          <ArticleGrid articles={featuredArticles} showFeatured={true} />
        </div>
      </section>

      {/* All Articles Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h2>
            <p className="text-gray-600 text-lg">
              Comprehensive coverage across all categories
            </p>
          </div>

          <ArticleGrid articles={allArticles} skipFirst={4} />
        </div>
      </section>

      {/* Category Sections */}
      <CategorySections categoriesWithArticles={categoriesWithArticles} />
    </>
  );
}
