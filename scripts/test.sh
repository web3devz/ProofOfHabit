#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "✅  Running ProofOfHabit tests"
sui move test --path contracts "$@"
