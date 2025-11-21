'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Github } from 'lucide-react';
import { Category } from '@/types';

interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const topCategories = categories.slice(0, 10);

  return (
    <header className="glassmorphism fixed top-0 left-0 right-0 z-50 border-b border-gray-200/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="gradient-text font-['Playfair_Display']">parho</span>
              <span className="text-primary-600">.net</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-md transition-all"
            >
              Home
            </Link>

            {/* Top Categories */}
            {topCategories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-md transition-all"
              >
                {category.name}
              </Link>
            ))}

            {/* View All Categories - Separated */}
            <div className="ml-2 pl-4 border-l border-gray-300">
              <Link
                href="/categories"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all inline-block"
              >
                View All Categories
              </Link>
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/owais-io/parho"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all text-sm font-medium"
            >
              <Github className="h-5 w-5" />
              View Code on GitHub
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/20 py-4">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-md transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Categories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="px-3 py-2 pl-6 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-md transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}

              {/* GitHub Link for Mobile */}
              <a
                href="https://github.com/owais-io/parho"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all text-sm font-medium mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="h-5 w-5" />
                View Code on GitHub
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}