#!/usr/bin/env bash
# Production deploy for fence-u.com (Cloudflare Pages project "fence-u").
# Usage: ./deploy.sh            -> production (main)
#        ./deploy.sh preview    -> preview branch
set -euo pipefail
cd "$(dirname "$0")"
BRANCH="${1:-main}"
npx wrangler pages deploy . --project-name=fence-u --branch="$BRANCH"
