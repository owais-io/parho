const fs = require('fs');
const path = require('path');

console.log('🧹 Running post-build cleanup...');

const outDir = path.join(__dirname, '..', 'out');

// Remove admin directory and files
const adminDir = path.join(outDir, 'admin');
const adminHtml = path.join(outDir, 'admin.html');

if (fs.existsSync(adminDir)) {
  fs.rmSync(adminDir, { recursive: true, force: true });
  console.log('✅ Removed /admin directory');
}

if (fs.existsSync(adminHtml)) {
  fs.unlinkSync(adminHtml);
  console.log('✅ Removed admin.html');
}

// Remove summaries directory and files
const summariesDir = path.join(outDir, 'summaries');
const summariesHtml = path.join(outDir, 'summaries.html');

if (fs.existsSync(summariesDir)) {
  fs.rmSync(summariesDir, { recursive: true, force: true });
  console.log('✅ Removed /summaries directory');
}

if (fs.existsSync(summariesHtml)) {
  fs.unlinkSync(summariesHtml);
  console.log('✅ Removed summaries.html');
}

console.log('✨ Post-build cleanup completed!');
