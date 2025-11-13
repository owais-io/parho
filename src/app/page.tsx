import ArticleGrid from '@/components/ArticleGrid';
import { getAllArticles, getAllCategories } from '@/lib/mdx';
import { TrendingUp, Clock, Globe } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'parho.net - AI-Powered News Summaries',
  description: 'Get the latest stories from The Guardian, summarized by AI into digestible 60-80 word summaries. Stay updated without the overwhelm.',
};

export default function HomePage() {
  const allArticles = getAllArticles();
  const categories = getAllCategories();
  const featuredArticles = allArticles.slice(0, 3);

  const stats = [
    { icon: Globe, label: 'Global Coverage', value: `${allArticles.length}+` },
    { icon: TrendingUp, label: 'Categories', value: categories.length.toString() },
    { icon: Clock, label: 'Updated', value: 'Daily' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Stay{' '}
              <span className="gradient-text font-['Playfair_Display']">
                Informed
              </span>
              {' '}with AI-Powered News
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get the latest stories from The Guardian, summarized by AI into digestible
              60-80 word summaries. Stay updated without the overwhelm.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="glassmorphism rounded-xl p-6 text-center">
                  <stat.icon className="mx-auto mb-3 text-primary-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
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

          <ArticleGrid articles={allArticles} skipFirst={3} />
        </div>
      </section>
    </>
  );
}
