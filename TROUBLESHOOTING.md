# Admin Panel Articles Not Displaying - Troubleshooting Guide

## Problem Summary
Articles are not displaying in the admin panel at `/admin`, even though the database contains articles.

## Root Cause
Next.js 14 tries to statically optimize API routes during build time. When API routes access server-side resources (like SQLite databases), they MUST be configured for dynamic rendering. Without this configuration, the routes return 500 errors.

## Affected API Routes
The following routes access the database and require `export const dynamic = 'force-dynamic'`:

1. **src/app/api/articles/route.ts** - Fetches articles for admin panel (CRITICAL)
2. **src/app/api/summaries/route.ts** - Fetches summaries
3. **src/app/api/process/route.ts** - Processes articles with Ollama
4. **src/app/api/guardian/route.ts** - Fetches articles from Guardian API

## Quick Diagnosis Steps

### Step 1: Check if dev server is running
```bash
netstat -ano | findstr ":3000.*LISTENING"
```
If nothing shows, start the dev server:
```bash
npm run dev
```

### Step 2: Test the API directly
```bash
curl -I http://localhost:3000/api/articles
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json
```

**Problem Response (500 error):**
```
HTTP/1.1 500 Internal Server Error
Content-Type: text/html
```

### Step 3: Verify database has articles
```bash
node -e "const Database = require('better-sqlite3'); const db = new Database('articles.db'); const result = db.prepare('SELECT COUNT(*) as count FROM articles').get(); console.log('Article count:', result.count); db.close();"
```

### Step 4: Check for missing dynamic export
```bash
grep -r "export const dynamic" src/app/api/
```

Should show at least 4 files with `export const dynamic = 'force-dynamic'`

## The Fix

Add this line to the TOP of EACH API route file (right after imports):

```typescript
// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';
```

### Example (src/app/api/articles/route.ts):
```typescript
import { NextResponse } from 'next/server';
import { getAllArticles, deleteArticle, deleteArticles, countArticles } from '@/lib/db';

// Force dynamic rendering - required for database access
export const dynamic = 'force-dynamic';

export async function GET() {
  // ... rest of the code
}
```

## After Making Changes

### 1. Restart the dev server
```bash
# Windows
netstat -ano | findstr ":3000.*LISTENING"  # Get PID
taskkill //F //PID <PID>                   # Kill process
npm run dev                                # Start fresh
```

### 2. Verify the fix
```bash
# Wait for dev server to start (10 seconds)
curl -s http://localhost:3000/api/articles | node -e "const data = require('fs').readFileSync(0, 'utf-8'); const json = JSON.parse(data); console.log('Success:', json.success); console.log('Total:', json.total);"
```

Should output:
```
Success: true
Total: <number of articles>
```

### 3. Test in browser
Navigate to `http://localhost:3000/admin` - articles should display

## Why This Keeps Happening

### Common Scenarios:
1. **After git pull/merge**: Someone else's code might be missing the export
2. **After creating new API routes**: New routes won't have the export by default
3. **After Next.js updates**: Build behavior might change

### Prevention:
- Always check for `export const dynamic = 'force-dynamic'` when creating new API routes that access databases
- Add a git pre-commit hook to check for this pattern
- Document this requirement in your project README

## Verification Checklist

Before considering the issue fixed:
- [ ] All 4 database API routes have `export const dynamic = 'force-dynamic'`
- [ ] Dev server has been restarted
- [ ] `curl -I http://localhost:3000/api/articles` returns 200 OK
- [ ] Admin panel displays articles in browser
- [ ] Fetch new articles button works
- [ ] Article processing works
- [ ] Summaries page works

## Additional Notes

### Database Location
The SQLite database is at: `D:\parho\articles.db`

### Common Commands
```bash
# Count articles in database
node -e "const Database = require('better-sqlite3'); const db = new Database('articles.db'); console.log('Articles:', db.prepare('SELECT COUNT(*) as count FROM articles').get().count); db.close();"

# Count summaries
node -e "const Database = require('better-sqlite3'); const db = new Database('articles.db'); console.log('Summaries:', db.prepare('SELECT COUNT(*) as count FROM summaries').get().count); db.close();"

# Test API endpoint
curl -s http://localhost:3000/api/articles | head -c 200
```

### If Problem Persists
1. Check `.next/server/app/api/articles/route.js` - verify the build output includes the export
2. Delete `.next` folder and rebuild: `rm -rf .next && npm run build`
3. Check for TypeScript/build errors in console
4. Verify environment variables are set (GUARDIAN_API_KEY)

## Last Fixed
Date: 2025-11-19
Issue: All database API routes were missing `export const dynamic = 'force-dynamic'`
Solution: Added the export to all 4 affected routes

---

**Keep this file updated whenever you encounter this issue or make changes to the fix!**
