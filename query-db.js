// Script to delete articles by date range
const Database = require('better-sqlite3');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = new Database('articles.db');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('\n=== Delete Articles by Date Range ===\n');

    // Get current article count
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
    console.log(`Current total articles: ${totalCount}\n`);

    // Get date range from user
    const fromDate = await question('Enter FROM date (YYYY-MM-DD): ');
    const toDate = await question('Enter TO date (YYYY-MM-DD): ');

    // Validate dates
    if (!fromDate || !toDate) {
      console.log('\nError: Both dates are required.');
      return;
    }

    // Check how many articles will be affected
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM articles
      WHERE DATE(webPublicationDate) >= DATE(?)
      AND DATE(webPublicationDate) <= DATE(?)
    `);
    const matchCount = countStmt.get(fromDate, toDate).count;

    if (matchCount === 0) {
      console.log(`\nNo articles found between ${fromDate} and ${toDate}.`);
      return;
    }

    // Show sample of articles to be deleted
    console.log(`\nFound ${matchCount} articles between ${fromDate} and ${toDate}:`);
    const sampleStmt = db.prepare(`
      SELECT webTitle, webPublicationDate, sectionName
      FROM articles
      WHERE DATE(webPublicationDate) >= DATE(?)
      AND DATE(webPublicationDate) <= DATE(?)
      ORDER BY webPublicationDate DESC
      LIMIT 10
    `);
    const samples = sampleStmt.all(fromDate, toDate);

    samples.forEach((article, i) => {
      console.log(`${i + 1}. [${article.sectionName}] ${article.webTitle}`);
      console.log(`   Date: ${article.webPublicationDate}`);
    });

    if (matchCount > 10) {
      console.log(`... and ${matchCount - 10} more articles`);
    }

    // Confirm deletion
    const confirm = await question(`\nAre you sure you want to delete these ${matchCount} articles? (yes/no): `);

    if (confirm.toLowerCase() !== 'yes') {
      console.log('\nDeletion cancelled.');
      return;
    }

    // Perform deletion
    const deleteStmt = db.prepare(`
      DELETE FROM articles
      WHERE DATE(webPublicationDate) >= DATE(?)
      AND DATE(webPublicationDate) <= DATE(?)
    `);
    const result = deleteStmt.run(fromDate, toDate);

    console.log(`\n✓ Successfully deleted ${result.changes} articles.`);

    const newCount = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
    console.log(`Remaining articles: ${newCount}\n`);

  } catch (error) {
    console.error('\nError:', error.message);
  } finally {
    rl.close();
    db.close();
  }
}

main();
