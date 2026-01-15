import { NextResponse } from 'next/server';
import { getArticleById, deleteArticle } from '@/lib/db';
import { saveSummary, isArticleProcessed } from '@/lib/db';
import { processArticleWithOllama, checkOllamaStatus } from '@/lib/ollama';

// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';

// POST - Process article(s) through Ollama
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guardianIds, deleteAfterProcessing = false } = body; // Array of Guardian article IDs and delete flag

    if (!guardianIds || !Array.isArray(guardianIds) || guardianIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No article IDs provided' },
        { status: 400 }
      );
    }

    // Check if Ollama is running
    const ollamaRunning = await checkOllamaStatus();
    if (!ollamaRunning) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ollama is not running. Please start Ollama first.'
        },
        { status: 503 }
      );
    }

    const results = [];
    const errors = [];

    for (const guardianId of guardianIds) {
      try {
        // Check if already processed
        if (isArticleProcessed(guardianId)) {
          // Delete article from articles table if requested (even if skipped)
          if (deleteAfterProcessing) {
            deleteArticle(guardianId);
          }

          results.push({
            guardianId,
            status: 'skipped',
            message: 'Already processed',
          });
          continue;
        }

        // Get article from database
        const article = getArticleById(guardianId);
        if (!article) {
          errors.push({
            guardianId,
            error: 'Article not found in database',
          });
          continue;
        }

        // Get article body text from database (already fetched in initial call)
        const bodyText = article.bodyText || article.trailText || '';

        if (!bodyText) {
          errors.push({
            guardianId,
            error: 'No article content available. Article may need to be re-fetched with bodyText field.',
          });
          continue;
        }

        // Track processing start time
        const startTime = Date.now();

        // Process through Ollama (this takes 2-5 minutes)
        const processed = await processArticleWithOllama({
          title: article.webTitle,
          body: bodyText,
        });

        // Calculate processing duration in seconds
        const endTime = Date.now();
        const durationSeconds = (endTime - startTime) / 1000;

        // Save to summaries table
        saveSummary({
          guardianId: article.id,
          transformedTitle: processed.transformedTitle,
          summary: processed.summary,
          section: article.sectionName,
          category: processed.category,
          imageUrl: article.thumbnail || undefined,
          publishedDate: article.webPublicationDate,
          processingDurationSeconds: durationSeconds,
        });

        // Delete article from articles table if requested
        if (deleteAfterProcessing) {
          deleteArticle(article.id);
        }

        results.push({
          guardianId,
          status: 'success',
          transformedTitle: processed.transformedTitle,
          summary: processed.summary,
          category: processed.category,
        });

      } catch (error) {
        console.error(`Error processing article ${guardianId}:`, error);
        errors.push({
          guardianId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errorCount: errors.length,
      results,
      errors,
    });

  } catch (error) {
    console.error('Process API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process articles' },
      { status: 500 }
    );
  }
}
