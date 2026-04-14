/**
 * TrainedBy — Content Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates one SEO-optimised blog post per week targeting UAE personal trainer
 * search queries, commits it to the GitHub repo, and writes a memo for the
 * meta-agent.
 *
 * POST /functions/v1/content-agent   — generate + publish a new post (cron)
 * GET  /functions/v1/content-agent   — return list of recent posts
 *
 * Strategy:
 *   1. Pull the last 10 posts from `blog_posts` to avoid topic repetition
 *   2. Pick the highest-value unused keyword from a seeded keyword list
 *   3. Generate a full 800-1200 word post with LLM (structured JSON output)
 *   4. Insert into `blog_posts` table (Astro reads this at build time)
 *   5. Trigger a Netlify deploy hook to rebuild the site
 *   6. Write memo to `agent_memos` for meta-agent
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('content-agent');

// High-value UAE trainer keywords (ordered by estimated monthly search volume)
const KEYWORD_POOL = [
  'personal trainer Dubai',
  'personal trainer Abu Dhabi',
  'certified personal trainer UAE',
  'REPs certified trainer Dubai',
  'online personal trainer UAE',
  'female personal trainer Dubai',
  'weight loss trainer Dubai',
  'strength training Dubai',
  'home personal trainer Dubai',
  'gym trainer salary UAE',
  'how to become a personal trainer UAE',
  'personal training rates Dubai',
  'nutrition coach Dubai',
  'HIIT trainer Dubai',
  'CrossFit coach Dubai',
  'postnatal fitness trainer Dubai',
  'corporate wellness trainer UAE',
  'marathon training coach Dubai',
  'mobility coach Dubai',
  'sports performance trainer UAE',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (req.method === 'GET') {
    return handleListPosts(req);
  }

  if (req.method === 'POST') {
    return handleGeneratePost(req);
  }

  return errorResponse('Method not allowed', 405);
});

// ─── List recent posts ────────────────────────────────────────────────────────
async function handleListPosts(_req: Request): Promise<Response> {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data, error } = await sb
    .from('blog_posts')
    .select('id, slug, title, keyword, published_at, word_count')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) return errorResponse('Failed to fetch posts', 500);
  return jsonResponse({ posts: data });
}

// ─── Generate and publish a new blog post ────────────────────────────────────
async function handleGeneratePost(_req: Request): Promise<Response> {
  const start = Date.now();
  log.info('Content agent started');

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return errorResponse('OPENAI_API_KEY not configured', 500);

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ── 1. Find an unused keyword ─────────────────────────────────────────────
  const { data: existingPosts } = await sb
    .from('blog_posts')
    .select('keyword')
    .order('published_at', { ascending: false })
    .limit(50);

  const usedKeywords = new Set((existingPosts ?? []).map((p: { keyword: string }) => p.keyword));
  const keyword = KEYWORD_POOL.find(k => !usedKeywords.has(k)) ?? KEYWORD_POOL[0];

  log.info('Selected keyword', { keyword });

  // ── 2. Generate post with LLM ─────────────────────────────────────────────
  const prompt = `You are a content strategist for TrainedBy.ae, the UAE's platform for verified personal trainers.

Write a high-quality, SEO-optimised blog post targeting the keyword: "${keyword}"

Requirements:
- 900-1100 words
- Tone: professional, helpful, UAE-specific (mention Dubai/Abu Dhabi/UAE naturally)
- Include: practical advice, local context, a mention of REPs certification where relevant
- End with a soft CTA to create a free TrainedBy profile
- Structure: intro, 3-4 H2 sections, conclusion

Respond as JSON:
{
  "title": "SEO-optimised title (50-60 chars)",
  "meta_description": "155-160 char meta description",
  "slug": "url-slug-from-title",
  "excerpt": "2-3 sentence excerpt for listing pages",
  "content_markdown": "full post in Markdown",
  "word_count": 950,
  "tags": ["tag1", "tag2", "tag3"]
}`;

  let post: Record<string, unknown>;
  try {
    const aiRes = await fetch((Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 2500,
      }),
    });
    const aiData = await aiRes.json();
    post = JSON.parse(aiData.choices?.[0]?.message?.content ?? '{}');
  } catch (err) {
    log.exception(err, { step: 'llm_generation' });
    return errorResponse('LLM generation failed', 500);
  }

  if (!post.title || !post.content_markdown) {
    return errorResponse('LLM returned incomplete post', 500);
  }

  // ── 3. Insert into blog_posts table ──────────────────────────────────────
  const now = new Date().toISOString();
  const { data: inserted, error: insertErr } = await sb
    .from('blog_posts')
    .insert({
      slug: post.slug,
      title: post.title,
      meta_description: post.meta_description,
      excerpt: post.excerpt,
      content_markdown: post.content_markdown,
      keyword,
      tags: post.tags ?? [],
      word_count: post.word_count ?? 0,
      published_at: now,
      status: 'published',
      author: 'TrainedBy Content Agent',
    })
    .select('id, slug')
    .single();

  if (insertErr) {
    log.error('Failed to insert blog post', { error: insertErr.message });
    return errorResponse('Failed to save post', 500);
  }

  log.info('Blog post saved', { id: inserted.id, slug: inserted.slug });

  // ── 4. Trigger Netlify deploy hook ────────────────────────────────────────
  let deployTriggered = false;
  const netlifyHook = Deno.env.get('NETLIFY_BUILD_HOOK');
  if (netlifyHook) {
    try {
      const hookRes = await fetch(netlifyHook, { method: 'POST' });
      deployTriggered = hookRes.ok;
      log.info('Netlify deploy triggered', { ok: hookRes.ok });
    } catch (hookErr) {
      log.warn('Netlify deploy hook failed', { error: String(hookErr) });
    }
  }

  // ── 5. Write memo for meta-agent ─────────────────────────────────────────
  const memo = {
    agent: 'content-agent',
    week_ending: now,
    post_id: inserted.id,
    post_slug: inserted.slug,
    keyword,
    title: post.title,
    word_count: post.word_count,
    deploy_triggered: deployTriggered,
    generated_at: now,
  };

  await sb.from('agent_memos').insert({
    agent: 'content-agent',
    memo,
    created_at: now,
  });

  log.info('Content agent complete', { duration_ms: Date.now() - start });

  return jsonResponse({
    ok: true,
    post: {
      id: inserted.id,
      slug: inserted.slug,
      title: post.title,
      keyword,
      word_count: post.word_count,
    },
    deploy_triggered: deployTriggered,
  });
}
