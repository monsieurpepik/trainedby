-- Knowledge OS Migration
-- Enables the CEO bot's strategic memory, knowledge base, and directive system

-- pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Knowledge Base ─────────────────────────────────────────────────────────────
-- Stores chunked frameworks from Hormozi, SaaS playbooks, etc.
CREATE TABLE IF NOT EXISTS knowledge_base (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source      text NOT NULL,           -- 'hormozi', 'andrew_chen', 'lenny', etc.
  category    text NOT NULL,           -- 'pricing', 'growth', 'offer', 'retention', etc.
  title       text NOT NULL,
  content     text NOT NULL,
  embedding   vector(1536),            -- OpenAI/Claude embedding for semantic search
  tags        text[] DEFAULT ARRAY[]::text[],
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_base_source_idx ON knowledge_base(source);
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx ON knowledge_base(category);

-- ── Business Context ───────────────────────────────────────────────────────────
-- Weekly snapshot of business state, updated by meta-agent every Sunday
CREATE TABLE IF NOT EXISTS business_context (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start          date NOT NULL UNIQUE,
  mrr_aed             numeric DEFAULT 0,
  trainer_count       int DEFAULT 0,
  pro_count           int DEFAULT 0,
  free_count          int DEFAULT 0,
  new_signups_week    int DEFAULT 0,
  churn_week          int DEFAULT 0,
  funnel_conversion   numeric DEFAULT 0,  -- join_landing_view → signup_complete %
  open_problems       jsonb DEFAULT '[]'::jsonb,
  strategic_priority  text,
  hormozi_diagnosis   text,               -- Claude's Hormozi-framed diagnosis
  created_at          timestamptz DEFAULT now()
);

-- ── Directives ─────────────────────────────────────────────────────────────────
-- Strategic directives issued via /directive command, tracked to completion
CREATE TABLE IF NOT EXISTS directives (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  directive     text NOT NULL,
  status        text DEFAULT 'pending',  -- pending, in_progress, done, cancelled
  action_plan   jsonb,                   -- array of {agent, task, status}
  framework     text,                    -- which knowledge source was applied
  result        text,
  created_at    timestamptz DEFAULT now(),
  completed_at  timestamptz
);

-- ── Content Requests ───────────────────────────────────────────────────────────
-- Tracks outreach to trainers for expert blog contributions
CREATE TABLE IF NOT EXISTS content_requests (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id            uuid REFERENCES trainers(id) ON DELETE CASCADE,
  topic                 text NOT NULL,
  angle                 text,            -- specific angle suggested to the trainer
  outreach_subject      text,
  outreach_body         text,
  outreach_sent_at      timestamptz,
  response_received_at  timestamptz,
  status                text DEFAULT 'pending',  -- pending, sent, responded, published, declined
  draft                 text,
  published_at          timestamptz,
  blog_post_id          uuid REFERENCES blog_posts(id) ON DELETE SET NULL,
  created_at            timestamptz DEFAULT now()
);

-- ── Market Configs ─────────────────────────────────────────────────────────────
-- Per-market adaptations for .ae, .in, .uk, .com
CREATE TABLE IF NOT EXISTS market_configs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  market          text NOT NULL UNIQUE,  -- 'ae', 'in', 'uk', 'com'
  domain          text NOT NULL,
  currency        text NOT NULL,
  currency_symbol text NOT NULL,
  pro_price       numeric NOT NULL,
  pro_price_label text NOT NULL,
  certification_body text NOT NULL,      -- REPs UAE, REPs UK, NSCA India, etc.
  hero_headline   text NOT NULL,
  hero_subline    text NOT NULL,
  cta_text        text NOT NULL,
  trust_badges    text[] DEFAULT ARRAY[]::text[],
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- Seed market configs
INSERT INTO market_configs (market, domain, currency, currency_symbol, pro_price, pro_price_label, certification_body, hero_headline, hero_subline, cta_text, trust_badges)
VALUES
  ('ae', 'trainedby.ae', 'AED', 'AED', 149, '149 AED/month', 'REPs UAE',
   'The Verified Trainer Platform for the UAE',
   'REPs UAE certified. Client-ready in 60 seconds. Free forever.',
   'Create Your Free Profile',
   ARRAY['REPs UAE Verified', 'Dubai Fitness Challenge Partner', 'ADNOC Wellness Network']),

  ('uk', 'trainedby.uk', 'GBP', '£', 9.99, '£9.99/month', 'REPs UK',
   'The Verified Personal Trainer Platform for the UK',
   'REPs UK registered. Get found by local clients. Free forever.',
   'Create Your Free Profile',
   ARRAY['REPs UK Registered', 'CIMSPA Endorsed', 'UK Active Partner']),

  ('in', 'trainedby.in', 'INR', '₹', 999, '₹999/month', 'NSCA / ACSM India',
   'India''s Verified Fitness Professional Platform',
   'NSCA & ACSM certified trainers. Build your client base online.',
   'Create Your Free Profile',
   ARRAY['NSCA Certified', 'ACSM Accredited', 'Cult.fit Partner Network']),

  ('com', 'trainedby.com', 'USD', '$', 19, '$19/month', 'NASM / ACE / NSCA',
   'The Verified Personal Trainer Platform',
   'Internationally certified. Client-ready in 60 seconds. Free forever.',
   'Create Your Free Profile',
   ARRAY['NASM Certified', 'ACE Accredited', 'NSCA Member'])
ON CONFLICT (market) DO NOTHING;
