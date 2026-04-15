---
name: get-shit-done
description: Use when starting any new feature, bug fix, or project initiative. GSD is the primary execution framework for TrainedBy — it provides structured planning, parallel agent execution, state tracking, and quality gates. Use this before reaching for individual Superpowers skills.
---

# Get Shit Done (GSD)

## Overview

GSD is the primary development execution framework for TrainedBy. It provides a complete workflow from idea to shipped code — with research, planning, parallel execution, verification, and state tracking built in.

**Philosophy:** No enterprise theater. No sprint ceremonies. Just describe what you want, let the system extract what it needs, and build it correctly.

**When to use GSD vs Superpowers:**
- **GSD** — for any feature, bug fix, or initiative that takes more than 5 minutes. GSD handles the full lifecycle.
- **Superpowers** — for specific techniques within a GSD workflow (e.g., TDD during execute-phase, systematic-debugging when something breaks).

## Core Workflow

```
/gsd-new-project          → Initialize project with deep context gathering
    ↓
/gsd-discuss-phase N      → Lock in preferences before planning
    ↓
/gsd-plan-phase N         → 4 parallel researchers → planner → plan-checker
    ↓
/gsd-execute-phase N      → Wave-based parallel execution with subagents
    ↓
/gsd-verify-work          → Manual UAT + automated verification
    ↓
/gsd-ship                 → Create PR / merge
    ↓
/gsd-audit-milestone      → Quality gate before next milestone
```

## Key Commands for TrainedBy

| Command | When to use |
|---|---|
| `/gsd-do <description>` | Smart dispatcher — describe what you want, GSD routes it |
| `/gsd-quick <task>` | Small, self-contained task with GSD quality guarantees |
| `/gsd-fast <task>` | Trivial task (typo fix, config change) — no planning overhead |
| `/gsd-debug <issue>` | Systematic debugging with persistent state across context resets |
| `/gsd-plan-phase N` | Research + plan a specific phase (4 parallel researchers) |
| `/gsd-execute-phase N` | Build a planned phase with wave-based parallel execution |
| `/gsd-verify-work` | UAT + automated verification after execution |
| `/gsd-code-review` | Two-stage code review (spec compliance + code quality) |
| `/gsd-add-phase <desc>` | Add a new phase to the roadmap mid-project |
| `/gsd-progress` | Check current project status and what's next |
| `/gsd-resume-work` | Pick up where you left off after a context reset |

## TrainedBy-Specific Setup

Before using GSD on a new feature, initialize the project context:

```bash
/gsd-new-project
```

This creates `.planning/` with:
- `PROJECT.md` — what we're building and why
- `REQUIREMENTS.md` — scoped, verified requirements
- `ROADMAP.md` — phase structure
- `STATE.md` — project memory (survives context resets)

**Important for TrainedBy:** When GSD asks about the stack, always specify:
- Frontend: Astro + React + TailwindCSS (Netlify)
- Backend: Supabase (Deno Edge Functions + PostgreSQL)
- Payments: Stripe Connect + Razorpay
- Comms: Resend email + Telegram bot
- AI: Claude (Anthropic) via `_shared/claude.ts`

## Quality Gates Built In

GSD enforces these automatically:

- **Schema drift detection** — flags ORM changes missing migrations
- **Scope reduction detection** — prevents planner from silently dropping requirements
- **Nyquist validation** — maps automated test coverage to each requirement before coding
- **Plan-checker** — rejects plans where tasks lack verification commands
- **Two-stage code review** — spec compliance first, then code quality

## Integration with Superpowers Skills

GSD and Superpowers are complementary. During a GSD workflow:

- Use `skills/systematic-debugging` when `/gsd-debug` needs deeper root cause analysis
- Use `skills/test-driven-development` during `/gsd-execute-phase` for TDD enforcement
- Use `skills/verification-before-completion` before any `/gsd-ship` or PR creation
- Use `skills/trainedby-edge-functions` when executing phases that touch edge functions

## CEO Bot Integration

The CEO bot (`/plan`, `/debug`, `/brainstorm`, `/review`) uses GSD methodology internally. When you trigger `/plan <feature>` in Telegram, the CEO bot generates a GSD-compatible implementation plan with wave-based task grouping and verification steps.

For complex multi-phase initiatives, use `/directive <goal>` in the CEO bot — it will structure the work as a GSD roadmap and assign phases to agents.
