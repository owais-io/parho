'use client';

import { useState } from 'react';
import ArticleCard from './ArticleCard';
import SummaryModal from './SummaryModal';
import LoadMoreButton from './LoadMoreButton';
import { Article } from '@/types';

const ARTICLES_PER_PAGE = 10;

interface CategoryArticleGridProps {
  articles: Article[];
}

export default function CategoryArticleGrid({ articles }: CategoryArticleGridProps) {
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>(
    articles.slice(0, ARTICLES_PER_PAGE)
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

    const newArticles = articles.slice(startIndex, endIndex);
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

  const hasMoreArticles = displayedArticles.length < articles.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onSummaryClick={openSummaryModal}
          />
        ))}
      </div>

      <LoadMoreButton
        onLoadMore={loadMoreArticles}
        isLoading={isLoading}
        hasMore={hasMoreArticles}
      />

      <SummaryModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeSummaryModal}
      />
    </>
  );
}
