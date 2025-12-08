import { Article, Category } from '@/types';

const SITE_URL = 'https://parho.net';
const SITE_NAME = 'parho.net';
const SITE_DESCRIPTION = 'AI-powered news summaries from The Guardian';

/**
 * Organization Schema
 * Shows your site as an organization in search results
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-image.jpg`,
      width: 1200,
      height: 630,
    },
    sameAs: [
      // Add your social media profiles here
      // 'https://twitter.com/parho',
      // 'https://facebook.com/parho',
    ],
  };
}

/**
 * WebSite Schema
 * Enables search box in Google results
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/categories?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * NewsArticle Schema
 * Rich results for individual articles
 */
export function getNewsArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: article.imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'The Guardian',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${article.slug}`,
    },
  };
}

/**
 * ItemList Schema for Article Collections
 * Shows article lists in search results
 */
export function getItemListSchema(articles: Article[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/articles/${article.slug}`,
      name: article.title,
    })),
  };
}

/**
 * BreadcrumbList Schema
 * Shows navigation breadcrumbs in search results
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * CollectionPage Schema for Category Pages
 * Helps Google understand category/collection pages
 */
export function getCollectionPageSchema(category: Category) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - ${SITE_NAME}`,
    description: `Browse ${category.articleCount} articles in the ${category.name} category`,
    url: `${SITE_URL}/categories/${category.slug}`,
    breadcrumb: getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Categories', url: `${SITE_URL}/categories` },
      { name: category.name, url: `${SITE_URL}/categories/${category.slug}` },
    ]),
    about: {
      '@type': 'Thing',
      name: category.name,
    },
  };
}
