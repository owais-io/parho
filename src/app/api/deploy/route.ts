import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST - Deploy summary as MDX file
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guardianId, title, summary, section, category, imageUrl, publishedDate } = body;

    if (!guardianId || !title || !summary) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title (lowercase, replace spaces with hyphens, remove special chars)
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Format date for frontmatter (ISO format)
    const formattedDate = publishedDate || new Date().toISOString();

    // Create MDX content with frontmatter
    // Use category from Ollama if available, otherwise fall back to section
    const mdxContent = `---
title: "${title.replace(/"/g, '\\"')}"
summary: "${summary.replace(/"/g, '\\"')}"
section: "${section || 'news'}"
category: "${category || section || 'News'}"
imageUrl: "${imageUrl || ''}"
publishedAt: "${formattedDate}"
guardianId: "${guardianId}"
---

${summary}
`;

    // Define the file path
    const contentDir = path.join(process.cwd(), 'content', 'articles');
    const filePath = path.join(contentDir, `${slug}.mdx`);

    // Ensure the directory exists
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Article with this slug already exists' },
        { status: 409 }
      );
    }

    // Write the MDX file
    fs.writeFileSync(filePath, mdxContent, 'utf-8');

    return NextResponse.json({
      success: true,
      filename: `${slug}.mdx`,
      slug,
      message: 'Successfully deployed to website',
    });
  } catch (error) {
    console.error('Deploy API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy article' },
      { status: 500 }
    );
  }
}
