'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2, RefreshCw, Download, Cpu, Link as LinkIcon } from 'lucide-react';

interface GuardianArticle {
  id: string;
  type: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  pillarName?: string;
  fields?: {
    thumbnail?: string;
    trailText?: string;
    byline?: string;
  };
}

interface QueueItem {
  article: GuardianArticle;
  status: 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
}

export default function AdminPage() {
  const [articles, setArticles] = useState<GuardianArticle[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const articlesPerPage = 100;

  // Load articles from database
  const loadArticlesFromDB = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
        setTotalArticles(data.total);
        setCurrentPage(1); // Reset to first page when loading new articles
      } else {
        setError(data.error || 'Failed to load articles');
      }
    } catch (err) {
      setError('Failed to load articles from database');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch new articles from Guardian API
  const fetchFromGuardian = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/guardian?days=${selectedDays}`);
      const data = await response.json();

      if (data.success) {
        // Show success message with statistics
        const message = `Fetched ${data.fetched} articles from last ${selectedDays} day(s): ${data.new} new, ${data.duplicates} duplicates skipped`;
        setSuccess(message);

        // Reload from database to show saved articles
        await loadArticlesFromDB();

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || 'Failed to fetch articles');
      }
    } catch (err) {
      setError('Failed to fetch articles from Guardian API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticlesFromDB();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSectionDropdown && !target.closest('.section-filter-dropdown')) {
        setShowSectionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSectionDropdown]);

  const handleSelectAll = (checked: boolean) => {
    // Use filteredArticles for select all
    const filteredArts = selectedSections.size === 0
      ? articles
      : articles.filter(article => selectedSections.has(article.sectionName));

    // Calculate current page articles from filtered set
    const startIdx = (currentPage - 1) * articlesPerPage;
    const endIdx = startIdx + articlesPerPage;
    const currentPageArticles = filteredArts.slice(startIdx, endIdx);

    if (checked) {
      // Select all articles on current page
      const newSelected = new Set(selectedArticles);
      currentPageArticles.forEach(article => newSelected.add(article.id));
      setSelectedArticles(newSelected);
    } else {
      // Deselect all articles on current page
      const newSelected = new Set(selectedArticles);
      currentPageArticles.forEach(article => newSelected.delete(article.id));
      setSelectedArticles(newSelected);
    }
  };

  const handleToggleSection = (sectionName: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionName)) {
      newSelected.delete(sectionName);
    } else {
      newSelected.add(sectionName);
    }
    setSelectedSections(newSelected);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setSelectedSections(new Set());
    setCurrentPage(1);
  };

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles?id=${articleId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        // Remove from UI
        setArticles(articles.filter(article => article.id !== articleId));
        const newSelected = new Set(selectedArticles);
        newSelected.delete(articleId);
        setSelectedArticles(newSelected);
        setTotalArticles(prev => prev - 1);
      } else {
        setError(data.error || 'Failed to delete article');
      }
    } catch (err) {
      setError('Failed to delete article');
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const idsToDelete = Array.from(selectedArticles);
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      const data = await response.json();

      if (data.success) {
        // Remove from UI
        setArticles(articles.filter(article => !selectedArticles.has(article.id)));
        setTotalArticles(prev => prev - data.count);
        setSelectedArticles(new Set());
      } else {
        setError(data.error || 'Failed to delete articles');
      }
    } catch (err) {
      setError('Failed to bulk delete articles');
      console.error(err);
    }
  };

  // Add article(s) to processing queue
  const addToQueue = (articleIds: string[]) => {
    const articlesToAdd = articles.filter(a => articleIds.includes(a.id));
    const newQueueItems: QueueItem[] = articlesToAdd.map(article => ({
      article,
      status: 'queued' as const,
    }));

    // Add to queue
    setProcessingQueue(prev => [...prev, ...newQueueItems]);

    // Remove from main list
    setArticles(prev => prev.filter(a => !articleIds.includes(a.id)));
    setSelectedArticles(new Set());
  };

  // Process individual article
  const handleProcessArticle = (articleId: string) => {
    addToQueue([articleId]);
  };

  // Process multiple articles
  const handleBulkProcess = () => {
    const idsToProcess = Array.from(selectedArticles);
    addToQueue(idsToProcess);
  };

  // Process queue sequentially
  useEffect(() => {
    const processNext = async () => {
      // Find first queued item
      const nextItem = processingQueue.find(item => item.status === 'queued');
      if (!nextItem) return;

      // Find if anything is currently processing
      const isProcessing = processingQueue.some(item => item.status === 'processing');
      if (isProcessing) return;

      // Mark as processing
      setProcessingQueue(prev =>
        prev.map(item =>
          item.article.id === nextItem.article.id
            ? { ...item, status: 'processing' as const }
            : item
        )
      );

      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guardianIds: [nextItem.article.id],
            deleteAfterProcessing: true,
          }),
        });
        const data = await response.json();

        if (data.success && data.results.length > 0) {
          const result = data.results[0];
          if (result.status === 'success' || result.status === 'skipped') {
            // Mark as completed
            setProcessingQueue(prev =>
              prev.map(item =>
                item.article.id === nextItem.article.id
                  ? { ...item, status: 'completed' as const }
                  : item
              )
            );

            // Remove from queue after 2 seconds
            setTimeout(() => {
              setProcessingQueue(prev =>
                prev.filter(item => item.article.id !== nextItem.article.id)
              );
            }, 2000);

            // Update total count
            setTotalArticles(prev => prev - 1);
          } else {
            throw new Error('Processing failed');
          }
        } else {
          throw new Error(data.error || 'Failed to process');
        }
      } catch (err) {
        console.error('Process error:', err);
        setProcessingQueue(prev =>
          prev.map(item =>
            item.article.id === nextItem.article.id
              ? {
                  ...item,
                  status: 'error' as const,
                  error: err instanceof Error ? err.message : 'Unknown error',
                }
              : item
          )
        );
      }
    };

    processNext();
  }, [processingQueue]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Extract unique sections with article counts
  const sectionCounts = articles.reduce<Record<string, number>>((acc, article) => {
    const section = article.sectionName;
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {});

  const sections = Object.entries(sectionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

  // Filter articles by selected sections
  const filteredArticles = selectedSections.size === 0
    ? articles // No filter, show all
    : articles.filter(article => selectedSections.has(article.sectionName));

  // Pagination calculations (on filtered articles)
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  // Check if all articles on current page are selected
  const selectedOnPage = paginatedArticles.filter(article => selectedArticles.has(article.id)).length;
  const allSelected = paginatedArticles.length > 0 && selectedOnPage === paginatedArticles.length;
  const someSelected = selectedOnPage > 0 && selectedOnPage < paginatedArticles.length;
  const isProcessing = processingQueue.some(item => item.status === 'processing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage Guardian articles from the last {selectedDays} {selectedDays === 1 ? 'day' : 'days'}
                {selectedSections.size > 0 && (
                  <span className="ml-2 text-blue-600">
                    • Filtered by {selectedSections.size} {selectedSections.size === 1 ? 'section' : 'sections'}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="days-select" className="text-sm font-medium text-gray-700">
                  Time Range:
                </label>
                <select
                  id="days-select"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>Last 24 hours</option>
                  <option value={3}>Last 3 days</option>
                  <option value={7}>Last 7 days</option>
                  <option value={15}>Last 15 days</option>
                  <option value={30}>Last 30 days</option>
                </select>
              </div>

              {/* Section Filter Dropdown */}
              <div className="relative section-filter-dropdown">
                <button
                  onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  Filter Sections {selectedSections.size > 0 && `(${selectedSections.size})`}
                </button>

                {showSectionDropdown && (
                  <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                      <span className="text-sm font-medium text-gray-700">
                        Select Sections
                      </span>
                      {selectedSections.size > 0 && (
                        <button
                          onClick={handleClearFilters}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="p-2">
                      {sections.map((section) => (
                        <label
                          key={section.name}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSections.has(section.name)}
                            onChange={() => handleToggleSection(section.name)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="flex-1 text-sm text-gray-900">
                            {section.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({section.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <a
                href="/summaries"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                View Summaries
              </a>
              <button
                onClick={loadArticlesFromDB}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={fetchFromGuardian}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className={`w-4 h-4`} />
                Fetch New Articles
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Processing Queue */}
        {processingQueue.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-green-600 animate-pulse" />
              Processing Queue ({processingQueue.length})
            </h2>

            <div className="space-y-3">
              {processingQueue.map((item) => (
                <div
                  key={item.article.id}
                  className={`bg-white rounded-lg p-4 border-2 ${
                    item.status === 'processing'
                      ? 'border-green-500 shadow-lg'
                      : item.status === 'completed'
                      ? 'border-blue-500'
                      : item.status === 'error'
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {item.status === 'processing' && (
                          <Cpu className="w-5 h-5 text-green-600 animate-pulse flex-shrink-0" />
                        )}
                        {item.status === 'queued' && (
                          <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        {item.status === 'completed' && (
                          <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-red-600 text-xl flex-shrink-0">✗</span>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.article.webTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.article.sectionName} • {new Date(item.article.webPublicationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {item.status === 'processing' && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <div className="flex-1 bg-green-200 rounded-full h-2 overflow-hidden">
                              <div className="bg-green-600 h-full rounded-full animate-pulse w-full"></div>
                            </div>
                            <span className="text-xs font-medium">Processing... (2-5 min)</span>
                          </div>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <p className="text-sm text-green-700 mt-2 font-medium">
                          ✓ Processed successfully! Removing...
                        </p>
                      )}

                      {item.status === 'error' && (
                        <p className="text-sm text-red-700 mt-2">
                          Error: {item.error || 'Unknown error'}
                        </p>
                      )}

                      {item.status === 'queued' && (
                        <p className="text-sm text-gray-500 mt-2">
                          Waiting in queue...
                        </p>
                      )}
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'processing'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats and Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{totalArticles.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {selectedSections.size > 0 ? 'Filtered' : 'Loaded'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredArticles.length}
                  {selectedSections.size > 0 && (
                    <span className="text-base text-gray-500 ml-1">
                      / {articles.length}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">{currentPage}/{totalPages}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-blue-600">{selectedArticles.size}</p>
              </div>
            </div>

            {selectedArticles.size > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkProcess}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Cpu className="w-4 h-4" />
                  Process Selected ({selectedArticles.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedArticles.size})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading articles...</p>
          </div>
        )}

        {/* Articles Table */}
        {!loading && articles.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedArticles.map((article) => (
                    <tr
                      key={article.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedArticles.has(article.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedArticles.has(article.id)}
                          onChange={(e) => handleSelectArticle(article.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {article.fields?.thumbnail && (
                            <img
                              src={article.fields.thumbnail}
                              alt=""
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <a
                              href={article.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                            >
                              {article.webTitle}
                            </a>
                            {article.fields?.byline && (
                              <p className="text-xs text-gray-500 mt-1">{article.fields.byline}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.sectionName}
                          </span>
                          {article.pillarName && (
                            <p className="text-xs text-gray-500 mt-1">{article.pillarName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(article.webPublicationDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleProcessArticle(article.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Add to processing queue"
                          >
                            <Cpu className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
                    {selectedSections.size > 0 && (
                      <span className="text-gray-500"> (filtered from {articles.length} total)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No articles found</p>
          </div>
        )}

        {/* No Results from Filter */}
        {!loading && articles.length > 0 && filteredArticles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-2">No articles match the selected filters</p>
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
