"""
TrainedBy.ae — Stripe Setup Script
Creates all 4 subscription products + prices and the webhook endpoint.
"""
import requests
import json

STRIPE_SECRET = "sk_test_51TGuhYDafaldBibB0RrGR3P1v4IHKDqM4CONqjeEYOW0pP1x6Nzojct7fJ39USMO6Y54X47dXb1pPnbegMyC6HwT00w0cATQPZ"
SUPABASE_URL  = "https://mezhtdbfyvkshpuplqqw.supabase.co"
WEBHOOK_URL   = f"{SUPABASE_URL}/functions/v1/stripe-webhook"

STRIPE_BASE = "https://api.stripe.com/v1"
HEADERS = {"Authorization": f"Bearer {STRIPE_SECRET}"}

def stripe_post(endpoint, data):
    r = requests.post(f"{STRIPE_BASE}/{endpoint}", headers=HEADERS, data=data, timeout=15)
    r.raise_for_status()
    return r.json()

def stripe_get(endpoint, params=None):
    r = requests.get(f"{STRIPE_BASE}/{endpoint}", headers=HEADERS, params=params, timeout=15)
    r.raise_for_status()
    return r.json()

print("=" * 55)
print("  TrainedBy.ae — Stripe Setup")
print("=" * 55)

# ── 1. Create Products ────────────────────────────────────────
print("\n📦 Creating Products...")

products = {}

# Pro product
pro = stripe_post("products", {
    "name": "TrainedBy Pro",
    "description": "Professional trainer profile with unlimited packages, WhatsApp notifications, and priority search.",
    "metadata[plan]": "pro",
})
products["pro"] = pro["id"]
print(f"  ✅ Pro product: {pro['id']}")

# Premium product
premium = stripe_post("products", {
    "name": "TrainedBy Premium",
    "description": "Full-featured trainer profile with up to 5 profiles, gym page, and featured spotlight.",
    "metadata[plan]": "premium",
})
products["premium"] = premium["id"]
print(f"  ✅ Premium product: {premium['id']}")

# ── 2. Create Prices ──────────────────────────────────────────
print("\n💰 Creating Prices (AED)...")

prices = {}

# Pro Monthly — AED 99
pro_monthly = stripe_post("prices", {
    "product": products["pro"],
    "unit_amount": 9900,       # AED 99.00 in fils
    "currency": "aed",
    "recurring[interval]": "month",
    "nickname": "Pro Monthly",
    "metadata[plan]": "pro",
    "metadata[billing]": "monthly",
})
prices["pro_monthly"] = pro_monthly["id"]
print(f"  ✅ Pro Monthly (AED 99/mo): {pro_monthly['id']}")

# Pro Annual — AED 948 (AED 79/mo × 12)
pro_annual = stripe_post("prices", {
    "product": products["pro"],
    "unit_amount": 94800,      # AED 948.00 in fils
    "currency": "aed",
    "recurring[interval]": "year",
    "nickname": "Pro Annual",
    "metadata[plan]": "pro",
    "metadata[billing]": "annual",
})
prices["pro_annual"] = pro_annual["id"]
print(f"  ✅ Pro Annual (AED 948/yr): {pro_annual['id']}")

# Premium Monthly — AED 199
premium_monthly = stripe_post("prices", {
    "product": products["premium"],
    "unit_amount": 19900,      # AED 199.00 in fils
    "currency": "aed",
    "recurring[interval]": "month",
    "nickname": "Premium Monthly",
    "metadata[plan]": "premium",
    "metadata[billing]": "monthly",
})
prices["premium_monthly"] = premium_monthly["id"]
print(f"  ✅ Premium Monthly (AED 199/mo): {premium_monthly['id']}")

# Premium Annual — AED 1,908 (AED 159/mo × 12)
premium_annual = stripe_post("prices", {
    "product": products["premium"],
    "unit_amount": 190800,     # AED 1,908.00 in fils
    "currency": "aed",
    "recurring[interval]": "year",
    "nickname": "Premium Annual",
    "metadata[plan]": "premium",
    "metadata[billing]": "annual",
})
prices["premium_annual"] = premium_annual["id"]
print(f"  ✅ Premium Annual (AED 1,908/yr): {premium_annual['id']}")

# ── 3. Create Webhook ─────────────────────────────────────────
print(f"\n🔗 Creating Webhook → {WEBHOOK_URL}")

webhook = stripe_post("webhook_endpoints", {
    "url": WEBHOOK_URL,
    "enabled_events[]": "checkout.session.completed",
    "enabled_events[]": "customer.subscription.updated",
    "enabled_events[]": "customer.subscription.deleted",
    "enabled_events[]": "invoice.payment_failed",
    "description": "TrainedBy.ae Supabase Edge Function",
    "metadata[project]": "trainedby",
})
webhook_secret = webhook.get("secret", "")
print(f"  ✅ Webhook created: {webhook['id']}")
print(f"  ✅ Signing secret: {webhook_secret[:20]}...")

# ── 4. Output summary ─────────────────────────────────────────
print("\n" + "=" * 55)
print("  Price IDs Summary")
print("=" * 55)
for key, val in prices.items():
    print(f"  {key:25s} {val}")

print("\n" + "=" * 55)
print("  Supabase Secrets to Set")
print("=" * 55)
print(f"  STRIPE_SECRET_KEY        = {STRIPE_SECRET[:30]}...")
print(f"  STRIPE_WEBHOOK_SECRET    = {webhook_secret}")
print(f"  STRIPE_PRICE_PRO_MONTHLY = {prices['pro_monthly']}")
print(f"  STRIPE_PRICE_PRO_ANNUAL  = {prices['pro_annual']}")
print(f"  STRIPE_PRICE_PREMIUM_MONTHLY = {prices['premium_monthly']}")
print(f"  STRIPE_PRICE_PREMIUM_ANNUAL  = {prices['premium_annual']}")

# Save to file for next script
with open("/home/ubuntu/trainedby/scripts/stripe_ids.json", "w") as f:
    json.dump({
        "stripe_secret_key": STRIPE_SECRET,
        "stripe_webhook_secret": webhook_secret,
        "stripe_price_pro_monthly": prices["pro_monthly"],
        "stripe_price_pro_annual": prices["pro_annual"],
        "stripe_price_premium_monthly": prices["premium_monthly"],
        "stripe_price_premium_annual": prices["premium_annual"],
    }, f, indent=2)
print("\n  Saved to scripts/stripe_ids.json")
