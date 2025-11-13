'use client';

import { Loader2, ArrowDown } from 'lucide-react';
import { LoadMoreButtonProps } from '@/types';

export default function LoadMoreButton({ onLoadMore, isLoading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          🎉 You&apos;ve reached the end! That&apos;s all the stories for now.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className="load-more-btn text-white px-8 py-4 font-medium rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Loading more stories...</span>
          </>
        ) : (
          <>
            <ArrowDown size={20} />
            <span>Load More Stories</span>
          </>
        )}
      </button>
    </div>
  );
}