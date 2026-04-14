-- ─────────────────────────────────────────────────────────────────────────────
-- TrainedBy Agent OS — Database Tables
-- Migration: 20260414_agent_os.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. funnel_events — raw event stream from the frontend ────────────────────
CREATE TABLE IF NOT EXISTS funnel_events (
  id           BIGSERIAL PRIMARY KEY,
  event        TEXT        NOT NULL,
  properties   JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_event       ON funnel_events (event);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at  ON funnel_events (created_at);

-- ── 2. agent_memos — output store for all agents ─────────────────────────────
CREATE TABLE IF NOT EXISTS agent_memos (
  id         BIGSERIAL PRIMARY KEY,
  agent      TEXT        NOT NULL,  -- 'growth-agent' | 'content-agent' | 'support-agent' | 'meta-agent'
  memo       JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memos_agent       ON agent_memos (agent);
CREATE INDEX IF NOT EXISTS idx_agent_memos_created_at  ON agent_memos (created_at);

-- ── 3. blog_posts — content agent output ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id                BIGSERIAL PRIMARY KEY,
  slug              TEXT        NOT NULL UNIQUE,
  title             TEXT        NOT NULL,
  meta_description  TEXT,
  excerpt           TEXT,
  content_markdown  TEXT        NOT NULL,
  keyword           TEXT,
  tags              TEXT[]      NOT NULL DEFAULT '{}',
  word_count        INTEGER     NOT NULL DEFAULT 0,
  status            TEXT        NOT NULL DEFAULT 'published',  -- 'draft' | 'published'
  author            TEXT        NOT NULL DEFAULT 'TrainedBy Content Agent',
  published_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug         ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_keyword      ON blog_posts (keyword);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status       ON blog_posts (status);

-- Full-text search on blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts ON blog_posts
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(content_markdown, '')));

-- ── 4. support_docs — RAG knowledge base for support agent ───────────────────
CREATE TABLE IF NOT EXISTS support_docs (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  category   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index for support docs
CREATE INDEX IF NOT EXISTS idx_support_docs_fts ON support_docs
  USING GIN (to_tsvector('english', title || ' ' || content));

-- ── 5. support_conversations — log of all support agent interactions ──────────
CREATE TABLE IF NOT EXISTS support_conversations (
  id              BIGSERIAL PRIMARY KEY,
  conversation_id UUID        NOT NULL DEFAULT gen_random_uuid(),
  trainer_id      UUID,
  question        TEXT        NOT NULL,
  answer          TEXT        NOT NULL,
  context_used    TEXT,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_convs_trainer_id ON support_conversations (trainer_id);
CREATE INDEX IF NOT EXISTS idx_support_convs_created_at ON support_conversations (created_at);

-- ── 6. Seed support_docs with initial knowledge base ─────────────────────────
INSERT INTO support_docs (title, content, category) VALUES
(
  'Pricing — Free vs Pro',
  'TrainedBy has two tiers: Free (verified profile, public listing, basic analytics, no credit card needed) and Pro (149 AED/month — digital product sales, Affiliate Vault, Grand Slam Offer builder, priority listing, advanced analytics, custom domain). You can upgrade or downgrade at any time from your dashboard.',
  'pricing'
),
(
  'REPs UAE Verification',
  'REPs UAE (Register of Exercise Professionals) is the official UAE fitness industry register. TrainedBy verifies your REPs status automatically when you sign up. Your badge appears on your public profile and builds client trust. If your REPs status changes, your badge updates automatically within 24 hours.',
  'verification'
),
(
  'Digital Products',
  'Pro trainers can sell digital products directly from their TrainedBy profile: PDF training plans, video programmes, nutrition guides, and assessment templates. Payments are processed via Stripe. You receive 95% of each sale (5% platform fee). Payouts are weekly to your UAE bank account.',
  'monetisation'
),
(
  'Affiliate Vault',
  'The Affiliate Vault gives Pro trainers access to pre-negotiated affiliate deals with UAE fitness brands (supplements, equipment, apparel). You activate the brands you want, share your unique link, and earn commission on every purchase — automatically, every month. No minimum threshold for payouts.',
  'monetisation'
),
(
  'Referral Programme',
  'Every Pro trainer gets a unique referral link. When another trainer signs up to Pro through your link, you earn 20% of their monthly subscription — recurring, for as long as they stay. Refer 4 trainers and your Pro subscription is free forever.',
  'referral'
),
(
  'Grand Slam Offer Builder (Plan Builder)',
  'The Grand Slam Offer Builder helps you create high-ticket training packages that combine sessions, digital products, and affiliate products into a single compelling offer. It uses AI to suggest pricing and positioning based on your speciality and target client.',
  'features'
),
(
  'Magic Link Login',
  'TrainedBy uses passwordless login (magic links). Enter your email, receive a one-time login link, click it to access your dashboard. Links expire after 15 minutes. If you do not receive the email, check your spam folder or try again.',
  'auth'
),
(
  'Your Profile URL',
  'Your TrainedBy profile URL is trainedby.ae/yourname. You can customise your slug, bio, specialities, certifications, and social links from the Edit Profile page. Your REPs badge is automatically added once verification is complete.',
  'profile'
),
(
  'Cancellation Policy',
  'You can cancel your Pro subscription at any time from your dashboard under Settings → Subscription. Your profile reverts to the Free tier at the end of your billing period. Your digital products, affiliate earnings, and profile data are preserved.',
  'billing'
),
(
  'Support Contact',
  'For urgent issues, email support@trainedby.ae. Response time is within 4 hours during UAE business hours (Sunday to Thursday, 9am to 6pm GST). For non-urgent questions, use the in-dashboard chat.',
  'support'
),
(
  'ROI Guarantee',
  'TrainedBy offers a 30-day ROI guarantee for Pro subscribers. If you do not earn at least 1,000 AED in new revenue within 30 days of upgrading to Pro, we will refund your first month in full. No questions asked.',
  'pricing'
),
(
  'Profile Views and Analytics',
  'Your dashboard shows profile views, lead enquiries, WhatsApp taps, and digital product sales. Pro trainers also see weekly trend data and comparison to the platform average. All analytics update in real time.',
  'analytics'
)
ON CONFLICT DO NOTHING;

-- ── 7. RLS policies ───────────────────────────────────────────────────────────
-- funnel_events: insert-only from anon (no reads from client)
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='funnel_events' AND policyname='anon_insert_funnel_events') THEN
    CREATE POLICY "anon_insert_funnel_events" ON funnel_events FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- agent_memos: service role only
ALTER TABLE agent_memos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_memos' AND policyname='service_role_agent_memos') THEN
    CREATE POLICY "service_role_agent_memos" ON agent_memos FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- blog_posts: public read, service role write
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='public_read_blog_posts') THEN
    CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT TO anon USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='service_role_blog_posts') THEN
    CREATE POLICY "service_role_blog_posts" ON blog_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- support_docs: public read
ALTER TABLE support_docs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_docs' AND policyname='public_read_support_docs') THEN
    CREATE POLICY "public_read_support_docs" ON support_docs FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_docs' AND policyname='service_role_support_docs') THEN
    CREATE POLICY "service_role_support_docs" ON support_docs FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- support_conversations: service role only
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_conversations' AND policyname='service_role_support_conversations') THEN
    CREATE POLICY "service_role_support_conversations" ON support_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
