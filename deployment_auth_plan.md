# Deployment Authentication Prevention Plan

## Executive Summary

The recent deployment of the `ceo-agent` v2 introduced a critical failure where the Telegram bot stopped responding. The root cause was identified as a JWT authentication misconfiguration: the function was deployed with Supabase's default `verify_jwt: true` setting, which rejected Telegram's unauthenticated webhook POST requests with a `401 Unauthorized` error.

This document outlines a comprehensive plan to prevent similar authentication issues in future deployments across the TrainedBy platform. It categorises all edge functions based on their authentication requirements, establishes strict deployment policies, and introduces automated safeguards to ensure webhook-dependent functions are never accidentally locked behind JWT verification.

## Function Authentication Audit

A full audit of the 34 deployed edge functions reveals two distinct categories of authentication requirements. Functions that receive external webhooks (e.g., Telegram, Stripe, Razorpay) must have JWT verification disabled at the infrastructure level, relying instead on payload signatures or secret tokens for security. Functions called internally by the frontend or other authenticated services must retain the default JWT verification.

### Category 1: Webhook Functions (Require `--no-verify-jwt`)

These functions receive incoming requests from external services that do not pass Supabase JWTs in the `Authorization` header. They must be deployed with JWT verification disabled.

| Function Name | External Service | Security Mechanism |
|---|---|---|
| `ceo-agent` | Telegram | Telegram Bot Token / Chat ID validation |
| `stripe-webhook` | Stripe | Stripe Signature validation |
| `razorpay-webhook` | Razorpay | Razorpay Signature validation |
| `academy-booking-webhook` | Stripe | Stripe Signature validation |

### Category 2: Internal Functions (Require Default JWT)

All other functions are called either by the authenticated frontend application or by internal cron jobs that can supply the necessary service role JWT. These must retain the default `verify_jwt: true` setting to ensure secure access control.

Examples include `admin-verify`, `create-academy`, `growth-agent`, `reverify-agent`, and `trainer-assistant`.

## Deployment Policies and Safeguards

To prevent human error during manual or automated deployments, the following policies and technical safeguards must be implemented.

### 1. Configuration-as-Code via `config.toml`

Supabase allows function-specific configurations to be defined in the `supabase/config.toml` file. This is the most robust method for ensuring deployment settings are version-controlled and consistently applied, regardless of how the deployment is triggered.

The following configuration must be added to `supabase/config.toml`:

```toml
[functions.ceo-agent]
verify_jwt = false

[functions.stripe-webhook]
verify_jwt = false

[functions.razorpay-webhook]
verify_jwt = false

[functions.academy-booking-webhook]
verify_jwt = false
```

By defining this in the configuration file, the `supabase functions deploy` command will automatically apply the correct JWT settings without requiring the `--no-verify-jwt` flag to be remembered by the developer.

### 2. Automated Deployment Script

Manual deployments using the raw Supabase CLI are prone to error. A dedicated deployment script (`deploy.sh`) should be created to wrap the CLI commands. This script will read the `config.toml` file and enforce the correct deployment parameters, providing an additional layer of safety.

The script will:
1. Parse the `config.toml` to identify functions requiring `--no-verify-jwt`.
2. Execute the deployment command with the appropriate flags.
3. Run a post-deployment verification check using the Supabase Management API to confirm the `verify_jwt` status matches the intended configuration.

### 3. Post-Deployment Verification

Trust, but verify. After any deployment, an automated check must run to confirm the infrastructure state matches the intended configuration. This prevents silent failures where a configuration file might be ignored due to CLI updates or syntax errors.

The verification step will query the Supabase Management API:
`GET https://api.supabase.com/v1/projects/{project_id}/functions`

It will assert that `ceo-agent`, `stripe-webhook`, `razorpay-webhook`, and `academy-booking-webhook` all report `"verify_jwt": false`. If any of these report `true`, the deployment script will fail loudly and alert the engineering team.

## Implementation Steps

The following steps will be executed to implement this prevention plan:

1. **Update Configuration:** Append the function-specific JWT settings to `supabase/config.toml`.
2. **Create Deployment Wrapper:** Write `scripts/deploy_functions.sh` to handle safe deployments and post-deploy verification.
3. **Update CI/CD:** If GitHub Actions or Netlify build scripts are used for edge function deployment, update them to use the new wrapper script.
4. **Documentation:** Update the project README to mandate the use of the deployment script for all future edge function updates.
