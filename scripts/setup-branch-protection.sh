#!/usr/bin/env bash
#
# Applies branch protection to `main`.
#
# NOTE: On GitHub Free, branch protection only works on PUBLIC repositories
# (or private repos on Team/Enterprise). Run this AFTER making the repo public,
# or after upgrading the org plan — otherwise the API returns 403.
#
# Requires the GitHub CLI authenticated as a repo admin:  gh auth status
#
# Usage:  bash scripts/setup-branch-protection.sh [owner/repo]

set -euo pipefail

REPO="${1:-mobile-dev-ci/react-native-kundli-chart}"
BRANCH="main"

echo "Applying branch protection to ${REPO}@${BRANCH} ..."

gh api -X PUT "repos/${REPO}/branches/${BRANCH}/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "required_linear_history": true,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
JSON

echo "Done. Summary:"
echo "  - PRs required (1 approval, code-owner review, stale reviews dismissed)"
echo "  - CI 'build' must pass and branch must be up to date"
echo "  - Conversations must be resolved"
echo "  - Linear history; force-pushes and branch deletion blocked"
echo
echo "Set enforce_admins=true above if maintainers should also be bound by the rules."
