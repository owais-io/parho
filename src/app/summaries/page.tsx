'use client';

import { useState, useEffect } from 'react';
import { Clock, RefreshCw, ArrowLeft, Sparkles, Trash2, Upload, Check } from 'lucide-react';
import Link from 'next/link';

interface Summary {
  id: number;
  guardianId: string;
  transformedTitle: string;
  summary: string;
  section: string | null;
  imageUrl: string | null;
  publishedDate: string | null;
  processedAt: string;
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeploying, setBulkDeploying] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadSummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/summaries');
      const data = await response.json();

      if (data.success) {
        setSummaries(data.summaries);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to load summaries');
      }
    } catch (err) {
      setError('Failed to load summaries from database');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  const handleDelete = async (guardianId: string, id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch('/api/summaries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardianId }),
      });

      const data = await response.json();
      if (data.success) {
        setSummaries(summaries.filter(s => s.id !== id));
        setTotal(total - 1);
      } else {
        setError(data.error || 'Failed to delete summary');
      }
    } catch (err) {
      setError('Failed to delete summary');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeploy = async (summary: Summary) => {
    setDeployingId(summary.id);
    setError(null);
    try {
      // Deploy the summary as MDX
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianId: summary.guardianId,
          title: summary.transformedTitle,
          summary: summary.summary,
          section: summary.section,
          imageUrl: summary.imageUrl,
          publishedDate: summary.publishedDate,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Deployment successful - now delete from summaries table
        const deleteResponse = await fetch('/api/summaries', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guardianId: summary.guardianId }),
        });

        const deleteData = await deleteResponse.json();
        if (deleteData.success) {
          // Remove from UI
          setSummaries(summaries.filter(s => s.id !== summary.id));
          setTotal(total - 1);
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(summary.id);
            return next;
          });
        } else {
          setError('Deployed successfully but failed to remove from summaries');
        }
      } else {
        setError(data.error || 'Failed to deploy summary');
      }
    } catch (err) {
      setError('Failed to deploy summary');
      console.error(err);
    } finally {
      setDeployingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === summaries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(summaries.map(s => s.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDeploy = async () => {
    if (selectedIds.size === 0) return;

    setBulkDeploying(true);
    setError(null);
    const selectedSummaries = summaries.filter(s => selectedIds.has(s.id));
    let successCount = 0;
    let failCount = 0;

    for (const summary of selectedSummaries) {
      try {
        const response = await fetch('/api/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guardianId: summary.guardianId,
            title: summary.transformedTitle,
            summary: summary.summary,
            section: summary.section,
            imageUrl: summary.imageUrl,
            publishedDate: summary.publishedDate,
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetch('/api/summaries', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guardianId: summary.guardianId }),
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Bulk deploy error:', err);
        failCount++;
      }
    }

    if (failCount > 0) {
      setError(`Deployed ${successCount} summaries, ${failCount} failed`);
    }

    setBulkDeploying(false);
    setSelectedIds(new Set());
    loadSummaries();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} summaries?`)) {
      return;
    }

    setBulkDeleting(true);
    setError(null);
    const selectedSummaries = summaries.filter(s => selectedIds.has(s.id));
    let successCount = 0;
    let failCount = 0;

    for (const summary of selectedSummaries) {
      try {
        const response = await fetch('/api/summaries', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guardianId: summary.guardianId }),
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Bulk delete error:', err);
        failCount++;
      }
    }

    if (failCount > 0) {
      setError(`Deleted ${successCount} summaries, ${failCount} failed`);
    }

    setBulkDeleting(false);
    setSelectedIds(new Set());
    loadSummaries();
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    Processed Summaries
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    AI-simplified Guardian articles
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={loadSummaries}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats and Bulk Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Summaries</p>
                <p className="text-2xl font-bold text-purple-600">{total}</p>
              </div>
              <div className="text-sm text-gray-500">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Articles processed through Ollama GPT-OSS 20B'}
              </div>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDeploy}
                  disabled={bulkDeploying}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Upload className={`w-4 h-4 ${bulkDeploying ? 'animate-pulse' : ''}`} />
                  {bulkDeploying ? 'Deploying...' : `Deploy ${selectedIds.size}`}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Trash2 className={`w-4 h-4 ${bulkDeleting ? 'animate-pulse' : ''}`} />
                  {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-4" />
            <p className="text-gray-600">Loading summaries...</p>
          </div>
        )}

        {/* Summaries List */}
        {!loading && summaries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === summaries.length && summaries.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <div className="w-20 text-xs font-semibold text-gray-600 uppercase">Image</div>
                <div className="flex-1 text-xs font-semibold text-gray-600 uppercase">Summary</div>
                <div className="w-48 text-xs font-semibold text-gray-600 uppercase text-center">Actions</div>
              </div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-200">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className={`px-4 py-4 hover:bg-gray-50 transition-colors ${selectedIds.has(summary.id) ? 'bg-purple-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <div className="flex items-center justify-center w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(summary.id)}
                        onChange={() => toggleSelect(summary.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 flex-shrink-0">
                      {summary.imageUrl ? (
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-200">
                          <img
                            src={summary.imageUrl}
                            alt={summary.transformedTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Summary Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {summary.section && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                            {summary.section}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                          {summary.transformedTitle}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {summary.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{summary.publishedDate ? formatDate(summary.publishedDate) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>AI Processed</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-48 flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDeploy(summary)}
                        disabled={deployingId === summary.id || bulkDeploying || bulkDeleting}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                      >
                        <Upload className={`w-3 h-3 ${deployingId === summary.id ? 'animate-pulse' : ''}`} />
                        {deployingId === summary.id ? 'Deploying' : 'Deploy'}
                      </button>
                      <button
                        onClick={() => handleDelete(summary.guardianId, summary.id)}
                        disabled={deletingId === summary.id || bulkDeploying || bulkDeleting}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                      >
                        <Trash2 className={`w-3 h-3 ${deletingId === summary.id ? 'animate-pulse' : ''}`} />
                        {deletingId === summary.id ? 'Deleting' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && summaries.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Sparkles className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Summaries Yet</h3>
            <p className="text-gray-600 mb-6">
              Process articles from the Admin Panel to see AI-generated summaries here.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Admin Panel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
