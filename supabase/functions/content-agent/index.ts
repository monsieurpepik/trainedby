/**
 * TrainedBy  -  Content Agent v4 (Perplexity + Claude)
 * ─────────────────────────────────────────────────────────────────────────────
 * Two-step pipeline:
 *   1. Perplexity sonar-pro researches the keyword for current facts + citations
 *   2. Claude writes the article using those grounded facts as source material
 *
 * This produces cited, factually current content that pure LLM generation cannot.
 * The BPJEPS reform (Sept 2025) would have been caught automatically by this flow.
 *
 * POST /functions/v1/content-agent    -  generate + publish a new post (cron)
 * GET  /functions/v1/content-agent    -  return list of recent posts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { buildSystemPrompt, calculateSlopScore } from '../_shared/voice.ts';
import { callClaudeJSON } from '../_shared/claude.ts';
import { getLocale, getMarket, type Locale } from '../_shared/locale.ts';

const log = createLogger('content-agent');

// Per-locale keyword pools  -  each brand gets its own SEO context
const KEYWORD_POOLS: Record<string, string[]> = {
  'en-ae': [
    'personal trainer Dubai', 'personal trainer Abu Dhabi', 'certified personal trainer UAE',
    'REPs certified trainer Dubai', 'online personal trainer UAE', 'female personal trainer Dubai',
    'weight loss trainer Dubai', 'strength training Dubai', 'home personal trainer Dubai',
    'gym trainer salary UAE', 'how to become a personal trainer UAE', 'personal training rates Dubai',
    'nutrition coach Dubai', 'HIIT trainer Dubai', 'CrossFit coach Dubai',
    'postnatal fitness trainer Dubai', 'corporate wellness trainer UAE',
    'marathon training coach Dubai', 'mobility coach Dubai', 'sports performance trainer UAE',
  ],
  'en-uk': [
    'personal trainer London', 'personal trainer Manchester', 'certified personal trainer UK',
    'REPs UK certified trainer', 'online personal trainer UK', 'female personal trainer London',
    'weight loss trainer London', 'strength training London', 'home personal trainer UK',
    'personal training rates London', 'nutrition coach London', 'HIIT trainer London',
    'CrossFit coach UK', 'postnatal fitness trainer UK', 'corporate wellness trainer London',
    'marathon training coach UK', 'mobility coach London', 'sports performance trainer UK',
    'CIMSPA certified trainer', 'personal trainer near me UK',
  ],
  'en-us': [
    'personal trainer New York', 'personal trainer Los Angeles', 'NASM certified personal trainer',
    'ACE certified trainer', 'online personal trainer USA', 'female personal trainer NYC',
    'weight loss trainer New York', 'strength training coach USA', 'home personal trainer NYC',
    'personal training rates New York', 'nutrition coach New York', 'HIIT trainer NYC',
    'CrossFit coach New York', 'postnatal fitness trainer USA', 'corporate wellness trainer NYC',
    'marathon training coach USA', 'mobility coach New York', 'sports performance trainer USA',
    'NSCA certified trainer', 'personal trainer near me USA',
  ],
  'en-in': [
    'personal trainer Mumbai', 'personal trainer Delhi', 'certified personal trainer India',
    'online personal trainer India', 'female personal trainer Mumbai', 'weight loss trainer Delhi',
    'strength training coach India', 'home personal trainer Mumbai', 'nutrition coach India',
    'HIIT trainer Mumbai', 'CrossFit coach Delhi', 'postnatal fitness trainer India',
    'corporate wellness trainer Mumbai', 'marathon training coach India', 'mobility coach Delhi',
    'sports performance trainer India', 'personal training rates Mumbai', 'gym trainer India',
    'yoga trainer Mumbai', 'functional fitness trainer India',
  ],
  'es': [
    'entrenador personal Madrid', 'entrenador personal Barcelona', 'entrenador personal certificado España',
    'entrenador personal online España', 'entrenadora personal Madrid', 'pérdida de peso entrenador Madrid',
    'entrenamiento de fuerza Madrid', 'entrenador personal a domicilio Madrid',
    'tarifas entrenador personal Madrid', 'nutricionista deportivo Madrid', 'entrenador HIIT Barcelona',
    'CrossFit coach España', 'entrenador postnatal España', 'bienestar corporativo Madrid',
    'preparador físico maratón España', 'coach movilidad Madrid', 'rendimiento deportivo España',
    'entrenador personal Valencia', 'coach fitness Sevilla', 'personal trainer certificado España',
  ],
  'fr': [
    'coach sportif Paris', 'coach sportif Lyon', 'coach sportif certifié France',
    'coach sportif en ligne France', 'coach sportive Paris', 'coach perte de poids Paris',
    'entraînement musculation Paris', 'coach sportif à domicile Paris',
    'tarifs coach sportif Paris', 'coach nutrition Paris', 'coach HIIT Lyon',
    'coach CrossFit France', 'coach postnatal France', 'bien-être en entreprise Paris',
    'préparateur physique marathon France', 'coach mobilité Paris', 'performance sportive France',
    'coach fitness Marseille', 'coach personnel Bordeaux', 'coach certifié BPJEPS',
  ],
  'it': [
    'personal trainer Milano', 'personal trainer Roma', 'personal trainer certificato Italia',
    'personal trainer online Italia', 'personal trainer donna Milano', 'allenatore dimagrimento Roma',
    'allenamento forza Milano', 'personal trainer a domicilio Italia',
    'tariffe personal trainer Milano', 'nutrizionista sportivo Roma', 'allenatore HIIT Milano',
    'coach CrossFit Italia', 'personal trainer postnatale Italia', 'wellness aziendale Milano',
    'preparatore atletico maratona Italia', 'coach mobilità Roma', 'performance sportiva Italia',
    'personal trainer Torino', 'coach fitness Napoli', 'personal trainer certificato CONI',
  ],
};

function getKeywordPool(locale: string): string[] {
  return KEYWORD_POOLS[locale] ?? KEYWORD_POOLS['en-ae'];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });
  if (req.method === 'GET') return handleListPosts();
  if (req.method === 'POST') return handleGeneratePost(req);
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

async function handleGeneratePost(req: Request): Promise<Response> {
  const start = Date.now();

  // Detect locale from body param or origin header
  let locale = 'en-ae';
  try {
    const body = await req.clone().json().catch(() => ({}));
    const rawLocale = body.locale || getLocale(req.headers.get('origin'));
    locale = rawLocale || 'en-ae';
  } catch { /* default to en-ae */ }

  const market = getMarket(locale as Locale);
  log.info('Content agent started', { locale, brand: market.brandName });

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) return errorResponse('ANTHROPIC_API_KEY not configured', 500);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // ── 1. Pick unused keyword for this locale ───────────────────────────────────────────────────────────────────────────
  const keywordPool = getKeywordPool(locale);
  const { data: existingPosts } = await sb
    .from('blog_posts')
    .select('keyword')
    .eq('locale', locale)
    .order('published_at', { ascending: false })
    .limit(50);
  const usedKeywords = new Set((existingPosts ?? []).map((p: { keyword: string }) => p.keyword));
  const keyword = keywordPool.find(k => !usedKeywords.has(k)) ?? keywordPool[0];
  log.info('Selected keyword', { keyword, locale });

  // ── 2. Research keyword with Perplexity sonar-pro ────────────────────────────
  const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
  let researchBlock = '';
  let citations: string[] = [];

  if (perplexityKey) {
    try {
      log.info('Researching keyword with Perplexity', { keyword, locale });
      const research = await researchTopic(perplexityKey, keyword, market.language, market.country);
      researchBlock = research.content;
      citations = research.citations;
      log.info('Perplexity research complete', { citations_count: citations.length });
    } catch (err) {
      // Research failure is non-fatal - fall back to Claude's training data
      log.warn('Perplexity research failed - proceeding without grounded facts', { error: String(err) });
    }
  } else {
    log.warn('PERPLEXITY_API_KEY not set - skipping research step');
  }

  // ── 3. Build locale-aware system prompt ───────────────────────────────────────
  const isEnglish = market.languageCode === 'en';
  const languageRule = isEnglish
    ? ''
    : `CRITICAL: Write the ENTIRE post in ${market.language}. Do not use English anywhere in the post.`;

  const researchSection = researchBlock
    ? `
[RESEARCH - use these current facts and cite them inline where relevant]
${researchBlock}

Citations available:
${citations.map((c, i) => `[${i + 1}] ${c}`).join('\n')}

Instruction: Where you use a specific fact from the research above, add an inline citation like (Source: [domain]) after the sentence. Do not cite every sentence - only specific data points, costs, dates, or statistics.
`
    : '';

  const systemPrompt = buildSystemPrompt(`
You are writing a blog post for ${market.brandName} (${market.domain}) - the ${market.country} platform for verified personal trainers.
Target keyword: "${keyword}"

This post will be read by ${market.country}-based personal trainers and potential clients searching for trainers.
The certification body in this market is: ${market.certBody}.
${languageRule}
${researchSection}`);

  const cityRef = market.localContext.slice(0, 2).join(' or ');
  const userPrompt = `Write a blog post targeting: "${keyword}"

Requirements:
- 900-1100 words total
- Language: ${market.language} (ONLY)
- Mention ${cityRef} naturally at least twice (not forced)
- Include one specific, concrete scenario (a real situation a trainer faces, not a vague hypothetical)
- Reference ${market.certBody} certification where it fits naturally
- End with a single direct CTA: create a free ${market.brandName} profile at ${market.domain}
- Write in paragraphs - no bullet points in the main body
- Structure: punchy 2-3 sentence intro, 3-4 H2 sections of UNEQUAL length, short direct conclusion
- At least one sentence must start with a strong contrasting opener
- If research facts were provided, use them - do not invent statistics or costs

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

  // ── 4. Generate with slop retry ────────────────────────────────────────────
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
    log.warn('High slop score  -  regenerating', { score: slopScore });
  }

  // ── 5. Save to DB ──────────────────────────────────────────────────────────
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
      locale,
      brand: market.brandName,
      tags: post.tags ?? [],
      citations,
      word_count: post.word_count ?? 0,
      published_at: now,
      status: 'published',
      author: `${market.brandName} Content Agent`,
    })
    .select('id, slug')
    .single();

  if (insertErr) {
    log.error('Failed to insert blog post', { error: insertErr.message });
    return errorResponse('Failed to save post', 500);
  }

  log.info('Blog post saved', { id: inserted.id, slug: inserted.slug, slop_score: slopScore });

  // ── 6. Trigger Netlify deploy ──────────────────────────────────────────────
  const deployTriggered = await triggerNetlifyDeploy();

  // ── 7. Write memo ──────────────────────────────────────────────────────────
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
      research_used: !!researchBlock,
      citations_count: citations.length,
      model: 'claude-3-5-sonnet + perplexity-sonar-pro',
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

// ── Perplexity research helper ────────────────────────────────────────────────
interface ResearchResult {
  content: string;
  citations: string[];
}

async function researchTopic(
  apiKey: string,
  keyword: string,
  language: string,
  country: string,
): Promise<ResearchResult> {
  const languageInstruction = language === 'English'
    ? 'Respond in English.'
    : `Respond in ${language}.`;

  const prompt = `Research the following topic for a fitness industry blog post targeting ${country}:

Topic: "${keyword}"

Provide:
1. Current facts, statistics, and data points relevant to this topic in ${country}
2. Any recent changes, reforms, or updates (within the last 12 months) that affect this topic
3. Current costs, fees, or pricing if relevant
4. Regulatory or certification body requirements if relevant
5. Any notable trends or developments in this area

Be specific and factual. Include numbers, dates, and sources where available.
${languageInstruction}`;

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant for a fitness industry content team. Provide accurate, current, cited information. Be concise and factual.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.2,
      return_citations: true,
      return_related_questions: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const citations: string[] = (data.citations ?? []).map((c: string | { url: string }) =>
    typeof c === 'string' ? c : c.url
  );

  return { content, citations };
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
