#!/bin/bash
cd "$(dirname "$0")"
rm -rf .next 2>/dev/null
echo "Starting dev server on http://localhost:3333 ..."
npx next dev -p 3333
