'use client';

import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} className="block group">
      <div className="article-card bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-primary-300 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <FileText className="text-primary-600" size={24} />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'} available
            </p>
            
            <div className="flex items-center text-primary-600 group-hover:text-primary-700 font-medium text-sm">
              <span>Explore articles</span>
              <ArrowRight 
                size={16} 
                className="ml-1 transform group-hover:translate-x-1 transition-transform" 
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}