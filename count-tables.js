const Database = require('better-sqlite3');

const db = new Database('articles.db');

console.log('\n=== Database Table Record Counts ===\n');

const tables = ['articles', 'fetched_article_ids', 'summaries'];

tables.forEach(table => {
  const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  console.log(`${table.padEnd(25)} ${result.count}`);
});

console.log('');

db.close();
