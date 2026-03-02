#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_VERSION="${1:-0.0.1}"
PACKAGE_NAME="@onchez/hypertilldb@${PACKAGE_VERSION}"

cd "$ROOT_DIR"

npm pkg set "dependencies.@onchez/hypertilldb=${PACKAGE_VERSION}"
npm install

echo "Configured database dependency -> ${PACKAGE_NAME}"
