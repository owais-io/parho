import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gpt-oss:20b';

const contentDirectory = path.join(process.cwd(), 'content', 'articles');

interface MDXFrontmatter {
  title: string;
  summary: string;
  section: string;
  category?: string;
  imageUrl: string;
  publishedAt: string;
  guardianId: string;
}

/**
 * Generate category from summary using Ollama
 */
async function generateCategoryFromSummary(title: string, summary: string): Promise<string> {
  const prompt = `You are categorizing news article summaries. Based on the title and summary below, provide a specific category (1-3 words) that captures what the story is really about.

Good examples: "NATO & Defense", "Human Rights", "Housing Market", "Local Elections", "Climate Policy", "Tech Industry", "Immigration Law", "Public Health", "Criminal Justice", "Energy Policy", "Trade & Tariffs", "Labor Rights", "Sports", "Entertainment", "Science & Research", "Education Policy", "Financial Markets"

Bad examples: "Politics" (too vague), "News" (meaningless), "World" (too broad), "Business" (too generic)

Title: ${title}

Summary: ${summary}

Respond with ONLY the category name, nothing else. For example: Climate Policy`;

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    let category = data.response.trim();

    // Clean up the category - remove any extra text
    category = category.split('\n')[0].trim();

    // Limit to max 3 words
    const words = category.split(/\s+/);
    if (words.length > 3) {
      category = words.slice(0, 3).join(' ');
    }

    return category || 'News';
  } catch (error) {
    console.error('Ollama category generation error:', error);
    throw error;
  }
}

/**
 * Get all MDX files that need category generation
 */
function getMDXFilesWithoutCategory(): { filename: string; frontmatter: MDXFrontmatter; content: string }[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const files = fs.readdirSync(contentDirectory);
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

  const filesWithoutCategory: { filename: string; frontmatter: MDXFrontmatter; content: string }[] = [];

  for (const filename of mdxFiles) {
    try {
      const filePath = path.join(contentDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContents);
      const frontmatter = data as MDXFrontmatter;

      // Check if category is missing or empty
      if (!frontmatter.category) {
        filesWithoutCategory.push({ filename, frontmatter, content });
      }
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
    }
  }

  return filesWithoutCategory;
}

/**
 * Update MDX file with new category
 */
function updateMDXFileWithCategory(filename: string, frontmatter: MDXFrontmatter, content: string, category: string): void {
  const filePath = path.join(contentDirectory, filename);

  // Escape quotes in values for YAML
  const escapeYaml = (str: string) => str.replace(/"/g, '\\"');

  // Manually build MDX content with new category
  const mdxContent = `---
title: "${escapeYaml(frontmatter.title)}"
summary: "${escapeYaml(frontmatter.summary)}"
section: "${frontmatter.section || 'News'}"
category: "${escapeYaml(category)}"
imageUrl: "${frontmatter.imageUrl || ''}"
publishedAt: "${frontmatter.publishedAt}"
guardianId: "${frontmatter.guardianId}"
---

${content.trim()}
`;

  fs.writeFileSync(filePath, mdxContent, 'utf-8');
}

// GET endpoint to check status/count
export async function GET() {
  try {
    const filesWithoutCategory = getMDXFilesWithoutCategory();

    // Count total MDX files
    const allFiles = fs.existsSync(contentDirectory)
      ? fs.readdirSync(contentDirectory).filter(f => f.endsWith('.mdx')).length
      : 0;

    return NextResponse.json({
      success: true,
      totalMDXFiles: allFiles,
      filesWithoutCategory: filesWithoutCategory.length,
      filesWithCategory: allFiles - filesWithoutCategory.length,
    });
  } catch (error) {
    console.error('Error checking category status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST endpoint to start category generation (streaming)
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Check if Ollama is running
        try {
          const statusResponse = await fetch('http://localhost:11434/api/tags');
          if (!statusResponse.ok) {
            throw new Error('Ollama is not running');
          }
        } catch {
          sendEvent({ type: 'error', message: 'Ollama is not running. Please start Ollama first.' });
          controller.close();
          return;
        }

        const filesWithoutCategory = getMDXFilesWithoutCategory();
        const total = filesWithoutCategory.length;

        console.log(`\n========================================`);
        console.log(`CATEGORY GENERATION STARTED`);
        console.log(`Total files to process: ${total}`);
        console.log(`========================================\n`);

        sendEvent({
          type: 'start',
          total,
          message: `Starting category generation for ${total} files...`
        });

        if (total === 0) {
          console.log('No files need category generation. All done!');
          sendEvent({ type: 'complete', processed: 0, message: 'All files already have categories!' });
          controller.close();
          return;
        }

        let processed = 0;
        let errors = 0;

        for (const file of filesWithoutCategory) {
          const startTime = Date.now();

          try {
            console.log(`[${processed + 1}/${total}] Processing: ${file.filename}`);
            console.log(`  Title: ${file.frontmatter.title.substring(0, 60)}...`);

            sendEvent({
              type: 'processing',
              current: processed + 1,
              total,
              filename: file.filename,
              title: file.frontmatter.title
            });

            // Generate category using Ollama
            const category = await generateCategoryFromSummary(
              file.frontmatter.title,
              file.frontmatter.summary
            );

            // Update the MDX file
            updateMDXFileWithCategory(file.filename, file.frontmatter, file.content, category);

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`  Generated category: "${category}"`);
            console.log(`  Duration: ${duration}s`);
            console.log(`  Status: SUCCESS\n`);

            processed++;

            sendEvent({
              type: 'processed',
              current: processed,
              total,
              filename: file.filename,
              category,
              duration: parseFloat(duration)
            });

          } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            console.error(`  ERROR: ${errorMessage}`);
            console.log(`  Duration: ${duration}s`);
            console.log(`  Status: FAILED\n`);

            errors++;
            processed++;

            sendEvent({
              type: 'error',
              current: processed,
              total,
              filename: file.filename,
              error: errorMessage
            });
          }
        }

        console.log(`\n========================================`);
        console.log(`CATEGORY GENERATION COMPLETE`);
        console.log(`Total processed: ${processed}`);
        console.log(`Successful: ${processed - errors}`);
        console.log(`Errors: ${errors}`);
        console.log(`========================================\n`);

        sendEvent({
          type: 'complete',
          processed,
          errors,
          message: `Completed! ${processed - errors} categories generated, ${errors} errors.`
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Category generation failed:', errorMessage);
        sendEvent({ type: 'error', message: errorMessage });
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
