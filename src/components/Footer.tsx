import Link from 'next/link';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="text-2xl font-bold">
                <span className="gradient-text font-['Playfair_Display']">parho</span>
                <span className="text-primary-400">.net</span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              Stay informed with curated news summaries from The Guardian, 
              powered by AI to bring you the most important stories in digestible formats.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/categories/international-relations-diplomacy" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  World News
                </Link>
              </li>
              <li>
                <Link href="/categories/artificial-intelligence-news" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/categories/domestic-political-affairs" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Politics
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/stock-market-and-trading" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/categories/premier-league-match-reports" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/categories/environment-and-climate" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Environment
                </Link>
              </li>
              <li>
                <Link href="/categories/nhs-healthcare-crisis" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Health
                </Link>
              </li>
              <li>
                <Link href="/categories/media-and-journalism" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Culture
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} parho.net. All rights reserved.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="mx-1 h-4 w-4 text-red-500" fill="currentColor" />
              <span>by Owais</span>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs mt-4">
            News content powered by The Guardian API • Summaries generated by Ollama AI
          </div>
        </div>
      </div>
    </footer>
  );
}