#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${1:-vendor}"
NPM_PACKAGE="${2:-@onchezz/hyperdb@latest}"
VENDOR_PATH="file:./vendor/nozbe-watermelondb-0.28.1-0.tgz"

cd "$ROOT_DIR"

if [[ "$SOURCE" == "vendor" ]]; then
  npm pkg set "dependencies.@nozbe/watermelondb=$VENDOR_PATH"
  npm install
  echo "Configured @nozbe/watermelondb -> $VENDOR_PATH"
  exit 0
fi

if [[ "$SOURCE" == "npm" ]]; then
  npm pkg set "dependencies.@nozbe/watermelondb=npm:${NPM_PACKAGE}"
  npm install
  echo "Configured @nozbe/watermelondb -> npm:${NPM_PACKAGE}"
  exit 0
fi

echo "Usage: ./scripts/setup-enhanced-db.sh [vendor|npm] [npm-package@version]"
echo "Examples:"
echo "  ./scripts/setup-enhanced-db.sh vendor"
echo "  ./scripts/setup-enhanced-db.sh npm @onchezz/hyperdb@0.28.1-0.enhanced.0"
exit 1
