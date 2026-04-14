/**
 * TrainedBy — Content Agent v3 (Claude)
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates one SEO blog post per week using Claude 3.5 Sonnet.
 * Claude writes more naturally than GPT for long-form content.
 *
 * POST /functions/v1/content-agent   — generate + publish a new post (cron)
 * GET  /functions/v1/content-agent   — return list of recent posts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { buildSystemPrompt, calculateSlopScore } from '../_shared/voice.ts';
import { callClaudeJSON } from '../_shared/claude.ts';

const log = createLogger('content-agent');

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
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });
  if (req.method === 'GET') return handleListPosts();
  if (req.method === 'POST') return handleGeneratePost();
  return errorResponse('Method not allowed', 405);
});

async function handleListPosts(): Promise<Response> {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await sb
    .from('blog_posts')
    .select('id, slug, title, keyword, published_at, word_count')
    .order('published_at', { ascending: false })
    .limit(20);
  if (error) return errorResponse('Failed to fetch posts', 500);
  return jsonResponse({ posts: data });
}

async function handleGeneratePost(): Promise<Response> {
  const start = Date.now();
  log.info('Content agent v3 (Claude) started');

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) return errorResponse('ANTHROPIC_API_KEY not configured', 500);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // ── 1. Pick unused keyword ─────────────────────────────────────────────────
  const { data: existingPosts } = await sb
    .from('blog_posts').select('keyword').order('published_at', { ascending: false }).limit(50);
  const usedKeywords = new Set((existingPosts ?? []).map((p: { keyword: string }) => p.keyword));
  const keyword = KEYWORD_POOL.find(k => !usedKeywords.has(k)) ?? KEYWORD_POOL[0];
  log.info('Selected keyword', { keyword });

  // ── 2. Build system prompt with persona ───────────────────────────────────
  const systemPrompt = buildSystemPrompt(`
You are writing a blog post for TrainedBy.ae — the UAE platform for verified personal trainers.
Target keyword: "${keyword}"

This post will be read by UAE-based personal trainers and potential clients searching for trainers.
`);

  const userPrompt = `Write a blog post targeting: "${keyword}"

Requirements:
- 900-1100 words total
- Mention Dubai or Abu Dhabi naturally at least twice (not forced)
- Include one specific, concrete scenario (a real situation a trainer faces, not a vague hypothetical)
- Reference REPs UAE certification where it fits naturally
- End with a single direct CTA: create a free TrainedBy profile at trainedby.ae
- Write in paragraphs — no bullet points in the main body
- Structure: punchy 2-3 sentence intro, 3-4 H2 sections of UNEQUAL length, short direct conclusion
- At least one sentence must start with "But" or "Here's the thing"

Return valid JSON only (no markdown wrapping):
{
  "title": "Direct title, 50-60 chars, no clickbait",
  "meta_description": "155-160 char meta description, includes keyword",
  "slug": "url-slug-with-hyphens",
  "excerpt": "2-3 sentence excerpt, direct and specific",
  "content_markdown": "full post in Markdown with ## headings",
  "word_count": 950,
  "tags": ["tag1", "tag2", "tag3"]
}`;

  // ── 3. Generate with slop retry ────────────────────────────────────────────
  let post: Record<string, unknown> = {};
  let slopScore = 0;
  let slopFound: string[] = [];
  let attempts = 0;

  while (attempts < 3) {
    attempts++;
    try {
      post = await callClaudeJSON(anthropicKey, {
        model: 'claude-sonnet-4-5',
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 3000,
        temperature: 0.8,
      });
    } catch (err) {
      log.exception(err, { step: 'llm_generation', attempt: attempts });
      if (attempts >= 3) return errorResponse('LLM generation failed', 500);
      continue;
    }

    if (!post.title || !post.content_markdown) {
      if (attempts >= 3) return errorResponse('LLM returned incomplete post', 500);
      continue;
    }

    const check = calculateSlopScore(String(post.content_markdown));
    slopScore = check.score;
    slopFound = check.found;
    log.info('Slop check', { attempt: attempts, score: slopScore, found: slopFound });

    if (slopScore <= 20) break;
    log.warn('High slop score — regenerating', { score: slopScore });
  }

  // ── 4. Save to DB ──────────────────────────────────────────────────────────
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

  log.info('Blog post saved', { id: inserted.id, slug: inserted.slug, slop_score: slopScore });

  // ── 5. Trigger Netlify deploy ──────────────────────────────────────────────
  const deployTriggered = await triggerNetlifyDeploy();

  // ── 6. Write memo ──────────────────────────────────────────────────────────
  await sb.from('agent_memos').insert({
    agent: 'content-agent',
    memo: {
      agent: 'content-agent',
      week_ending: now,
      post_id: inserted.id,
      post_slug: inserted.slug,
      keyword,
      title: post.title,
      word_count: post.word_count,
      slop_score: slopScore,
      slop_found: slopFound,
      attempts,
      deploy_triggered: deployTriggered,
      model: 'claude-3-5-sonnet',
      generated_at: now,
    },
    created_at: now,
  });

  log.info('Content agent complete', { duration_ms: Date.now() - start, slop_score: slopScore, attempts });

  return jsonResponse({
    ok: true,
    post: { id: inserted.id, slug: inserted.slug, title: post.title, keyword, word_count: post.word_count },
    quality: { slop_score: slopScore, slop_found: slopFound, attempts },
    deploy_triggered: deployTriggered,
  });
}

async function triggerNetlifyDeploy(): Promise<boolean> {
  const netlifyHook = Deno.env.get('NETLIFY_BUILD_HOOK');
  if (!netlifyHook) return false;
  try {
    const res = await fetch(netlifyHook, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
