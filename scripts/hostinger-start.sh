#!/bin/sh
set -eu
if [ "${WORKFLOW_TARGET_WORLD:-}" = "@workflow/world-postgres" ]; then
  pnpm exec bootstrap
fi
exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000
