'use client';

import { useState, useMemo } from 'react';
import { ArrowUpAZ, TrendingUp, Clock, ChevronDown } from 'lucide-react';
import { Category } from '@/types';
import CategoryCard from './CategoryCard';

type SortOption = 'alphabetical' | 'articleCount' | 'recent';

interface CategorySorterProps {
  categories: Category[];
}

export default function CategorySorter({ categories }: CategorySorterProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'alphabetical', label: 'Alphabetically (A-Z)', icon: <ArrowUpAZ size={18} /> },
    { value: 'articleCount', label: 'Most Articles', icon: <TrendingUp size={18} /> },
    { value: 'recent', label: 'Most Recent', icon: <Clock size={18} /> },
  ];

  const sortedCategories = useMemo(() => {
    const sorted = [...categories];

    switch (sortBy) {
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'articleCount':
        sorted.sort((a, b) => b.articleCount - a.articleCount);
        break;
      case 'recent':
        sorted.sort((a, b) => {
          const dateA = new Date(a.latestPostDate || 0).getTime();
          const dateB = new Date(b.latestPostDate || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    return sorted;
  }, [categories, sortBy]);

  const currentSortOption = sortOptions.find(opt => opt.value === sortBy);

  return (
    <>
      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {categories.length} Categories Available
          </h2>
          <p className="text-gray-600 mt-1">
            Browse by topic to find the stories that matter to you
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2 text-gray-700">
              {currentSortOption?.icon}
              <span className="text-sm font-medium">{currentSortOption?.label}</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Sort By
                  </div>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        sortBy === option.value
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className={sortBy === option.value ? 'text-primary-600' : 'text-gray-400'}>
                        {option.icon}
                      </span>
                      <span className="text-sm font-medium">{option.label}</span>
                      {sortBy === option.value && (
                        <span className="ml-auto">
                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}
