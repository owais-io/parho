import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'articles.db');
const db = new Database(dbPath);

// Create articles table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    type TEXT,
    sectionId TEXT,
    sectionName TEXT,
    webPublicationDate TEXT,
    webTitle TEXT,
    webUrl TEXT,
    pillarId TEXT,
    pillarName TEXT,
    thumbnail TEXT,
    trailText TEXT,
    byline TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create fetched_article_ids table to track all fetched article IDs
// This table persists IDs even when articles are deleted, to prevent duplicate fetching
db.exec(`
  CREATE TABLE IF NOT EXISTS fetched_article_ids (
    id TEXT PRIMARY KEY,
    fetchedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrate summaries table to remove foreign key constraint
// Check if old table exists and migrate if needed
const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='summaries'").get() as { sql: string } | undefined;

if (tableInfo && tableInfo.sql.includes('FOREIGN KEY')) {
  // Old table with foreign key exists - migrate it
  db.exec(`
    -- Create new table without foreign key
    CREATE TABLE summaries_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guardianId TEXT UNIQUE NOT NULL,
      transformedTitle TEXT NOT NULL,
      summary TEXT NOT NULL,
      section TEXT,
      imageUrl TEXT,
      publishedDate TEXT,
      processedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Copy data from old table
    INSERT INTO summaries_new (id, guardianId, transformedTitle, summary, section, imageUrl, publishedDate, processedAt)
    SELECT id, guardianId, transformedTitle, summary, section, imageUrl, publishedDate, processedAt
    FROM summaries;

    -- Drop old table
    DROP TABLE summaries;

    -- Rename new table
    ALTER TABLE summaries_new RENAME TO summaries;
  `);
} else if (!tableInfo) {
  // Table doesn't exist - create it fresh
  db.exec(`
    CREATE TABLE summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guardianId TEXT UNIQUE NOT NULL,
      transformedTitle TEXT NOT NULL,
      summary TEXT NOT NULL,
      section TEXT,
      imageUrl TEXT,
      publishedDate TEXT,
      processedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
// If table exists without FK, do nothing

export interface Article {
  id: string;
  type: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  pillarId?: string;
  pillarName?: string;
  thumbnail?: string;
  trailText?: string;
  byline?: string;
  createdAt?: string;
}

export interface Summary {
  id: number;
  guardianId: string;
  transformedTitle: string;
  summary: string;
  section: string | null;
  imageUrl: string | null;
  publishedDate: string | null;
  processedAt: string;
}

// Insert or update article
export function saveArticle(article: any) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO articles (
      id, type, sectionId, sectionName, webPublicationDate,
      webTitle, webUrl, pillarId, pillarName, thumbnail, trailText, byline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    article.id,
    article.type,
    article.sectionId,
    article.sectionName,
    article.webPublicationDate,
    article.webTitle,
    article.webUrl,
    article.pillarId || null,
    article.pillarName || null,
    article.fields?.thumbnail || null,
    article.fields?.trailText || null,
    article.fields?.byline || null
  );
}

// Save multiple articles and track their IDs
export function saveArticles(articles: any[]) {
  const insert = db.transaction((articles) => {
    for (const article of articles) {
      saveArticle(article);
      // Also track the article ID
      trackFetchedArticleId(article.id);
    }
  });

  return insert(articles);
}

// Get all articles
export function getAllArticles(): Article[] {
  const stmt = db.prepare('SELECT * FROM articles ORDER BY webPublicationDate DESC');
  return stmt.all() as Article[];
}

// Get paginated articles
export function getArticlesPaginated(page: number = 1, limit: number = 100): {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
} {
  const offset = (page - 1) * limit;

  // Get total count
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM articles');
  const { count } = countStmt.get() as { count: number };

  // Get paginated results
  const stmt = db.prepare('SELECT * FROM articles ORDER BY webPublicationDate DESC LIMIT ? OFFSET ?');
  const articles = stmt.all(limit, offset) as Article[];

  return {
    articles,
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  };
}

// Get article by ID
export function getArticleById(id: string): Article | undefined {
  const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
  return stmt.get(id) as Article | undefined;
}

// Delete article by ID
export function deleteArticle(id: string) {
  const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
  return stmt.run(id);
}

// Delete multiple articles by IDs
export function deleteArticles(ids: string[]) {
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM articles WHERE id IN (${placeholders})`);
  return stmt.run(...ids);
}

// Count total articles
export function countArticles(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM articles');
  const result = stmt.get() as { count: number };
  return result.count;
}

// ===== Fetched Article ID Tracking Functions =====

// Track a fetched article ID (persists even if article is deleted)
export function trackFetchedArticleId(id: string) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO fetched_article_ids (id) VALUES (?)
  `);
  return stmt.run(id);
}

// Check if an article ID has been fetched before
export function isArticleFetched(id: string): boolean {
  const stmt = db.prepare('SELECT id FROM fetched_article_ids WHERE id = ?');
  const result = stmt.get(id);
  return result !== undefined;
}

// Check multiple article IDs and return only new (unfetched) IDs
export function filterNewArticleIds(ids: string[]): string[] {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT id FROM fetched_article_ids WHERE id IN (${placeholders})
  `);
  const fetchedIds = stmt.all(...ids) as { id: string }[];
  const fetchedIdSet = new Set(fetchedIds.map(row => row.id));

  return ids.filter(id => !fetchedIdSet.has(id));
}

// Get count of all fetched article IDs (including deleted articles)
export function countFetchedArticleIds(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM fetched_article_ids');
  const result = stmt.get() as { count: number };
  return result.count;
}

// ===== Summary (Processed Articles) Functions =====

// Save a processed summary
export function saveSummary(data: {
  guardianId: string;
  transformedTitle: string;
  summary: string;
  section?: string;
  imageUrl?: string;
  publishedDate?: string;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO summaries (
      guardianId, transformedTitle, summary, section, imageUrl, publishedDate
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    data.guardianId,
    data.transformedTitle,
    data.summary,
    data.section || null,
    data.imageUrl || null,
    data.publishedDate || null
  );
}

// Get all summaries
export function getAllSummaries(): Summary[] {
  const stmt = db.prepare('SELECT * FROM summaries ORDER BY publishedDate DESC');
  return stmt.all() as Summary[];
}

// Get summary by Guardian ID
export function getSummaryByGuardianId(guardianId: string): Summary | undefined {
  const stmt = db.prepare('SELECT * FROM summaries WHERE guardianId = ?');
  return stmt.get(guardianId) as Summary | undefined;
}

// Check if article has been processed
export function isArticleProcessed(guardianId: string): boolean {
  const stmt = db.prepare('SELECT id FROM summaries WHERE guardianId = ?');
  const result = stmt.get(guardianId);
  return result !== undefined;
}

// Delete summary
export function deleteSummary(guardianId: string) {
  const stmt = db.prepare('DELETE FROM summaries WHERE guardianId = ?');
  return stmt.run(guardianId);
}

// Count total summaries
export function countSummaries(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM summaries');
  const result = stmt.get() as { count: number };
  return result.count;
}

export default db;
