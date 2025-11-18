'use client';

import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { ArticleCardProps } from '@/types';

export default function ArticleCard({ article, onSummaryClick }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <article className="article-card bg-white rounded-xl shadow-lg overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold text-white bg-primary-600 rounded-full">
            {article.category}
          </span>
        </div>

        {/* View Summary Button */}
        <button
          onClick={() => onSummaryClick(article)}
          className="absolute bottom-3 right-3 glassmorphism text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-600 transition-all duration-300 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
        >
          <Eye size={14} />
          <span>Read Summary</span>
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock size={14} className="mr-1" />
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer" 
            onClick={() => onSummaryClick(article)}>
          {article.title}
        </h2>

        <button
          onClick={() => onSummaryClick(article)}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
        >
          Read Summary
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}