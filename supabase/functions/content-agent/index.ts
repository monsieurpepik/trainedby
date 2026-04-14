/**
 * TrainedBy — Content Agent v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates one SEO-optimised blog post per week targeting UAE personal trainer
 * search queries. Uses the TrainedBy Voice System to ensure every post sounds
 * like a real trainer wrote it — not an AI.
 *
 * POST /functions/v1/content-agent   — generate + publish a new post (cron)
 * GET  /functions/v1/content-agent   — return list of recent posts
 *
 * Anti-slop measures:
 *   1. Strong persona injection via TRAINEDBY_PERSONA
 *   2. Banned phrase list enforced in the prompt
 *   3. Slop score calculated on output — regenerates up to 2x if score > 20
 *   4. Structural constraints: asymmetric sections, UAE-specific examples required
 *   5. Temperature 0.8 for natural variation
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { buildSystemPrompt, calculateSlopScore, TRAINEDBY_PERSONA } from '../_shared/voice.ts';

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (req.method === 'GET') return handleListPosts();
  if (req.method === 'POST') return handleGeneratePost();
  return errorResponse('Method not allowed', 405);
});

async function handleListPosts(): Promise<Response> {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data, error } = await sb
    .from('blog_posts')
    .select('id, slug, title, keyword, published_at, word_count, slop_score')
    .order('published_at', { ascending: false })
    .limit(20);
  if (error) return errorResponse('Failed to fetch posts', 500);
  return jsonResponse({ posts: data });
}

async function handleGeneratePost(): Promise<Response> {
  const start = Date.now();
  log.info('Content agent v2 started');

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return errorResponse('OPENAI_API_KEY not configured', 500);

  const openaiBase = (Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1');

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ── 1. Pick unused keyword ─────────────────────────────────────────────────
  const { data: existingPosts } = await sb
    .from('blog_posts')
    .select('keyword')
    .order('published_at', { ascending: false })
    .limit(50);

  const usedKeywords = new Set((existingPosts ?? []).map((p: { keyword: string }) => p.keyword));
  const keyword = KEYWORD_POOL.find(k => !usedKeywords.has(k)) ?? KEYWORD_POOL[0];
  log.info('Selected keyword', { keyword });

  // ── 2. Build prompt with voice system ─────────────────────────────────────
  const systemPrompt = buildSystemPrompt(`
You are writing a blog post for TrainedBy.ae, the UAE's platform for verified personal trainers.
Target keyword: "${keyword}"
`);

  const userPrompt = `Write a blog post targeting: "${keyword}"

Requirements:
- 900-1100 words
- UAE-specific: mention Dubai or Abu Dhabi naturally at least twice
- Include a specific, concrete example (a real scenario, not a hypothetical)
- Reference REPs UAE certification where it makes sense
- End with a single, direct call to action to create a free TrainedBy profile
- Do NOT use bullet points for the main body — write in paragraphs
- Structure: a punchy intro (no more than 3 sentences), 3-4 H2 sections of UNEQUAL length, a short direct conclusion

Respond as JSON:
{
  "title": "Direct, specific title (50-60 chars, no clickbait)",
  "meta_description": "155-160 char meta description",
  "slug": "url-slug",
  "excerpt": "2-3 sentence excerpt — direct and specific, no vague promises",
  "content_markdown": "full post in Markdown",
  "word_count": 950,
  "tags": ["tag1", "tag2", "tag3"]
}`;

  // ── 3. Generate with retry on high slop score ──────────────────────────────
  let post: Record<string, unknown> = {};
  let slopScore = 0;
  let slopFound: string[] = [];
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      const aiRes = await fetch(`${openaiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 2500,
        }),
      });
      const aiData = await aiRes.json();
      post = JSON.parse(aiData.choices?.[0]?.message?.content ?? '{}');
    } catch (err) {
      log.exception(err, { step: 'llm_generation', attempt: attempts });
      if (attempts >= MAX_ATTEMPTS) return errorResponse('LLM generation failed', 500);
      continue;
    }

    if (!post.title || !post.content_markdown) {
      if (attempts >= MAX_ATTEMPTS) return errorResponse('LLM returned incomplete post', 500);
      continue;
    }

    // Check slop score
    const check = calculateSlopScore(String(post.content_markdown));
    slopScore = check.score;
    slopFound = check.found;

    log.info('Slop check', { attempt: attempts, score: slopScore, found: slopFound });

    if (slopScore <= 20) break; // Clean enough

    log.warn('High slop score — regenerating', { score: slopScore, found: slopFound });
    // Add the banned phrases to the next attempt's prompt
    if (attempts < MAX_ATTEMPTS) {
      // The next iteration will use the same prompt — the randomness of temperature 0.8
      // combined with the persona injection usually fixes it on attempt 2
    }
  }

  // ── 4. Insert into blog_posts ──────────────────────────────────────────────
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
      slop_score: slopScore,
      published_at: now,
      status: 'published',
      author: 'TrainedBy Content Agent',
    })
    .select('id, slug')
    .single();

  if (insertErr) {
    // Try without slop_score column if it doesn't exist yet
    const { data: inserted2, error: insertErr2 } = await sb
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

    if (insertErr2) {
      log.error('Failed to insert blog post', { error: insertErr2.message });
      return errorResponse('Failed to save post', 500);
    }

    log.info('Blog post saved (without slop_score)', { id: inserted2.id, slug: inserted2.slug });

    // Trigger Netlify deploy
    const deployTriggered = await triggerNetlifyDeploy();

    // Write memo
    await sb.from('agent_memos').insert({
      agent: 'content-agent',
      memo: {
        agent: 'content-agent',
        week_ending: now,
        post_id: inserted2.id,
        post_slug: inserted2.slug,
        keyword,
        title: post.title,
        word_count: post.word_count,
        slop_score: slopScore,
        slop_found: slopFound,
        attempts,
        deploy_triggered: deployTriggered,
        generated_at: now,
      },
      created_at: now,
    });

    return jsonResponse({
      ok: true,
      post: { id: inserted2.id, slug: inserted2.slug, title: post.title, keyword, word_count: post.word_count },
      quality: { slop_score: slopScore, slop_found: slopFound, attempts },
      deploy_triggered: deployTriggered,
    });
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
