import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article, Category } from '@/types';

const contentDirectory = path.join(process.cwd(), 'content', 'articles');

// Interface for MDX frontmatter
interface MDXFrontmatter {
  title: string;
  summary: string;
  section: string;
  category?: string;
  imageUrl: string;
  publishedAt: string;
  guardianId: string;
}

// Get all MDX files from the content directory
export function getAllMDXFiles(): string[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const files = fs.readdirSync(contentDirectory);
  return files.filter((file) => file.endsWith('.mdx'));
}

// Read and parse a single MDX file
export function parseMDXFile(filename: string): Article | null {
  try {
    const filePath = path.join(contentDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContents);

    const frontmatter = data as MDXFrontmatter;

    // Generate slug from filename (remove .mdx extension)
    const slug = filename.replace(/\.mdx$/, '');

    // Convert to Article format
    // Use category from Ollama if available, otherwise fall back to section
    const article: Article = {
      id: frontmatter.guardianId || slug,
      title: frontmatter.title,
      summary: frontmatter.summary,
      imageUrl: frontmatter.imageUrl || '',
      category: frontmatter.category || frontmatter.section || 'News',
      publishedAt: frontmatter.publishedAt,
      slug,
    };

    return article;
  } catch (error) {
    console.error(`Error parsing MDX file ${filename}:`, error);
    return null;
  }
}

// Get all articles from MDX files
export function getAllArticles(): Article[] {
  const files = getAllMDXFiles();
  const articles = files
    .map((filename) => parseMDXFile(filename))
    .filter((article): article is Article => article !== null);

  // Sort by publishedAt in descending order (newest first)
  articles.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });

  return articles;
}

// Helper function to generate URL-safe slugs
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get articles by category
export function getArticlesByCategory(categorySlug: string): Article[] {
  const allArticles = getAllArticles();

  return allArticles.filter((article) => {
    const articleCategorySlug = generateSlug(article.category);
    return articleCategorySlug === categorySlug;
  });
}

// Get article by slug
export function getArticleBySlug(slug: string): Article | null {
  const filename = `${slug}.mdx`;
  return parseMDXFile(filename);
}

// Get all unique categories from articles
export function getAllCategories(): Category[] {
  const allArticles = getAllArticles();

  // Create a map to count articles per category and track latest post date
  const categoryMap = new Map<string, { name: string; count: number; latestPostDate: string }>();

  allArticles.forEach((article) => {
    const categorySlug = generateSlug(article.category);

    if (categoryMap.has(categorySlug)) {
      const existing = categoryMap.get(categorySlug)!;
      // Compare dates and keep the most recent one
      const existingDate = new Date(existing.latestPostDate).getTime();
      const currentDate = new Date(article.publishedAt).getTime();

      categoryMap.set(categorySlug, {
        name: article.category,
        count: existing.count + 1,
        latestPostDate: currentDate > existingDate ? article.publishedAt : existing.latestPostDate,
      });
    } else {
      categoryMap.set(categorySlug, {
        name: article.category,
        count: 1,
        latestPostDate: article.publishedAt,
      });
    }
  });

  // Convert map to Category array
  const categories: Category[] = [];
  let id = 1;

  categoryMap.forEach((value, slug) => {
    categories.push({
      id: id.toString(),
      name: value.name,
      slug,
      articleCount: value.count,
      latestPostDate: value.latestPostDate,
    });
    id++;
  });

  // Sort by latest post date (descending) - most recent category first
  categories.sort((a, b) => {
    const dateA = new Date(a.latestPostDate || 0).getTime();
    const dateB = new Date(b.latestPostDate || 0).getTime();
    return dateB - dateA;
  });

  return categories;
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  const categories = getAllCategories();
  return categories.find((category) => category.slug === slug);
}
