#!/usr/bin/env python3
"""
Seed the TrainedBy knowledge base with Hormozi + SaaS playbook frameworks.
These are distilled from public sources (books, podcasts, interviews, articles).
"""
import json, urllib.request, os

SUPABASE_URL = "https://mezhtdbfyvkshpuplqqw.supabase.co"
# Use service role key from env or hardcode for seeding
SVC_KEY = "b543948ca52e456db071c2e3f2e1e5e4b3a7f8d9c2b1a0e9f8d7c6b5a4e3d2c1"  # placeholder

SVC_KEY = "b543948ca52e456db071c2e3f2e1e5e4b3a7f8d9c2b1a0e9f8d7c6b5a4e3d2c1"  # will be replaced below

# Get service role key from Management API
try:
    import urllib.request as _req
    _r = _req.urlopen(_req.Request(
        "https://api.supabase.com/v1/projects/mezhtdbfyvkshpuplqqw/secrets",
        headers={"Authorization": "Bearer sbp_cf48093fc08197b2b40db235cbf0960f07229602"}
    ), timeout=10)
    _secrets = json.loads(_r.read())
    SVC_KEY = next((s['value'] for s in _secrets if s['name'] == 'SUPABASE_SERVICE_ROLE_KEY'), SVC_KEY)
except Exception as e:
    print(f"Warning: could not fetch service key: {e}")
print(f"Service key: {SVC_KEY[:20]}...")

KNOWLEDGE = [
  # ── ALEX HORMOZI ──────────────────────────────────────────────────────────
  {
    "source": "hormozi",
    "category": "offer",
    "title": "The Grand Slam Offer",
    "content": """A Grand Slam Offer is an offer so good people feel stupid saying no. It has four components: Dream Outcome (what they want), Perceived Likelihood of Achievement (will this work for me?), Time Delay (how long until I get it?), and Effort & Sacrifice (what do I have to give up?). The value equation is: Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort). To increase value: raise the dream outcome, raise perceived likelihood with proof, reduce time to result, reduce effort required. Most businesses fail because they compete on price instead of making the offer so good price becomes irrelevant. For TrainedBy: the dream outcome is "clients finding you while you sleep." Perceived likelihood is raised by REPs verification and real trainer profiles. Time delay is "60 seconds to go live." Effort is "no tech skills needed." """,
    "tags": ["offer", "pricing", "value", "conversion"]
  },
  {
    "source": "hormozi",
    "category": "pricing",
    "title": "Pricing to Value, Not Cost",
    "content": """Never price based on your cost. Price based on the value you deliver. The question is not "what does it cost me to provide this?" but "what is this worth to the buyer?" For a personal trainer, getting one new client per month is worth 4-8x the monthly subscription cost. If a trainer charges 300 AED/session and trains a client 8x/month, that's 2,400 AED/month from one client. A 149 AED/month platform that delivers even one client is a 16x ROI. The pitch should always be in ROI terms, not feature terms. "149 AED/month. One client pays for 6 months." Anchoring: always show the value before the price. Never lead with price.""",
    "tags": ["pricing", "roi", "sales", "conversion"]
  },
  {
    "source": "hormozi",
    "category": "retention",
    "title": "The Churn Problem: Why People Leave",
    "content": """People don't cancel because the product is bad. They cancel because they stopped believing it would work for them. The moment a customer stops taking action, they start rationalising cancellation. The fix is not better features — it's re-engagement. For SaaS: identify the "success milestone" (the moment a user gets real value) and engineer everything to get them there faster. For TrainedBy, the success milestone is "first lead received." Every onboarding action should point toward that milestone. A trainer who gets one lead in their first week will stay. A trainer who gets zero leads in 30 days will churn. Measure time-to-first-lead, not time-to-signup.""",
    "tags": ["retention", "churn", "onboarding", "activation"]
  },
  {
    "source": "hormozi",
    "category": "growth",
    "title": "The Referral Engine",
    "content": """The best customer acquisition channel is a happy existing customer. Build referral into the product, not as an afterthought. The referral offer must be good enough that people feel good giving it. "Get 20% recurring commission" is weak because it sounds like work. "Refer 4 trainers and your subscription is free forever" is strong because it has a clear endpoint and a clear reward. For TrainedBy: the referral program should be surfaced at the moment of highest satisfaction — right after a trainer receives their first lead. That is when they are most likely to share. Automate the ask: "You just got a lead. Know another trainer who should be on TrainedBy? They get a free month, you get 20% recurring."  """,
    "tags": ["referral", "growth", "acquisition", "virality"]
  },
  {
    "source": "hormozi",
    "category": "sales",
    "title": "The Free Trial Trap",
    "content": """Free trials attract people who are not committed. A better model: free forever with a meaningful upgrade trigger. The upgrade trigger should be a feature the user desperately wants after experiencing the free tier. For TrainedBy: the free tier gives a verified profile and public listing. The upgrade trigger is "you have a lead waiting — upgrade to Pro to see their contact details." This is the moment of maximum motivation. The user has already invested in their profile, they have proof the platform works (a lead arrived), and the upgrade cost is trivial compared to the value of that lead. This is called the "success gate" model.""",
    "tags": ["freemium", "conversion", "upgrade", "monetisation"]
  },
  {
    "source": "hormozi",
    "category": "content",
    "title": "Content as a Sales Tool",
    "content": """Content should do one of three things: attract the right people, repel the wrong people, or convert fence-sitters. Generic content does none of these. For TrainedBy's blog: every post should be written for the trainer who is on the fence about signing up, or the trainer who signed up but hasn't upgraded. Topics that work: "How I got 3 new clients in my first month on TrainedBy" (social proof), "Why REPs verification matters to UAE clients" (education that makes the product more valuable), "The 5 things clients look for before booking a trainer" (makes the trainer want to complete their profile). Every post should have one CTA: complete your profile or upgrade to Pro.""",
    "tags": ["content", "marketing", "conversion", "blog"]
  },

  # ── ANDREW CHEN — COLD START PROBLEM ─────────────────────────────────────
  {
    "source": "andrew_chen",
    "category": "growth",
    "title": "The Cold Start Problem: Two-Sided Marketplaces",
    "content": """Every two-sided marketplace (trainers + clients) faces the cold start problem: clients won't come if there are no trainers, and trainers won't join if there are no clients. The solution is to solve one side first. For TrainedBy: solve the supply side (trainers) first. Get 50 high-quality, REPs-verified trainers with complete profiles before spending a single dirham on client acquisition. Why? Because when clients do arrive, they need to find good trainers immediately or they leave and never return. The first 50 trainers are not customers — they are the product. Recruit them manually, one by one, with personal outreach. Do not use paid ads for trainer acquisition at this stage.""",
    "tags": ["marketplace", "cold-start", "supply", "growth"]
  },
  {
    "source": "andrew_chen",
    "category": "growth",
    "title": "Atomic Networks: Start Small and Dense",
    "content": """Don't try to be everywhere at once. Start with one atomic network — a small, dense group of users who get value from each other. For TrainedBy: the first atomic network is "REPs-verified trainers in Dubai Marina and JBR." This is a specific enough niche that word-of-mouth works (trainers know each other, train at the same gyms, attend the same REPs events). Once this network is healthy (10+ active trainers, real client leads flowing), expand to the next area: Downtown Dubai, then Abu Dhabi, then the wider UAE. Geographic density matters more than total user count at this stage.""",
    "tags": ["network-effects", "growth", "geographic", "launch"]
  },

  # ── LENNY RACHITSKY — SAAS GROWTH ────────────────────────────────────────
  {
    "source": "lenny",
    "category": "growth",
    "title": "The Four Growth Loops",
    "content": """There are four types of growth loops: (1) Viral loop — users invite other users (referral, sharing). (2) Content loop — content attracts users who create more content. (3) Paid loop — revenue funds acquisition. (4) Sales loop — sales team converts leads. Most early SaaS companies rely on one primary loop. For TrainedBy at this stage: the primary loop should be Content (trainer profiles are SEO content that attracts client searches, which attracts more trainers) + Viral (trainer referrals). The paid loop should only activate after the content loop is working — otherwise you're buying users who churn because the product isn't ready.""",
    "tags": ["growth-loops", "viral", "content", "saas"]
  },
  {
    "source": "lenny",
    "category": "metrics",
    "title": "The North Star Metric",
    "content": """Every product needs one North Star Metric — the single number that best captures the value the product delivers to users. For TrainedBy, the North Star is not MRR or trainer count. It is "leads delivered to trainers per month." This metric captures both sides of the marketplace: it requires trainers to have good profiles (supply quality) and clients to be searching (demand). When this number grows, everything else follows. When it stagnates, something is broken. Every agent, every feature, every email should be evaluated against: "does this increase leads delivered to trainers per month?" """,
    "tags": ["metrics", "north-star", "product", "strategy"]
  },

  # ── PATRICK CAMPBELL — PRICING ────────────────────────────────────────────
  {
    "source": "patrick_campbell",
    "category": "pricing",
    "title": "Willingness to Pay Research",
    "content": """Never guess your price. Run a Van Westendorp Price Sensitivity Meter survey with your users. Ask four questions: (1) At what price would this be so cheap you'd question the quality? (2) At what price would this be a bargain? (3) At what price would this start to feel expensive? (4) At what price would this be too expensive to consider? The optimal price range sits between the "bargain" and "expensive" thresholds. For TrainedBy's 149 AED/month Pro tier: survey 20 trainers with these four questions. If the "too expensive" threshold is below 149 AED, you have a pricing problem. If the "bargain" threshold is above 149 AED, you're undercharging.""",
    "tags": ["pricing", "research", "willingness-to-pay", "saas"]
  },
  {
    "source": "patrick_campbell",
    "category": "pricing",
    "title": "Value Metric Pricing",
    "content": """The best SaaS pricing is tied to a value metric — something that scales with the value the customer receives. Bad value metric: "per user." Good value metric: "per lead received" or "per booking made." For TrainedBy: consider a hybrid model — free up to 3 leads/month, then 149 AED/month for unlimited leads + Pro features. This aligns price with value: trainers who get more leads pay more, but they're also getting more value. It also creates a natural upgrade trigger: when a trainer hits their 3rd lead, they upgrade immediately because they don't want to miss the 4th.""",
    "tags": ["pricing", "value-metric", "freemium", "upgrade"]
  },

  # ── DAVID SACKS — SAAS METRICS ────────────────────────────────────────────
  {
    "source": "david_sacks",
    "category": "metrics",
    "title": "The SaaS Metrics That Matter",
    "content": """The five metrics every SaaS founder must track weekly: (1) MRR (Monthly Recurring Revenue) — total contracted monthly revenue. (2) MRR Growth Rate — month-over-month % change. (3) Churn Rate — % of MRR lost each month. (4) CAC (Customer Acquisition Cost) — total sales + marketing spend / new customers. (5) LTV (Lifetime Value) — ARPU / Churn Rate. The key ratio is LTV:CAC. It should be at least 3:1 to be a healthy business. For TrainedBy at 149 AED/month: if average trainer stays 12 months, LTV = 1,788 AED. CAC must be below 596 AED to hit 3:1. Track these weekly in the CEO bot's /status command.""",
    "tags": ["metrics", "mrr", "churn", "ltv", "cac"]
  },

  # ── SUPERHUMAN / RAHUL VOHRA — PMF ────────────────────────────────────────
  {
    "source": "superhuman",
    "category": "product",
    "title": "The Product-Market Fit Engine",
    "content": """Survey your users with one question: "How would you feel if you could no longer use TrainedBy?" Options: Very disappointed / Somewhat disappointed / Not disappointed. If 40%+ say "Very disappointed," you have product-market fit. If below 40%, you don't — and you need to find it before scaling. The key insight: don't try to convert the "Not disappointed" users. Focus on the "Somewhat disappointed" users — ask them what would make them "Very disappointed" to lose it. Their answers tell you exactly what to build. For TrainedBy: run this survey with your first 20 real trainers. Their answers will define the product roadmap for the next 6 months.""",
    "tags": ["pmf", "product-market-fit", "survey", "product"]
  },

  # ── NOTION/LINEAR GTM — BOTTOM-UP SAAS ───────────────────────────────────
  {
    "source": "bottom_up_saas",
    "category": "growth",
    "title": "Bottom-Up SaaS: Reduce Time to Value",
    "content": """Bottom-up SaaS (PLG — Product-Led Growth) works by making the product so easy to start that users get value before they ever talk to sales. The key metric is Time to Value (TTV) — how long from signup to the first "aha moment." For TrainedBy: the aha moment is "my profile is live and looks professional." Current TTV is probably 10-15 minutes (fill out form, wait for verification). Target TTV should be under 3 minutes. How: pre-fill as much as possible from the REPs database, use a progress bar that shows completion %, and send a Telegram/email the moment the profile goes live with a screenshot of how it looks. The faster the aha moment, the higher the activation rate.""",
    "tags": ["plg", "time-to-value", "onboarding", "activation"]
  },
  {
    "source": "bottom_up_saas",
    "category": "growth",
    "title": "The Viral Loop in Professional Networks",
    "content": """Professional networks (LinkedIn, Strava, Behance) grow virally because users share their profiles publicly. Every TrainedBy trainer profile is a public URL (trainedby.ae/username). This is a viral loop: trainer shares their profile link → client visits → client sees "Are you a trainer? Join TrainedBy" → trainer signs up. To activate this loop: (1) Make profiles beautiful and shareable. (2) Add an "I found my trainer on TrainedBy" badge for clients to share. (3) Add "Powered by TrainedBy" to the bottom of every profile with a link to the join page. (4) Make the profile URL easy to remember and share (trainedby.ae/sarah not trainedby.ae/d24cb2e5).""",
    "tags": ["viral", "network-effects", "profiles", "growth"]
  },
]

def insert_knowledge(items):
    """Insert knowledge base items via Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/knowledge_base"
    headers = {
        "apikey": SVC_KEY,
        "Authorization": f"Bearer {SVC_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    for item in items:
        data = json.dumps(item).encode()
        r = urllib.request.Request(url, data=data, headers=headers, method='POST')
        try:
            with urllib.request.urlopen(r, timeout=10) as resp:
                print(f"✅ Inserted: [{item['source']}] {item['title'][:50]}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if 'duplicate' in body.lower() or '23505' in body:
                print(f"⏭️  Skip (exists): {item['title'][:50]}")
            else:
                print(f"❌ Error: {item['title'][:50]} — {e.code}: {body[:100]}")

if __name__ == "__main__":
    print(f"Seeding {len(KNOWLEDGE)} knowledge base entries...")
    insert_knowledge(KNOWLEDGE)
    print("Done.")
