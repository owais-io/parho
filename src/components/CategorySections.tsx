'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';
import SummaryModal from './SummaryModal';
import { Article, Category } from '@/types';

interface CategorySectionsProps {
  categoriesWithArticles: {
    category: Category;
    articles: Article[];
  }[];
}

export default function CategorySections({ categoriesWithArticles }: CategorySectionsProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(5);

  const openSummaryModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const loadMoreCategories = () => {
    setDisplayedCount(prev => prev + 3);
  };

  const displayedCategories = categoriesWithArticles.slice(0, displayedCount);
  const hasMoreCategories = displayedCount < categoriesWithArticles.length;

  return (
    <>
      {displayedCategories.map(({ category, articles }, index) => {
        if (articles.length === 0) return null;

        return (
          <section
            key={category.id}
            className={index % 2 === 0 ? 'py-12 bg-gray-50' : 'py-12'}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h2>
                  <p className="text-gray-600 text-lg">
                    {category.articleCount} article{category.articleCount !== 1 ? 's' : ''} in this category
                  </p>
                </div>
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
                >
                  View More in {category.name}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSummaryClick={openSummaryModal}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Load More Categories Button */}
      {hasMoreCategories && (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <button
                onClick={loadMoreCategories}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Load More Categories
              </button>
            </div>
          </div>
        </section>
      )}

      <SummaryModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeSummaryModal}
      />
    </>
  );
}
