#!/bin/bash
set -e

echo "Building Next.js static export..."
npm run build

echo "Verifying build output..."
ls -la out/

echo "Removing admin and summaries pages..."
rm -rf out/admin out/admin.html
rm -rf out/summaries out/summaries.html

echo "Build completed successfully!"
exit 0
