import { NextResponse } from 'next/server';
import { getArticleById, deleteArticle } from '@/lib/db';
import { saveSummary, isArticleProcessed } from '@/lib/db';
import { processArticleWithOllama, checkOllamaStatus } from '@/lib/ollama';

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

        // Fetch full article content from Guardian API
        const apiKey = process.env.GUARDIAN_API_KEY;
        const guardianUrl = `https://content.guardianapis.com/${guardianId}?api-key=${apiKey}&show-fields=bodyText,body,trailText`;

        const guardianResponse = await fetch(guardianUrl);
        if (!guardianResponse.ok) {
          throw new Error('Failed to fetch article from Guardian API');
        }

        const guardianData = await guardianResponse.json();
        const fullArticle = guardianData.response.content;

        // Get article body text
        const bodyText = fullArticle.fields?.bodyText || fullArticle.fields?.body || fullArticle.fields?.trailText || '';

        if (!bodyText) {
          errors.push({
            guardianId,
            error: 'No article content available',
          });
          continue;
        }

        // Process through Ollama (this takes 2-5 minutes)
        const processed = await processArticleWithOllama({
          title: article.webTitle,
          body: bodyText,
        });

        // Save to summaries table
        saveSummary({
          guardianId: article.id,
          transformedTitle: processed.transformedTitle,
          summary: processed.summary,
          section: article.sectionName,
          imageUrl: article.thumbnail || undefined,
          publishedDate: article.webPublicationDate,
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
