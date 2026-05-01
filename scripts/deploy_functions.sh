#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# TrainedBy — Safe Edge Function Deployment Script
# ─────────────────────────────────────────────────────────────────────────────
# Usage:
#   ./scripts/deploy_functions.sh                  # Deploy all functions
#   ./scripts/deploy_functions.sh ceo-agent        # Deploy one function
#   ./scripts/deploy_functions.sh --verify-only    # Run verification only
#
# This script ensures webhook-dependent functions are always deployed with
# JWT verification disabled. It reads the source of truth from config.toml
# and verifies the live state via the Supabase Management API after deploy.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
PROJECT_REF="mezhtdbfyvkshpuplqqw"
MGMT_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Functions that MUST have verify_jwt = false (external webhook receivers)
# This is the single source of truth — update this list when adding new
# functions that receive external webhooks.
NO_JWT_FUNCTIONS=(
  "ceo-agent"
  "stripe-webhook"
  "razorpay-webhook"
  "academy-booking-webhook"
  "trainer-weekly-digest"
)

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ── Helpers ───────────────────────────────────────────────────────────────────
is_no_jwt_function() {
  local fn="$1"
  for no_jwt_fn in "${NO_JWT_FUNCTIONS[@]}"; do
    [[ "$fn" == "$no_jwt_fn" ]] && return 0
  done
  return 1
}

deploy_function() {
  local fn="$1"
  local extra_flags=""

  if is_no_jwt_function "$fn"; then
    extra_flags="--no-verify-jwt"
    log_info "Deploying ${fn} (JWT verification DISABLED — external webhook)"
  else
    log_info "Deploying ${fn} (JWT verification ENABLED — internal function)"
  fi

  SUPABASE_ACCESS_TOKEN="${MGMT_TOKEN}" npx supabase functions deploy "${fn}" \
    --project-ref "${PROJECT_REF}" \
    ${extra_flags} 2>&1

  log_ok "Deployed: ${fn}"
}

verify_jwt_settings() {
  log_info "Running post-deployment verification..."

  if [[ -z "${MGMT_TOKEN}" ]]; then
    log_warn "SUPABASE_ACCESS_TOKEN not set — skipping live verification"
    log_warn "Set it to enable automatic post-deploy checks"
    return 0
  fi

  # Fetch all function settings from Management API
  local response
  response=$(curl -sf "https://api.supabase.com/v1/projects/${PROJECT_REF}/functions" \
    -H "Authorization: Bearer ${MGMT_TOKEN}" 2>/dev/null) || {
    log_warn "Could not reach Supabase Management API — skipping verification"
    return 0
  }

  local failed=0

  for fn in "${NO_JWT_FUNCTIONS[@]}"; do
    local verify_jwt
    verify_jwt=$(echo "${response}" | python3 -c "
import json, sys
fns = json.load(sys.stdin)
fn = next((f for f in fns if f['slug'] == '${fn}'), None)
if fn:
    print(str(fn.get('verify_jwt', 'NOT_FOUND')).lower())
else:
    print('not_deployed')
" 2>/dev/null || echo "error")

    if [[ "${verify_jwt}" == "false" ]]; then
      log_ok "  ${fn}: verify_jwt=false ✓"
    elif [[ "${verify_jwt}" == "not_deployed" ]]; then
      log_warn "  ${fn}: not yet deployed (deploy it before going live)"
    else
      log_error "  ${fn}: verify_jwt=${verify_jwt} ✗ — WEBHOOK WILL FAIL"
      failed=$((failed + 1))
    fi
  done

  if [[ $failed -gt 0 ]]; then
    echo ""
    log_error "VERIFICATION FAILED: ${failed} function(s) have incorrect JWT settings."
    log_error "Run: SUPABASE_ACCESS_TOKEN=<token> ./scripts/fix_jwt_settings.sh"
    exit 1
  fi

  log_ok "All webhook functions verified — JWT settings correct."
}

fix_jwt_settings() {
  log_info "Fixing JWT settings for all webhook functions..."

  for fn in "${NO_JWT_FUNCTIONS[@]}"; do
    log_info "Setting verify_jwt=false for ${fn}..."
    curl -sf -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${fn}" \
      -H "Authorization: Bearer ${MGMT_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"verify_jwt": false}' > /dev/null 2>&1 && \
      log_ok "  ${fn}: fixed" || \
      log_error "  ${fn}: failed to update"
  done
}

# ── Main ──────────────────────────────────────────────────────────────────────
cd "${PROJECT_DIR}"

case "${1:-all}" in
  --verify-only)
    verify_jwt_settings
    ;;
  --fix-jwt)
    if [[ -z "${MGMT_TOKEN}" ]]; then
      log_error "SUPABASE_ACCESS_TOKEN required for --fix-jwt"
      exit 1
    fi
    fix_jwt_settings
    verify_jwt_settings
    ;;
  all)
    log_info "Deploying all edge functions..."
    for fn_dir in supabase/functions/*/; do
      fn="${fn_dir%/}"
      fn="${fn##*/}"
      [[ "$fn" == "_shared" ]] && continue
      [[ -f "supabase/functions/${fn}/index.ts" ]] || continue
      deploy_function "${fn}"
    done
    echo ""
    verify_jwt_settings
    ;;
  *)
    # Deploy a single named function
    fn="$1"
    if [[ ! -f "supabase/functions/${fn}/index.ts" ]]; then
      log_error "Function not found: ${fn}"
      exit 1
    fi
    deploy_function "${fn}"
    echo ""
    verify_jwt_settings
    ;;
esac

echo ""
log_ok "Deployment complete."
