# TrainedBy Blog: Content Strategy & Publishing Platform Guide

## The Core Thesis

A TrainedBy blog serves two masters simultaneously. For **trainers**, it is a credibility amplifier — a published article on a domain that ranks for fitness keywords in the UAE is worth more than a hundred Instagram posts. For **TrainedBy the platform**, every article is a SEO asset that drives organic traffic from people searching "personal trainer Dubai" or "fat loss diet UAE" — traffic that converts directly into trainer profile views and leads.

This is the Strava model applied to content: individual trainers create content, the platform aggregates it, and the network effect makes everyone's content more valuable over time.

---

## Where Trainers Should Publish (Platform Comparison)

| Platform | Audience | SEO Value | Domain Authority | Best For |
|---|---|---|---|---|
| **TrainedBy Blog** | UAE fitness audience | High (owned domain) | Growing | Primary — always publish here first |
| **Medium** | Global readers | Medium | DA 95 | Republish for reach, link back to TrainedBy |
| **LinkedIn Articles** | Professionals, B2B | Low | DA 99 | Corporate wellness, executive fitness |
| **PTDC (theptdc.com)** | Other trainers | High | DA 60 | Peer credibility, certifications |
| **Muscle & Fitness** | Fitness enthusiasts | Very High | DA 75 | Guest posts for brand authority |
| **Men's Health / Women's Health UAE** | Mass market | Very High | DA 85 | Major brand credibility signal |
| **Substack** | Niche subscribers | Low | Medium | Email newsletter for repeat clients |

### The Publishing Hierarchy

1. **Publish on TrainedBy first** — this establishes TrainedBy.ae as the original source
2. **Republish on Medium** with canonical link pointing to TrainedBy — captures Medium's audience without cannibalising SEO
3. **Share LinkedIn Article summary** with a "Read the full piece on TrainedBy" link
4. **Pitch to PTDC or Muscle & Fitness** once you have 3+ published articles — use your TrainedBy portfolio as proof of writing ability

---

## The SEO Strategy: Keywords That Drive Clients

### Tier 1: High Intent (Client Acquisition Keywords)

These keywords are searched by people actively looking to hire a trainer:

| Keyword | Monthly Searches (UAE) | Difficulty | Article Type |
|---|---|---|---|
| "personal trainer Dubai" | 2,400 | High | Directory + individual profiles |
| "personal trainer Abu Dhabi" | 880 | Medium | Directory + profiles |
| "online personal trainer UAE" | 590 | Low | Guide + trainer profiles |
| "female personal trainer Dubai" | 480 | Low | Specialty guide |
| "weight loss trainer Dubai" | 390 | Low | Transformation guide |

### Tier 2: Educational (Top of Funnel)

These keywords are searched by people who will eventually need a trainer:

| Keyword | Monthly Searches | Article Title |
|---|---|---|
| "how to lose weight in Dubai" | 1,200 | "How to Lose Weight in Dubai: A Complete 12-Week Plan" |
| "Ramadan workout plan" | 3,400 (seasonal) | "The Complete Ramadan Training Guide for UAE Athletes" |
| "gym in Dubai" | 8,100 | "Best Gyms in Dubai: A Trainer's Honest Review" |
| "protein powder UAE" | 1,600 | "Best Protein Powders Available in UAE (2025 Review)" |
| "HIIT workout Dubai" | 720 | "The 30-Minute HIIT Workout You Can Do in Any Dubai Gym" |

### Tier 3: Long-Tail (Easy Wins)

| Keyword | Monthly Searches | Article Title |
|---|---|---|
| "how to train during Ramadan fasting" | 890 | "Training While Fasting: The Science of Ramadan Fitness" |
| "fat loss diet UAE" | 340 | "The UAE Fat Loss Diet: What Actually Works in This Climate" |
| "personal trainer cost Dubai" | 280 | "How Much Does a Personal Trainer Cost in Dubai? (2025)" |
| "home workout Dubai" | 1,100 | "The Best Home Workout Routine for Dubai Apartments" |

---

## Content Pillars (What Trainers Should Write About)

### Pillar 1: UAE-Specific Fitness Content
This is TrainedBy's unfair advantage. No global fitness publication can write about training in 45°C heat, Ramadan fasting protocols, or Dubai gym culture with the same authenticity as a trainer who lives and works here.

**Article ideas:**
- "How to Stay Lean During Eid: The 3-Day Recovery Protocol"
- "Training in Dubai Summer: Heat Acclimatisation for Outdoor Athletes"
- "The Best Gyms in JBR / Marina / DIFC / Downtown (Trainer Reviews)"
- "Halal Protein Sources for UAE Athletes: A Complete Guide"

### Pillar 2: Evidence-Based Explainers
Trainers who cite research build authority. The Perplexity Sonar integration means trainers can generate cited content in minutes.

**Article ideas:**
- "The Truth About Intermittent Fasting: What 47 Studies Actually Show"
- "Creatine: The Most Misunderstood Supplement in the UAE"
- "Progressive Overload Explained: Why You're Not Getting Stronger"

### Pillar 3: Client Success Stories
Transformation stories with real data (weight, body fat %, timeline) are the highest-converting content on the platform.

**Article ideas:**
- "How Ahmed Lost 18kg in 16 Weeks Without Starving"
- "From C-Section to Competition: Sarah's 12-Month Transformation"
- "The Executive's Body Recomposition: 90 Days, No Gym Membership"

### Pillar 4: Trainer Expertise Showcases
Articles that demonstrate specialist knowledge — the content that makes a client think "I need to work with this specific person."

**Article ideas:**
- "Why I Never Program Leg Press for My Clients (And What I Do Instead)"
- "The 5 Mistakes I See Every New Gym Member Make in Dubai"
- "My 8-Week Strength Programme for Busy Professionals"

---

## The Credibility Flywheel

Publishing on TrainedBy creates a compounding credibility loop:

1. Trainer publishes an article with citations from PubMed (via the AI Plan Builder)
2. Article ranks on Google for a UAE fitness keyword
3. Potential client finds the article, reads it, clicks the trainer's profile link
4. Client books a session — the article converted a stranger into a paying client
5. Trainer shares the article on Instagram: "My latest piece on TrainedBy — link in bio"
6. Instagram followers click through to TrainedBy, discover other trainers, platform grows

This is the mechanism by which TrainedBy becomes the authoritative fitness publication for the UAE — not by hiring editors, but by giving its trainers the infrastructure to publish.

---

## The "Write for TrainedBy" Programme

### What Trainers Get
- A published article under their name on a growing UAE fitness domain
- A byline with their profile photo, REPs badge, and a link to their booking page
- SEO backlink from a UAE-specific domain (more valuable than a generic global site)
- Social proof: "As seen on TrainedBy" for their Instagram bio
- Automatic inclusion in the "Top Contributors" sidebar on the blog

### What TrainedBy Gets
- Organic SEO content at zero cost
- Trainer retention (trainers who publish are 3× more likely to stay on the platform)
- A reason for trainers to share TrainedBy links on their social media
- A content moat that competitors cannot easily replicate

### The Submission Process
1. Trainer writes article in their dashboard (minimum 600 words, must include at least one cited source)
2. TrainedBy editorial review (24–48 hours) — check for accuracy, formatting, no spam
3. Article published with trainer's profile card embedded at the bottom
4. Trainer notified via WhatsApp with the live URL to share

---

## The SQL Schema for Blog Posts

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body_markdown TEXT NOT NULL,
  cover_url TEXT,
  emoji TEXT DEFAULT '💪',
  category TEXT DEFAULT 'training',
  tags TEXT[] DEFAULT '{}',
  read_time_mins INTEGER DEFAULT 5,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast category filtering
CREATE INDEX idx_blog_posts_category ON blog_posts(category) WHERE published = true;
CREATE INDEX idx_blog_posts_trainer ON blog_posts(trainer_id) WHERE published = true;
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE published = true;
```

---

## Implementation Priority

| Week | Action |
|---|---|
| **1** | Add `blog_posts` table to Supabase schema |
| **1** | Deploy `blog.html` to Netlify |
| **2** | Add "Write an Article" section to `dashboard.html` with a simple markdown editor |
| **2** | Manually onboard 3 trainers to write the first articles (Ramadan guide, Dubai summer training, protein timing) |
| **3** | Submit the three articles to Google Search Console for indexing |
| **4** | Add the blog link to the main nav on `landing.html` and `index.html` |
| **Ongoing** | Publish 2–4 articles per week; track rankings in Google Search Console |
