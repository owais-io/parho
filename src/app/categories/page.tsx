import CategorySorter from '@/components/CategorySorter';
import { getAllCategories } from '@/lib/mdx';
import { Metadata } from 'next';
import { Grid } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Categories - parho.net',
  description: 'Explore all news categories available on parho.net. Find articles from world news, technology, politics, business, sports, and more.',
  alternates: {
    canonical: '/categories',
  },
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Grid className="mx-auto mb-4" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              All Categories
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Explore our comprehensive collection of news categories. 
              From global events to specialized topics, find exactly what interests you.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CategorySorter categories={categories} />

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="glassmorphism rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Stay Updated
              </h3>
              <p className="text-gray-600 mb-6">
                New articles are added daily across all categories. 
                Each story is carefully summarized to give you the essential information in 60-80 words.
              </p>
              <div className="text-sm text-gray-500">
                Powered by The Guardian API • Summarized by Ollama AI
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}