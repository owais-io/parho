'use client';

import { useState } from 'react';
import ArticleCard from './ArticleCard';
import SummaryModal from './SummaryModal';
import LoadMoreButton from './LoadMoreButton';
import { Article } from '@/types';

const ARTICLES_PER_PAGE = 10;

interface ArticleGridProps {
  articles: Article[];
  skipFirst?: number;
  showFeatured?: boolean;
}

export default function ArticleGrid({ articles, skipFirst = 0, showFeatured = false }: ArticleGridProps) {
  const articlesToDisplay = skipFirst > 0 ? articles.slice(skipFirst) : articles;
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>(
    showFeatured ? articlesToDisplay : articlesToDisplay.slice(0, ARTICLES_PER_PAGE)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMoreArticles = async () => {
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;

    const newArticles = articlesToDisplay.slice(startIndex, endIndex);
    setDisplayedArticles(prev => [...prev, ...newArticles]);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const openSummaryModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const hasMoreArticles = displayedArticles.length < articlesToDisplay.length;
  const gridClass = showFeatured
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';

  return (
    <>
      <div className={gridClass}>
        {displayedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onSummaryClick={openSummaryModal}
          />
        ))}
      </div>

      {!showFeatured && (
        <LoadMoreButton
          onLoadMore={loadMoreArticles}
          isLoading={isLoading}
          hasMore={hasMoreArticles}
        />
      )}

      <SummaryModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeSummaryModal}
      />
    </>
  );
}
