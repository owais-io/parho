'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, Clock, Tag } from 'lucide-react';
import { SummaryModalProps } from '@/types';

export default function SummaryModal({ article, isOpen, onClose }: SummaryModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-colors shadow-lg"
        >
          <X size={20} />
        </button>

        {/* Main Layout: Image (40%) + Content (60%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 max-h-[90vh]">
          {/* Left Side: Image (40%) */}
          <div className="relative h-64 lg:h-auto lg:col-span-2 bg-gray-100 overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-white bg-primary-600 rounded-full">
                <Tag size={14} className="mr-1" />
                {article.category}
              </span>
            </div>
          </div>

          {/* Right Side: Content (60%) */}
          <div className="lg:col-span-3 flex flex-col overflow-y-auto max-h-[calc(90vh-16rem)] lg:max-h-[90vh]">
            <div className="p-6 md:p-8 flex-1">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center text-sm text-gray-600 mb-6">
                <Clock size={16} className="mr-2" />
                <time dateTime={article.publishedAt}>
                  Published {formatDate(article.publishedAt)}
                </time>
              </div>

              {/* Summary Content */}
              <div className="prose prose-lg max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Article Summary
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {article.summary}
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Source: The Guardian</span>
                    <span>•</span>
                    <span>Summary by Ollama AI</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 md:mt-0">
                    Article ID: {article.slug}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // In a real implementation, this would link to the full Guardian article
                    window.open(`https://www.theguardian.com/${article.slug}`, '_blank');
                  }}
                  className="flex-1 load-more-btn text-white px-6 py-3 font-medium rounded-lg"
                >
                  Read Full Article
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}