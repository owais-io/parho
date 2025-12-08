import { MetadataRoute } from 'next';
import { getAllCategories } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://parho.net';

  // Get all categories dynamically
  const categories = getAllCategories();

  // Homepage
  const homepage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  };

  // Categories listing page
  const categoriesPage = {
    url: `${baseUrl}/categories`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  };

  // Individual category pages
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.latestPostDate ? new Date(category.latestPostDate) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    homepage,
    categoriesPage,
    ...categoryPages,
  ];
}
