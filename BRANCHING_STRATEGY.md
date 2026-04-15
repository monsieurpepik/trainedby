# Git Branching Strategy Assessment

## Current State Analysis

The TrainedBy repository currently operates on a **single-branch model** (`main`). Every commit, feature, and bug fix is pushed directly to `main`.

Because Netlify is configured to auto-deploy the `main` branch, every push immediately goes live to production across all 8 market domains.

### Why this is a risk

1. **No staging environment:** There is no way to test changes in a production-like environment before they go live to users. If a change breaks the dashboard, it breaks for everyone immediately.
2. **No code review gate:** AI agents (like the GSD workflow) are pushing directly to production. While they use TDD and verification steps, there is no human-in-the-loop or CI/CD gate preventing a bad commit from deploying.
3. **No rollback buffer:** If a critical bug is deployed, the only way to fix it is to write a new commit and push it forward, or revert the commit on `main`. Both take time while production is broken.

### Why it has worked so far

Single-branch development (often called Trunk-Based Development without feature branches) is extremely fast. It avoids merge conflicts and keeps velocity high, which is why it's common in early-stage startups. However, as the product scales to multiple domains and real users, the risk outweighs the speed.

## Proposed Branching Model: Simplified GitFlow

For a product of this scale, managed primarily by AI agents and a single founder, a full GitFlow (with `develop`, `release`, `hotfix`, and `feature` branches) is too heavy.

Instead, we should implement a **Simplified GitFlow (GitHub Flow with Environments)**:

1. **`main` (Production):** This branch is protected. No one (not even the founder or AI agents) can push directly to it. It represents what is currently live on `trainedby.ae`, `coachepar.fr`, etc.
2. **`staging` (Pre-production):** This branch is the default target for all new work. Netlify will be configured to deploy this branch to a staging URL (e.g., `staging.trainedby.ae`).
3. **Feature Branches (`feat/*`, `fix/*`):** All new work happens here. When a feature is done, a Pull Request (PR) is opened against `staging`.

### The Workflow

1. **Build:** AI agent creates `feat/new-dashboard` and pushes commits.
2. **Test:** PR is opened against `staging`. Netlify builds a preview URL.
3. **Merge to Staging:** PR is merged. The `staging` branch deploys to the staging environment for final UAT (User Acceptance Testing).
4. **Release to Production:** When staging is verified, a PR is opened from `staging` to `main`. Merging this PR deploys to production.

## Implementation Plan

1. Create the `staging` branch from `main`.
2. Update GitHub repository settings to protect `main` and `staging` (require PRs).
3. Update Netlify configuration to map `staging` to a specific environment.
4. Update the GSD and Superpowers workflow instructions (`CLAUDE.md`) to enforce branching.
