#!/usr/bin/env python3
"""Seed the TrainedBy knowledge base with Hormozi + SaaS playbook frameworks."""
import json, urllib.request

SUPABASE_URL = "https://mezhtdbfyvkshpuplqqw.supabase.co"

with open('/tmp/svc_key.txt') as f:
    SVC = f.read().strip()

print(f"Key: {len(SVC)} chars, prefix: {SVC[:30]}...")

KNOWLEDGE = [
  {"source":"hormozi","category":"offer","title":"The Grand Slam Offer",
   "content":"A Grand Slam Offer is so good people feel stupid saying no. Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort). For TrainedBy: dream outcome is clients finding you while you sleep. Perceived likelihood raised by REPs verification. Time delay is 60 seconds to go live. Effort is no tech skills needed. Never compete on price — make the offer so good price becomes irrelevant.",
   "tags":["offer","pricing","value","conversion"]},

  {"source":"hormozi","category":"pricing","title":"Pricing to Value Not Cost",
   "content":"Never price based on cost. Price based on value delivered. A trainer charging 300 AED/session x 8 sessions/month = 2400 AED from one client. A 149 AED/month platform delivering one client is a 16x ROI. Always pitch in ROI terms: 149 AED/month. One client pays for 6 months. Anchor value before price. Never lead with price.",
   "tags":["pricing","roi","sales","conversion"]},

  {"source":"hormozi","category":"retention","title":"Why People Churn",
   "content":"People cancel because they stopped believing it would work for them. The fix is not better features — it is re-engagement. For TrainedBy: the success milestone is first lead received. Every onboarding action should point toward that milestone. Measure time-to-first-lead, not time-to-signup. A trainer who gets one lead in week one will stay. A trainer who gets zero leads in 30 days will churn.",
   "tags":["retention","churn","onboarding","activation"]},

  {"source":"hormozi","category":"growth","title":"The Referral Engine",
   "content":"Build referral into the product at the moment of highest satisfaction — right after a trainer receives their first lead. Automate the ask: You just got a lead. Know another trainer who should be on TrainedBy? They get a free month, you get 20% recurring. Refer 4 trainers and your subscription is free forever. The referral offer must have a clear endpoint and a clear reward.",
   "tags":["referral","growth","acquisition","virality"]},

  {"source":"hormozi","category":"sales","title":"The Success Gate Model",
   "content":"Free forever with a meaningful upgrade trigger. The upgrade trigger should be a feature the user desperately wants after experiencing the free tier. For TrainedBy: free tier gives verified profile and public listing. Upgrade trigger: you have a lead waiting — upgrade to Pro to see their contact details. This is the moment of maximum motivation. The user has proof the platform works.",
   "tags":["freemium","conversion","upgrade","monetisation"]},

  {"source":"hormozi","category":"content","title":"Content as a Sales Tool",
   "content":"Content should do one of three things: attract the right people, repel the wrong people, or convert fence-sitters. For TrainedBy blog: every post should target the trainer on the fence about signing up, or the trainer who signed up but has not upgraded. Topics that work: How I got 3 new clients in my first month on TrainedBy (social proof), Why REPs verification matters to UAE clients (education), The 5 things clients look for before booking a trainer (makes trainer want to complete profile). Every post should have one CTA: complete your profile or upgrade to Pro.",
   "tags":["content","marketing","conversion","blog"]},

  {"source":"andrew_chen","category":"growth","title":"The Cold Start Problem",
   "content":"Every two-sided marketplace faces the cold start problem: clients will not come if there are no trainers, and trainers will not join if there are no clients. Solve the supply side first. Get 50 high-quality REPs-verified trainers with complete profiles before spending a single dirham on client acquisition. The first 50 trainers are not customers — they are the product. Recruit them manually, one by one, with personal outreach. Do not use paid ads for trainer acquisition at this stage.",
   "tags":["marketplace","cold-start","supply","growth"]},

  {"source":"andrew_chen","category":"growth","title":"Atomic Networks: Start Small and Dense",
   "content":"Start with one atomic network — a small dense group of users who get value from each other. For TrainedBy: the first atomic network is REPs-verified trainers in Dubai Marina and JBR. This is specific enough that word-of-mouth works (trainers know each other, train at the same gyms, attend the same REPs events). Once this network is healthy (10+ active trainers, real client leads flowing), expand to Downtown Dubai, then Abu Dhabi, then the wider UAE. Geographic density matters more than total user count at this stage.",
   "tags":["network-effects","growth","geographic","launch"]},

  {"source":"lenny","category":"growth","title":"The Four Growth Loops",
   "content":"There are four types of growth loops: (1) Viral loop — users invite other users. (2) Content loop — content attracts users who create more content. (3) Paid loop — revenue funds acquisition. (4) Sales loop — sales team converts leads. For TrainedBy at this stage: primary loop should be Content (trainer profiles are SEO content that attracts client searches, which attracts more trainers) plus Viral (trainer referrals). The paid loop should only activate after the content loop is working.",
   "tags":["growth-loops","viral","content","saas"]},

  {"source":"lenny","category":"metrics","title":"The North Star Metric",
   "content":"For TrainedBy, the North Star is not MRR or trainer count. It is leads delivered to trainers per month. This metric captures both sides of the marketplace: it requires trainers to have good profiles (supply quality) and clients to be searching (demand). When this number grows, everything else follows. When it stagnates, something is broken. Every agent, every feature, every email should be evaluated against: does this increase leads delivered to trainers per month?",
   "tags":["metrics","north-star","product","strategy"]},

  {"source":"patrick_campbell","category":"pricing","title":"Willingness to Pay Research",
   "content":"Run a Van Westendorp Price Sensitivity Meter survey with your users. Ask four questions: (1) At what price would this be so cheap you would question the quality? (2) At what price would this be a bargain? (3) At what price would this start to feel expensive? (4) At what price would this be too expensive to consider? The optimal price range sits between the bargain and expensive thresholds. Survey 20 trainers with these four questions. If the too expensive threshold is below 149 AED, you have a pricing problem.",
   "tags":["pricing","research","willingness-to-pay","saas"]},

  {"source":"patrick_campbell","category":"pricing","title":"Value Metric Pricing",
   "content":"The best SaaS pricing is tied to a value metric — something that scales with the value the customer receives. For TrainedBy: consider a hybrid model — free up to 3 leads per month, then 149 AED per month for unlimited leads plus Pro features. This aligns price with value: trainers who get more leads pay more, but they are also getting more value. It also creates a natural upgrade trigger: when a trainer hits their 3rd lead, they upgrade immediately because they do not want to miss the 4th.",
   "tags":["pricing","value-metric","freemium","upgrade"]},

  {"source":"david_sacks","category":"metrics","title":"The SaaS Metrics That Matter",
   "content":"Five metrics every SaaS founder must track weekly: (1) MRR — total contracted monthly revenue. (2) MRR Growth Rate — month-over-month percent change. (3) Churn Rate — percent of MRR lost each month. (4) CAC — total sales plus marketing spend divided by new customers. (5) LTV — ARPU divided by Churn Rate. The key ratio is LTV:CAC — must be at least 3:1 to be a healthy business. For TrainedBy at 149 AED per month: if average trainer stays 12 months, LTV = 1788 AED. CAC must be below 596 AED to hit 3:1.",
   "tags":["metrics","mrr","churn","ltv","cac"]},

  {"source":"superhuman","category":"product","title":"The Product-Market Fit Engine",
   "content":"Survey your users with one question: How would you feel if you could no longer use TrainedBy? Options: Very disappointed, Somewhat disappointed, Not disappointed. If 40 percent or more say Very disappointed, you have product-market fit. Focus on the Somewhat disappointed users — ask them what would make them Very disappointed to lose it. Their answers tell you exactly what to build. Run this survey with your first 20 real trainers. Their answers will define the product roadmap for the next 6 months.",
   "tags":["pmf","product-market-fit","survey","product"]},

  {"source":"bottom_up_saas","category":"growth","title":"Bottom-Up SaaS: Reduce Time to Value",
   "content":"Bottom-up SaaS works by making the product so easy to start that users get value before they ever talk to sales. The key metric is Time to Value (TTV) — how long from signup to the first aha moment. For TrainedBy: the aha moment is my profile is live and looks professional. Current TTV is probably 10-15 minutes. Target TTV should be under 3 minutes. How: pre-fill as much as possible from the REPs database, use a progress bar that shows completion percent, and send a notification the moment the profile goes live with a screenshot of how it looks.",
   "tags":["plg","time-to-value","onboarding","activation"]},

  {"source":"bottom_up_saas","category":"growth","title":"The Viral Loop in Professional Networks",
   "content":"Professional networks grow virally because users share their profiles publicly. Every TrainedBy trainer profile is a public URL (trainedby.ae/username). This is a viral loop: trainer shares their profile link, client visits, client sees Are you a trainer? Join TrainedBy, trainer signs up. To activate this loop: make profiles beautiful and shareable, add an I found my trainer on TrainedBy badge for clients to share, add Powered by TrainedBy to the bottom of every profile with a link to the join page, make the profile URL easy to remember and share.",
   "tags":["viral","network-effects","profiles","growth"]},

  {"source":"market_insight","category":"market","title":"UAE Fitness Market Context",
   "content":"The UAE fitness market is worth over 1.5 billion USD and growing at 8 percent annually. Dubai has over 800 registered personal trainers on REPs UAE. The average Dubai personal trainer charges 250-400 AED per session. The biggest pain point for trainers is client acquisition — most rely on gym referrals which dry up when they go independent. The UAE client expects high service standards: fast response times, professional presentation, and verified credentials. REPs UAE certification is the primary trust signal for UAE fitness clients. The market is fragmented — no dominant platform for verified trainer discovery exists.",
   "tags":["market","uae","dubai","fitness","opportunity"]},

  {"source":"market_insight","category":"market","title":"UK Fitness Market Context",
   "content":"The UK has over 100,000 registered personal trainers. REPs UK (Register of Exercise Professionals) is the primary certification body. Average PT session rate is 40-70 GBP. The market is more price-sensitive than UAE but has higher volume. Key platforms: PureGym, Hussle, Urban. The biggest opportunity is independent PTs who want to build a client base outside of gym employment. CIMSPA (Chartered Institute for the Management of Sport and Physical Activity) is the professional body. UK clients prioritise qualifications, insurance, and DBS checks.",
   "tags":["market","uk","fitness","reps-uk","opportunity"]},

  {"source":"market_insight","category":"market","title":"India Fitness Market Context",
   "content":"India has a rapidly growing fitness market driven by urban middle class health awareness. Key certification bodies: NSCA, ACSM, ACE, and local bodies like IAFT. Average PT session rate in metro cities is 800-2000 INR. Cult.fit is the dominant platform but focuses on group fitness. The opportunity is for independent certified trainers to build personal brands. Key cities: Mumbai, Delhi, Bangalore, Hyderabad. The market is mobile-first — all touchpoints must work on Android. Price sensitivity is higher than UAE or UK.",
   "tags":["market","india","fitness","nsca","opportunity"]},
]

url = f"{SUPABASE_URL}/rest/v1/knowledge_base"
headers = {
    "apikey": SVC,
    "Authorization": f"Bearer {SVC}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

ok = 0
for item in KNOWLEDGE:
    data = json.dumps(item).encode()
    r = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            ok += 1
            print(f"✅ [{item['source']}] {item['title'][:50]}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"❌ {item['title'][:50]}: {e.code} {body[:100]}")

print(f"\nDone: {ok}/{len(KNOWLEDGE)} entries inserted into knowledge_base")
