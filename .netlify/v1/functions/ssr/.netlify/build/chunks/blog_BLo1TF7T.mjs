import { g as getMarket, $ as $$Base } from './Base_CMDzg9CE.mjs';
import { c as createComponent } from './astro-component_BvaTlKiI.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_Dvw9vuPO.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Blog = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Blog;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${brandName} Blog — Expert Fitness Advice from Verified Trainers`, "description": "Evidence-based fitness, nutrition, and training articles from UAE's REPs-verified personal trainers.", "data-astro-cid-ijnerlr2": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["   ", '<nav class="nav" data-astro-cid-ijnerlr2> <div class="nav-inner" data-astro-cid-ijnerlr2> <a href="/landing.html" class="nav-logo" data-astro-cid-ijnerlr2> <svg width="28" height="28" viewBox="0 0 32 32" data-astro-cid-ijnerlr2><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-ijnerlr2></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-ijnerlr2>TB</text></svg> ', ' </a> <div class="nav-links" data-astro-cid-ijnerlr2> <a href="/find.html" data-astro-cid-ijnerlr2>Find a Trainer</a> <a href="/blog.html" class="active" data-astro-cid-ijnerlr2>Blog</a> <a href="/join.html" class="nav-cta" data-astro-cid-ijnerlr2>Get Your Page</a> </div> </div> </nav>  <div class="blog-hero" data-astro-cid-ijnerlr2> <div class="blog-hero-eyebrow" data-astro-cid-ijnerlr2>Expert Knowledge</div> <h1 class="blog-hero-title" data-astro-cid-ijnerlr2>Fitness advice from<br data-astro-cid-ijnerlr2>trainers who actually train.</h1> <p class="blog-hero-sub" data-astro-cid-ijnerlr2>Every article on ', ` is written by a verified personal trainer. No generic content. No AI fluff. Real expertise, cited sources.</p> <div class="blog-hero-stats" data-astro-cid-ijnerlr2> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="article-count" data-astro-cid-ijnerlr2>—</strong> articles published</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="trainer-count" data-astro-cid-ijnerlr2>—</strong> verified trainers contributing</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong data-astro-cid-ijnerlr2>100%</strong> evidence-based</div> </div> </div>  <div class="filter-bar" id="filter-bar" data-astro-cid-ijnerlr2> <button class="filter-pill active" onclick="filterArticles('all', this)" data-astro-cid-ijnerlr2>All</button> <button class="filter-pill" onclick="filterArticles('nutrition', this)" data-astro-cid-ijnerlr2>Nutrition</button> <button class="filter-pill" onclick="filterArticles('training', this)" data-astro-cid-ijnerlr2>Training</button> <button class="filter-pill" onclick="filterArticles('fat-loss', this)" data-astro-cid-ijnerlr2>Fat Loss</button> <button class="filter-pill" onclick="filterArticles('muscle-gain', this)" data-astro-cid-ijnerlr2>Muscle Gain</button> <button class="filter-pill" onclick="filterArticles('recovery', this)" data-astro-cid-ijnerlr2>Recovery</button> <button class="filter-pill" onclick="filterArticles('mindset', this)" data-astro-cid-ijnerlr2>Mindset</button> <button class="filter-pill" onclick="filterArticles('uae-lifestyle', this)" data-astro-cid-ijnerlr2>UAE Lifestyle</button> </div>  <div class="blog-main" data-astro-cid-ijnerlr2> <div class="blog-content" data-astro-cid-ijnerlr2> <!-- Write for us banner --> <div class="write-banner" data-astro-cid-ijnerlr2> <div class="write-banner-title" data-astro-cid-ijnerlr2>Are you a REPs UAE verified trainer?</div> <div class="write-banner-sub" data-astro-cid-ijnerlr2>Publish an article on `, ' and get your profile in front of thousands of potential clients searching for expertise in your specialty.</div> <a href="/edit.html" class="write-banner-btn" data-astro-cid-ijnerlr2>Write for ', ' →</a> </div> <!-- Featured article --> <div id="featured-slot" data-astro-cid-ijnerlr2></div> <!-- Article grid --> <div id="article-grid" class="article-grid" data-astro-cid-ijnerlr2></div> <!-- Empty state --> <div id="empty-state" class="empty-state" style="display:none;" data-astro-cid-ijnerlr2> <div class="empty-state-icon" data-astro-cid-ijnerlr2>📝</div> <div class="empty-state-title" data-astro-cid-ijnerlr2>No articles yet in this category</div> <p data-astro-cid-ijnerlr2>Be the first trainer to publish in this category. Your article will be featured here and indexed by Google.</p> </div> </div> <!-- Sidebar --> <aside class="blog-sidebar" data-astro-cid-ijnerlr2> <!-- Top contributors --> <div class="sidebar-card" data-astro-cid-ijnerlr2> <div class="sidebar-title" data-astro-cid-ijnerlr2>Top Contributors</div> <div id="top-contributors" data-astro-cid-ijnerlr2></div> </div> <!-- CTA --> <div class="sidebar-cta" data-astro-cid-ijnerlr2> <div class="sidebar-cta-title" data-astro-cid-ijnerlr2>Find your perfect trainer in Dubai</div> <div class="sidebar-cta-sub" data-astro-cid-ijnerlr2>Browse 100+ REPs UAE verified personal trainers. Free to contact.</div> <a href="/find.html" class="sidebar-cta-btn" data-astro-cid-ijnerlr2>Browse Trainers →</a> </div> </aside> </div>  <footer class="blog-footer" data-astro-cid-ijnerlr2> <p data-astro-cid-ijnerlr2>© ', " ", ` · <a href="/landing.html" data-astro-cid-ijnerlr2>For Trainers</a> · <a href="/find.html" data-astro-cid-ijnerlr2>Find a Trainer</a> · <a href="/blog.html" data-astro-cid-ijnerlr2>Blog</a></p> </footer> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allArticles = [];
let activeCategory = 'all';

async function loadBlog() {
  try {
    // Load articles from Supabase (table: blog_posts, joined with trainers)
    const { data: articles, error } = await sb
      .from('blog_posts')
      .select(\`
        id, title, slug, excerpt, category, cover_url, emoji, read_time_mins,
        published_at, view_count,
        trainer:trainer_id (id, name, slug, avatar_url, photo_url, reps_verified, specialties)
      \`)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error || !articles) {
      renderSampleArticles();
      return;
    }

    allArticles = articles;
    renderArticles(articles);
    loadTopContributors(articles);
    updateStats(articles);
  } catch(e) {
    renderSampleArticles();
  }
}

function renderArticles(articles) {
  const featuredSlot = document.getElementById('featured-slot');
  const grid = document.getElementById('article-grid');
  const emptyState = document.getElementById('empty-state');

  featuredSlot.innerHTML = '';
  grid.innerHTML = '';

  if (!articles.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  // Featured (first article)
  const featured = articles[0];
  featuredSlot.innerHTML = buildFeaturedCard(featured);

  // Grid (remaining)
  articles.slice(1).forEach(a => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.onclick = () => goToArticle(a.slug || a.id);
    card.innerHTML = buildArticleCard(a);
    grid.appendChild(card);
  });
}

function buildFeaturedCard(a) {
  const trainer = a.trainer || {};
  const initials = (trainer.name||'TB').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const avatarHtml = trainer.avatar_url || trainer.photo_url
    ? \`<img class="article-meta-avatar" src="\${trainer.avatar_url||trainer.photo_url}" alt="\${trainer.name}">\`
    : \`<div class="article-meta-avatar-initials">\${initials}</div>\`;
  const imgHtml = a.cover_url
    ? \`<img class="featured-img" src="\${a.cover_url}" alt="\${a.title}" loading="lazy">\`
    : \`<div class="featured-img-placeholder">\${a.emoji || '💪'}</div>\`;
  const date = a.published_at ? new Date(a.published_at).toLocaleDateString('en-AE', {day:'numeric',month:'long',year:'numeric'}) : '';
  return \`
    <div class="featured-article" onclick="goToArticle('\${a.slug||a.id}')">
      \${imgHtml}
      <div class="featured-body">
        <div class="article-category">\${a.category || 'Training'}</div>
        <div class="featured-title">\${a.title}</div>
        <div class="featured-excerpt">\${a.excerpt || ''}</div>
        <div class="article-meta">
          \${avatarHtml}
          <span class="article-meta-name">\${trainer.name || \`\${window.__BRAND__?.name || 'TrainedBy'} Trainer\`}</span>
          \${trainer.reps_verified ? '<span class="reps-badge-sm">REPs</span>' : ''}
          <span>·</span>
          <span>\${a.read_time_mins || 5} min read</span>
          \${date ? \`<span>·</span><span>\${date}</span>\` : ''}
        </div>
      </div>
    </div>\`;
}

function buildArticleCard(a) {
  const trainer = a.trainer || {};
  const initials = (trainer.name||'TB').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const imgHtml = a.cover_url
    ? \`<img class="article-card-img" src="\${a.cover_url}" alt="\${a.title}" loading="lazy">\`
    : \`<div class="article-card-img-placeholder">\${a.emoji || '🏋️'}</div>\`;
  return \`
    \${imgHtml}
    <div class="article-card-body">
      <div class="article-category" style="margin-bottom:6px;">\${a.category || 'Training'}</div>
      <div class="article-card-title">\${a.title}</div>
      <div class="article-card-meta">
        <span>\${trainer.name || 'Trainer'}</span>
        \${trainer.reps_verified ? '<span class="reps-badge-sm">REPs</span>' : ''}
        <span>·</span>
        <span>\${a.read_time_mins || 5} min</span>
      </div>
    </div>\`;
}

function loadTopContributors(articles) {
  const trainerMap = {};
  articles.forEach(a => {
    if (!a.trainer) return;
    const t = a.trainer;
    if (!trainerMap[t.id]) trainerMap[t.id] = { ...t, count: 0 };
    trainerMap[t.id].count++;
  });
  const top = Object.values(trainerMap).sort((a,b) => b.count - a.count).slice(0,5);
  const container = document.getElementById('top-contributors');
  if (!top.length) {
    container.innerHTML = '<div style="font-size:12px;color:var(--text-faint);">No contributors yet — be the first to publish.</div>';
    return;
  }
  top.forEach(t => {
    const initials = (t.name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const a = document.createElement('a');
    a.href = \`/\${t.slug}\`;
    a.className = 'sidebar-trainer';
    a.innerHTML = \`
      <div class="sidebar-trainer-av">\${initials}</div>
      <div>
        <div class="sidebar-trainer-name">\${t.name}</div>
        <div class="sidebar-trainer-spec">\${t.count} article\${t.count>1?'s':''} · \${(t.specialties||[])[0] || 'Personal Trainer'}</div>
      </div>\`;
    container.appendChild(a);
  });
}

function updateStats(articles) {
  document.getElementById('article-count').textContent = articles.length;
  const uniqueTrainers = new Set(articles.map(a => a.trainer?.id).filter(Boolean)).size;
  document.getElementById('trainer-count').textContent = uniqueTrainers || '—';
}

function filterArticles(category, btn) {
  activeCategory = category;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  if (category === 'all') {
    renderArticles(allArticles);
  } else {
    const filtered = allArticles.filter(a => (a.category||'').toLowerCase().replace(/\\s+/g,'-') === category);
    renderArticles(filtered);
  }
}

function goToArticle(slugOrId) {
  window.location.href = \`/blog/\${slugOrId}\`;
}

// Sample articles for when DB is empty or blog_posts table doesn't exist yet
function renderSampleArticles() {
  const samples = [
    {
      id: 1, title: 'How to Train During Ramadan: A Complete Guide for UAE Athletes',
      excerpt: 'Fasting during Ramadan doesn\\'t mean losing your gains. Here\\'s how to structure your training, nutrition, and recovery around the holy month.',
      category: 'UAE Lifestyle', emoji: '🌙', read_time_mins: 7,
      trainer: { name: 'Ahmed Al Mansoori', reps_verified: true, specialties: ['Strength', 'Nutrition'] }
    },
    {
      id: 2, title: 'The Truth About Protein Timing: What the Science Actually Says',
      excerpt: 'Does it matter when you eat protein? We reviewed 12 studies so you don\\'t have to.',
      category: 'Nutrition', emoji: '🥩', read_time_mins: 5,
      trainer: { name: 'Sarah Mitchell', reps_verified: true, specialties: ['Nutrition'] }
    },
    {
      id: 3, title: '5 Exercises Every Dubai Office Worker Should Do Daily',
      excerpt: 'Sitting 8 hours a day in an air-conditioned office is destroying your posture. Fix it in 15 minutes.',
      category: 'Training', emoji: '🏢', read_time_mins: 4,
      trainer: { name: 'Marcus Chen', reps_verified: true, specialties: ['Rehabilitation'] }
    },
    {
      id: 4, title: 'Fat Loss in the UAE Summer: Training Smart When It\\'s 45°C Outside',
      excerpt: 'The heat is not an excuse. Here\\'s how to keep burning fat when the temperature makes outdoor training dangerous.',
      category: 'Fat Loss', emoji: '☀️', read_time_mins: 6,
      trainer: { name: 'Layla Hassan', reps_verified: true, specialties: ['Fat Loss', 'HIIT'] }
    },
    {
      id: 5, title: 'Why Most People Never Build the Body They Want (And How to Fix It)',
      excerpt: 'It\\'s not your genetics, your gym, or your schedule. It\\'s your offer to yourself.',
      category: 'Mindset', emoji: '🧠', read_time_mins: 8,
      trainer: { name: 'James Okafor', reps_verified: true, specialties: ['Strength', 'Mindset'] }
    }
  ];
  allArticles = samples;
  renderArticles(samples);
  loadTopContributors(samples);
  document.getElementById('article-count').textContent = '5+';
  document.getElementById('trainer-count').textContent = '5';
}

// Init
loadBlog();
<\/script> `], ["   ", '<nav class="nav" data-astro-cid-ijnerlr2> <div class="nav-inner" data-astro-cid-ijnerlr2> <a href="/landing.html" class="nav-logo" data-astro-cid-ijnerlr2> <svg width="28" height="28" viewBox="0 0 32 32" data-astro-cid-ijnerlr2><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-ijnerlr2></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-ijnerlr2>TB</text></svg> ', ' </a> <div class="nav-links" data-astro-cid-ijnerlr2> <a href="/find.html" data-astro-cid-ijnerlr2>Find a Trainer</a> <a href="/blog.html" class="active" data-astro-cid-ijnerlr2>Blog</a> <a href="/join.html" class="nav-cta" data-astro-cid-ijnerlr2>Get Your Page</a> </div> </div> </nav>  <div class="blog-hero" data-astro-cid-ijnerlr2> <div class="blog-hero-eyebrow" data-astro-cid-ijnerlr2>Expert Knowledge</div> <h1 class="blog-hero-title" data-astro-cid-ijnerlr2>Fitness advice from<br data-astro-cid-ijnerlr2>trainers who actually train.</h1> <p class="blog-hero-sub" data-astro-cid-ijnerlr2>Every article on ', ` is written by a verified personal trainer. No generic content. No AI fluff. Real expertise, cited sources.</p> <div class="blog-hero-stats" data-astro-cid-ijnerlr2> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="article-count" data-astro-cid-ijnerlr2>—</strong> articles published</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="trainer-count" data-astro-cid-ijnerlr2>—</strong> verified trainers contributing</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong data-astro-cid-ijnerlr2>100%</strong> evidence-based</div> </div> </div>  <div class="filter-bar" id="filter-bar" data-astro-cid-ijnerlr2> <button class="filter-pill active" onclick="filterArticles('all', this)" data-astro-cid-ijnerlr2>All</button> <button class="filter-pill" onclick="filterArticles('nutrition', this)" data-astro-cid-ijnerlr2>Nutrition</button> <button class="filter-pill" onclick="filterArticles('training', this)" data-astro-cid-ijnerlr2>Training</button> <button class="filter-pill" onclick="filterArticles('fat-loss', this)" data-astro-cid-ijnerlr2>Fat Loss</button> <button class="filter-pill" onclick="filterArticles('muscle-gain', this)" data-astro-cid-ijnerlr2>Muscle Gain</button> <button class="filter-pill" onclick="filterArticles('recovery', this)" data-astro-cid-ijnerlr2>Recovery</button> <button class="filter-pill" onclick="filterArticles('mindset', this)" data-astro-cid-ijnerlr2>Mindset</button> <button class="filter-pill" onclick="filterArticles('uae-lifestyle', this)" data-astro-cid-ijnerlr2>UAE Lifestyle</button> </div>  <div class="blog-main" data-astro-cid-ijnerlr2> <div class="blog-content" data-astro-cid-ijnerlr2> <!-- Write for us banner --> <div class="write-banner" data-astro-cid-ijnerlr2> <div class="write-banner-title" data-astro-cid-ijnerlr2>Are you a REPs UAE verified trainer?</div> <div class="write-banner-sub" data-astro-cid-ijnerlr2>Publish an article on `, ' and get your profile in front of thousands of potential clients searching for expertise in your specialty.</div> <a href="/edit.html" class="write-banner-btn" data-astro-cid-ijnerlr2>Write for ', ' →</a> </div> <!-- Featured article --> <div id="featured-slot" data-astro-cid-ijnerlr2></div> <!-- Article grid --> <div id="article-grid" class="article-grid" data-astro-cid-ijnerlr2></div> <!-- Empty state --> <div id="empty-state" class="empty-state" style="display:none;" data-astro-cid-ijnerlr2> <div class="empty-state-icon" data-astro-cid-ijnerlr2>📝</div> <div class="empty-state-title" data-astro-cid-ijnerlr2>No articles yet in this category</div> <p data-astro-cid-ijnerlr2>Be the first trainer to publish in this category. Your article will be featured here and indexed by Google.</p> </div> </div> <!-- Sidebar --> <aside class="blog-sidebar" data-astro-cid-ijnerlr2> <!-- Top contributors --> <div class="sidebar-card" data-astro-cid-ijnerlr2> <div class="sidebar-title" data-astro-cid-ijnerlr2>Top Contributors</div> <div id="top-contributors" data-astro-cid-ijnerlr2></div> </div> <!-- CTA --> <div class="sidebar-cta" data-astro-cid-ijnerlr2> <div class="sidebar-cta-title" data-astro-cid-ijnerlr2>Find your perfect trainer in Dubai</div> <div class="sidebar-cta-sub" data-astro-cid-ijnerlr2>Browse 100+ REPs UAE verified personal trainers. Free to contact.</div> <a href="/find.html" class="sidebar-cta-btn" data-astro-cid-ijnerlr2>Browse Trainers →</a> </div> </aside> </div>  <footer class="blog-footer" data-astro-cid-ijnerlr2> <p data-astro-cid-ijnerlr2>© ', " ", ` · <a href="/landing.html" data-astro-cid-ijnerlr2>For Trainers</a> · <a href="/find.html" data-astro-cid-ijnerlr2>Find a Trainer</a> · <a href="/blog.html" data-astro-cid-ijnerlr2>Blog</a></p> </footer> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allArticles = [];
let activeCategory = 'all';

async function loadBlog() {
  try {
    // Load articles from Supabase (table: blog_posts, joined with trainers)
    const { data: articles, error } = await sb
      .from('blog_posts')
      .select(\\\`
        id, title, slug, excerpt, category, cover_url, emoji, read_time_mins,
        published_at, view_count,
        trainer:trainer_id (id, name, slug, avatar_url, photo_url, reps_verified, specialties)
      \\\`)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error || !articles) {
      renderSampleArticles();
      return;
    }

    allArticles = articles;
    renderArticles(articles);
    loadTopContributors(articles);
    updateStats(articles);
  } catch(e) {
    renderSampleArticles();
  }
}

function renderArticles(articles) {
  const featuredSlot = document.getElementById('featured-slot');
  const grid = document.getElementById('article-grid');
  const emptyState = document.getElementById('empty-state');

  featuredSlot.innerHTML = '';
  grid.innerHTML = '';

  if (!articles.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  // Featured (first article)
  const featured = articles[0];
  featuredSlot.innerHTML = buildFeaturedCard(featured);

  // Grid (remaining)
  articles.slice(1).forEach(a => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.onclick = () => goToArticle(a.slug || a.id);
    card.innerHTML = buildArticleCard(a);
    grid.appendChild(card);
  });
}

function buildFeaturedCard(a) {
  const trainer = a.trainer || {};
  const initials = (trainer.name||'TB').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const avatarHtml = trainer.avatar_url || trainer.photo_url
    ? \\\`<img class="article-meta-avatar" src="\\\${trainer.avatar_url||trainer.photo_url}" alt="\\\${trainer.name}">\\\`
    : \\\`<div class="article-meta-avatar-initials">\\\${initials}</div>\\\`;
  const imgHtml = a.cover_url
    ? \\\`<img class="featured-img" src="\\\${a.cover_url}" alt="\\\${a.title}" loading="lazy">\\\`
    : \\\`<div class="featured-img-placeholder">\\\${a.emoji || '💪'}</div>\\\`;
  const date = a.published_at ? new Date(a.published_at).toLocaleDateString('en-AE', {day:'numeric',month:'long',year:'numeric'}) : '';
  return \\\`
    <div class="featured-article" onclick="goToArticle('\\\${a.slug||a.id}')">
      \\\${imgHtml}
      <div class="featured-body">
        <div class="article-category">\\\${a.category || 'Training'}</div>
        <div class="featured-title">\\\${a.title}</div>
        <div class="featured-excerpt">\\\${a.excerpt || ''}</div>
        <div class="article-meta">
          \\\${avatarHtml}
          <span class="article-meta-name">\\\${trainer.name || \\\`\\\${window.__BRAND__?.name || 'TrainedBy'} Trainer\\\`}</span>
          \\\${trainer.reps_verified ? '<span class="reps-badge-sm">REPs</span>' : ''}
          <span>·</span>
          <span>\\\${a.read_time_mins || 5} min read</span>
          \\\${date ? \\\`<span>·</span><span>\\\${date}</span>\\\` : ''}
        </div>
      </div>
    </div>\\\`;
}

function buildArticleCard(a) {
  const trainer = a.trainer || {};
  const initials = (trainer.name||'TB').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const imgHtml = a.cover_url
    ? \\\`<img class="article-card-img" src="\\\${a.cover_url}" alt="\\\${a.title}" loading="lazy">\\\`
    : \\\`<div class="article-card-img-placeholder">\\\${a.emoji || '🏋️'}</div>\\\`;
  return \\\`
    \\\${imgHtml}
    <div class="article-card-body">
      <div class="article-category" style="margin-bottom:6px;">\\\${a.category || 'Training'}</div>
      <div class="article-card-title">\\\${a.title}</div>
      <div class="article-card-meta">
        <span>\\\${trainer.name || 'Trainer'}</span>
        \\\${trainer.reps_verified ? '<span class="reps-badge-sm">REPs</span>' : ''}
        <span>·</span>
        <span>\\\${a.read_time_mins || 5} min</span>
      </div>
    </div>\\\`;
}

function loadTopContributors(articles) {
  const trainerMap = {};
  articles.forEach(a => {
    if (!a.trainer) return;
    const t = a.trainer;
    if (!trainerMap[t.id]) trainerMap[t.id] = { ...t, count: 0 };
    trainerMap[t.id].count++;
  });
  const top = Object.values(trainerMap).sort((a,b) => b.count - a.count).slice(0,5);
  const container = document.getElementById('top-contributors');
  if (!top.length) {
    container.innerHTML = '<div style="font-size:12px;color:var(--text-faint);">No contributors yet — be the first to publish.</div>';
    return;
  }
  top.forEach(t => {
    const initials = (t.name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const a = document.createElement('a');
    a.href = \\\`/\\\${t.slug}\\\`;
    a.className = 'sidebar-trainer';
    a.innerHTML = \\\`
      <div class="sidebar-trainer-av">\\\${initials}</div>
      <div>
        <div class="sidebar-trainer-name">\\\${t.name}</div>
        <div class="sidebar-trainer-spec">\\\${t.count} article\\\${t.count>1?'s':''} · \\\${(t.specialties||[])[0] || 'Personal Trainer'}</div>
      </div>\\\`;
    container.appendChild(a);
  });
}

function updateStats(articles) {
  document.getElementById('article-count').textContent = articles.length;
  const uniqueTrainers = new Set(articles.map(a => a.trainer?.id).filter(Boolean)).size;
  document.getElementById('trainer-count').textContent = uniqueTrainers || '—';
}

function filterArticles(category, btn) {
  activeCategory = category;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  if (category === 'all') {
    renderArticles(allArticles);
  } else {
    const filtered = allArticles.filter(a => (a.category||'').toLowerCase().replace(/\\\\s+/g,'-') === category);
    renderArticles(filtered);
  }
}

function goToArticle(slugOrId) {
  window.location.href = \\\`/blog/\\\${slugOrId}\\\`;
}

// Sample articles for when DB is empty or blog_posts table doesn't exist yet
function renderSampleArticles() {
  const samples = [
    {
      id: 1, title: 'How to Train During Ramadan: A Complete Guide for UAE Athletes',
      excerpt: 'Fasting during Ramadan doesn\\\\'t mean losing your gains. Here\\\\'s how to structure your training, nutrition, and recovery around the holy month.',
      category: 'UAE Lifestyle', emoji: '🌙', read_time_mins: 7,
      trainer: { name: 'Ahmed Al Mansoori', reps_verified: true, specialties: ['Strength', 'Nutrition'] }
    },
    {
      id: 2, title: 'The Truth About Protein Timing: What the Science Actually Says',
      excerpt: 'Does it matter when you eat protein? We reviewed 12 studies so you don\\\\'t have to.',
      category: 'Nutrition', emoji: '🥩', read_time_mins: 5,
      trainer: { name: 'Sarah Mitchell', reps_verified: true, specialties: ['Nutrition'] }
    },
    {
      id: 3, title: '5 Exercises Every Dubai Office Worker Should Do Daily',
      excerpt: 'Sitting 8 hours a day in an air-conditioned office is destroying your posture. Fix it in 15 minutes.',
      category: 'Training', emoji: '🏢', read_time_mins: 4,
      trainer: { name: 'Marcus Chen', reps_verified: true, specialties: ['Rehabilitation'] }
    },
    {
      id: 4, title: 'Fat Loss in the UAE Summer: Training Smart When It\\\\'s 45°C Outside',
      excerpt: 'The heat is not an excuse. Here\\\\'s how to keep burning fat when the temperature makes outdoor training dangerous.',
      category: 'Fat Loss', emoji: '☀️', read_time_mins: 6,
      trainer: { name: 'Layla Hassan', reps_verified: true, specialties: ['Fat Loss', 'HIIT'] }
    },
    {
      id: 5, title: 'Why Most People Never Build the Body They Want (And How to Fix It)',
      excerpt: 'It\\\\'s not your genetics, your gym, or your schedule. It\\\\'s your offer to yourself.',
      category: 'Mindset', emoji: '🧠', read_time_mins: 8,
      trainer: { name: 'James Okafor', reps_verified: true, specialties: ['Strength', 'Mindset'] }
    }
  ];
  allArticles = samples;
  renderArticles(samples);
  loadTopContributors(samples);
  document.getElementById('article-count').textContent = '5+';
  document.getElementById('trainer-count').textContent = '5';
}

// Init
loadBlog();
<\/script> `])), maybeRenderHead(), brandName, brandName, brandName, brandName, (/* @__PURE__ */ new Date()).getFullYear(), brandName) })}`;
}, "/home/ubuntu/trainedby2/src/pages/blog.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/blog.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Blog,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
