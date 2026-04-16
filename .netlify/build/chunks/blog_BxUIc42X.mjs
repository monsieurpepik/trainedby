import { g as getMarket, a as getLocale, t, $ as $$Base } from './Base_DM9Bo6nY.mjs';
import { c as createComponent } from './astro-component_0rau4Qud.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_Bip7PqCq.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Blog = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Blog;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  const locale = getLocale(Astro2.request);
  const blogStrings = {
    eyebrow: t(locale, "blog.eyebrow") || (locale === "es" ? "Conocimiento Experto" : locale === "fr" ? "Expertise" : locale === "it" ? "Conoscenza Esperta" : "Expert Knowledge"),
    title: t(locale, "blog.title") || (locale === "es" ? "Consejos de entrenadores que realmente entrenan." : locale === "fr" ? "Conseils de coachs qui s'entraînent vraiment." : locale === "it" ? "Consigli da allenatori che si allenano davvero." : "Fitness advice from trainers who actually train."),
    sub: t(locale, "blog.sub") || (locale === "es" ? `Cada artículo en ${brandName} está escrito por un entrenador certificado y verificado.` : locale === "fr" ? `Chaque article sur ${brandName} est écrit par un coach certifié et vérifié.` : locale === "it" ? `Ogni articolo su ${brandName} è scritto da un allenatore certificato e verificato.` : `Every article on ${brandName} is written by a verified personal trainer. No generic content. No AI fluff. Real expertise, cited sources.`),
    articles_stat: t(locale, "blog.articles_stat") || (locale === "es" ? "artículos publicados" : locale === "fr" ? "articles publiés" : locale === "it" ? "articoli pubblicati" : "articles published"),
    trainers_stat: t(locale, "blog.trainers_stat") || (locale === "es" ? "entrenadores contribuyendo" : locale === "fr" ? "coachs contributeurs" : locale === "it" ? "allenatori che contribuiscono" : "verified trainers contributing"),
    evidence: t(locale, "blog.evidence") || (locale === "es" ? "100% basado en evidencia" : locale === "fr" ? "100% basé sur des preuves" : locale === "it" ? "100% basato su prove" : "100% evidence-based"),
    filter_all: t(locale, "filter_all") || "All",
    filter_nutrition: t(locale, "blog_cat_nutrition") || (locale === "es" ? "Nutrición" : locale === "fr" ? "Nutrition" : locale === "it" ? "Nutrizione" : "Nutrition"),
    filter_training: t(locale, "blog.filter_training") || (locale === "es" ? "Entrenamiento" : locale === "fr" ? "Entraînement" : locale === "it" ? "Allenamento" : "Training"),
    filter_fatloss: t(locale, "blog.filter_fatloss") || (locale === "es" ? "Pérdida de grasa" : locale === "fr" ? "Perte de graisse" : locale === "it" ? "Perdita di grasso" : "Fat Loss"),
    filter_muscle: t(locale, "blog.filter_muscle") || (locale === "es" ? "Ganancia muscular" : locale === "fr" ? "Prise de muscle" : locale === "it" ? "Massa muscolare" : "Muscle Gain"),
    filter_recovery: t(locale, "blog.filter_recovery") || (locale === "es" ? "Recuperación" : locale === "fr" ? "Récupération" : locale === "it" ? "Recupero" : "Recovery"),
    filter_mindset: t(locale, "blog_cat_mindset") || (locale === "es" ? "Mentalidad" : locale === "fr" ? "Mentalité" : locale === "it" ? "Mentalità" : "Mindset"),
    filter_local: locale === "es" ? "Vida en España" : locale === "fr" ? "Vie en France" : locale === "it" ? "Vita in Italia" : "Local Lifestyle",
    write_title: t(locale, "blog.write_title") || (locale === "es" ? `¿Eres un entrenador certificado?` : locale === "fr" ? "Êtes-vous un coach certifié ?" : locale === "it" ? "Sei un allenatore certificato?" : `Are you a verified trainer?`),
    write_sub: t(locale, "blog.write_sub") || (locale === "es" ? `Publica un artículo en ${brandName} y pon tu perfil frente a miles de clientes potenciales.` : locale === "fr" ? `Publiez un article sur ${brandName} et mettez votre profil devant des milliers de clients potentiels.` : locale === "it" ? `Pubblica un articolo su ${brandName} e metti il tuo profilo davanti a migliaia di potenziali clienti.` : `Publish an article on ${brandName} and get your profile in front of thousands of potential clients.`),
    write_cta: t(locale, "blog.write_cta") || (locale === "es" ? `Escribir para ${brandName} →` : locale === "fr" ? `Écrire pour ${brandName} →` : locale === "it" ? `Scrivi per ${brandName} →` : `Write for ${brandName} →`),
    sidebar_contributors: t(locale, "blog.contributors") || (locale === "es" ? "Principales Colaboradores" : locale === "fr" ? "Principaux Contributeurs" : locale === "it" ? "Principali Contributori" : "Top Contributors"),
    sidebar_cta_title: t(locale, "blog.sidebar_cta_title") || (locale === "es" ? `Encuentra tu entrenador perfecto` : locale === "fr" ? "Trouvez votre coach idéal" : locale === "it" ? "Trova il tuo allenatore perfetto" : `Find your perfect trainer`),
    sidebar_cta_sub: t(locale, "blog.sidebar_cta_sub") || (locale === "es" ? `Explora entrenadores certificados. Gratis para contactar.` : locale === "fr" ? "Parcourez les coachs certifiés. Gratuit pour contacter." : locale === "it" ? "Sfoglia allenatori certificati. Gratuito da contattare." : `Browse verified personal trainers. Free to contact.`),
    sidebar_cta_btn: t(locale, "blog.sidebar_cta_btn") || (locale === "es" ? "Ver Entrenadores →" : locale === "fr" ? "Voir les Coachs →" : locale === "it" ? "Vedi Allenatori →" : "Browse Trainers →"),
    nav_find: t(locale, "nav_find") || "Find a Trainer",
    nav_blog: t(locale, "nav_blog") || "Blog",
    nav_join_cta: locale === "es" ? "Empieza →" : locale === "fr" ? "Commencer →" : locale === "it" ? "Inizia →" : "Get Your Page",
    footer_for_trainers: t(locale, "footer_for_trainers") || "For Trainers",
    footer_find: t(locale, "footer_find") || "Find a Trainer",
    empty_title: locale === "es" ? "Aún no hay artículos en esta categoría" : locale === "fr" ? "Pas encore d'articles dans cette catégorie" : locale === "it" ? "Nessun articolo in questa categoria" : "No articles yet in this category",
    empty_sub: locale === "es" ? "Sé el primero en publicar en esta categoría." : locale === "fr" ? "Soyez le premier à publier dans cette catégorie." : locale === "it" ? "Sii il primo a pubblicare in questa categoria." : "Be the first trainer to publish in this category."
  };
  const sampleArticles = {
    es: [
      { id: 1, title: "Cómo entrenar en verano: guía completa para el calor", excerpt: "El calor no es una excusa. Aquí te mostramos cómo seguir quemando grasa cuando la temperatura sube.", category: "Entrenamiento", emoji: "☀️", read_time_mins: 7, trainer: { name: "Carlos Martínez", reps_verified: true, specialties: ["Fuerza", "HIIT"] } },
      { id: 2, title: "La verdad sobre el timing de proteínas: lo que dice la ciencia", excerpt: "¿Importa cuándo comes proteínas? Revisamos 12 estudios para que no tengas que hacerlo.", category: "Nutrición", emoji: "🥩", read_time_mins: 5, trainer: { name: "Ana García", reps_verified: true, specialties: ["Nutrición"] } },
      { id: 3, title: "5 ejercicios que todo trabajador de oficina debería hacer a diario", excerpt: "Sentarse 8 horas al día está destruyendo tu postura. Corrígelo en 15 minutos.", category: "Entrenamiento", emoji: "🏢", read_time_mins: 4, trainer: { name: "Luis Rodríguez", reps_verified: true, specialties: ["Rehabilitación"] } },
      { id: 4, title: "Por qué la mayoría nunca construye el cuerpo que quiere (y cómo solucionarlo)", excerpt: "No son tus genes, tu gimnasio ni tu horario. Es tu compromiso contigo mismo.", category: "Mentalidad", emoji: "🧠", read_time_mins: 8, trainer: { name: "María López", reps_verified: true, specialties: ["Fuerza", "Mentalidad"] } }
    ],
    fr: [
      { id: 1, title: "Comment s'entraîner en été : le guide complet pour la chaleur", excerpt: "La chaleur n'est pas une excuse. Voici comment continuer à brûler des graisses quand il fait chaud.", category: "Entraînement", emoji: "☀️", read_time_mins: 7, trainer: { name: "Thomas Dupont", reps_verified: true, specialties: ["Force", "HIIT"] } },
      { id: 2, title: "La vérité sur le timing des protéines : ce que dit la science", excerpt: "Est-ce que le moment où vous mangez des protéines est important ? Nous avons examiné 12 études.", category: "Nutrition", emoji: "🥩", read_time_mins: 5, trainer: { name: "Sophie Martin", reps_verified: true, specialties: ["Nutrition"] } },
      { id: 3, title: "5 exercices que tout employé de bureau devrait faire quotidiennement", excerpt: "Rester assis 8 heures par jour détruit votre posture. Corrigez-le en 15 minutes.", category: "Entraînement", emoji: "🏢", read_time_mins: 4, trainer: { name: "Nicolas Bernard", reps_verified: true, specialties: ["Rééducation"] } },
      { id: 4, title: "Pourquoi la plupart des gens ne construisent jamais le corps qu'ils veulent", excerpt: "Ce ne sont pas vos gènes, votre salle de sport ou votre emploi du temps. C'est votre engagement envers vous-même.", category: "Mentalité", emoji: "🧠", read_time_mins: 8, trainer: { name: "Camille Leroy", reps_verified: true, specialties: ["Force", "Mentalité"] } }
    ],
    it: [
      { id: 1, title: "Come allenarsi in estate: la guida completa per il caldo", excerpt: "Il caldo non è una scusa. Ecco come continuare a bruciare grassi quando la temperatura sale.", category: "Allenamento", emoji: "☀️", read_time_mins: 7, trainer: { name: "Marco Rossi", reps_verified: true, specialties: ["Forza", "HIIT"] } },
      { id: 2, title: "La verità sul timing delle proteine: cosa dice la scienza", excerpt: "È importante quando mangi le proteine? Abbiamo esaminato 12 studi per te.", category: "Nutrizione", emoji: "🥩", read_time_mins: 5, trainer: { name: "Giulia Ferrari", reps_verified: true, specialties: ["Nutrizione"] } },
      { id: 3, title: "5 esercizi che ogni lavoratore d'ufficio dovrebbe fare ogni giorno", excerpt: "Stare seduti 8 ore al giorno sta distruggendo la tua postura. Correggilo in 15 minuti.", category: "Allenamento", emoji: "🏢", read_time_mins: 4, trainer: { name: "Luca Bianchi", reps_verified: true, specialties: ["Riabilitazione"] } },
      { id: 4, title: "Perché la maggior parte delle persone non costruisce mai il corpo che vuole", excerpt: "Non sono i tuoi geni, la tua palestra o il tuo orario. È il tuo impegno verso te stesso.", category: "Mentalità", emoji: "🧠", read_time_mins: 8, trainer: { name: "Sara Esposito", reps_verified: true, specialties: ["Forza", "Mentalità"] } }
    ],
    en: [
      { id: 1, title: "How to Train During Ramadan: A Complete Guide", excerpt: "Fasting doesn't mean losing your gains. Here's how to structure your training and nutrition.", category: "Lifestyle", emoji: "🌙", read_time_mins: 7, trainer: { name: "Ahmed Al Mansoori", reps_verified: true, specialties: ["Strength", "Nutrition"] } },
      { id: 2, title: "The Truth About Protein Timing: What the Science Actually Says", excerpt: "Does it matter when you eat protein? We reviewed 12 studies so you don't have to.", category: "Nutrition", emoji: "🥩", read_time_mins: 5, trainer: { name: "Sarah Mitchell", reps_verified: true, specialties: ["Nutrition"] } },
      { id: 3, title: "5 Exercises Every Office Worker Should Do Daily", excerpt: "Sitting 8 hours a day is destroying your posture. Fix it in 15 minutes.", category: "Training", emoji: "🏢", read_time_mins: 4, trainer: { name: "Marcus Chen", reps_verified: true, specialties: ["Rehabilitation"] } },
      { id: 4, title: "Why Most People Never Build the Body They Want (And How to Fix It)", excerpt: "It's not your genetics, your gym, or your schedule. It's your offer to yourself.", category: "Mindset", emoji: "🧠", read_time_mins: 8, trainer: { name: "James Okafor", reps_verified: true, specialties: ["Strength", "Mindset"] } }
    ]
  };
  JSON.stringify(sampleArticles[locale] || sampleArticles.en);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${brandName} Blog  -  ${blogStrings.title.split("\n")[0]}`, "description": blogStrings.sub, "data-astro-cid-ijnerlr2": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["   ", '<nav class="nav" data-astro-cid-ijnerlr2> <div class="nav-inner" data-astro-cid-ijnerlr2> <a href="/" class="nav-logo" data-astro-cid-ijnerlr2> <svg width="28" height="28" viewBox="0 0 32 32" data-astro-cid-ijnerlr2><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-ijnerlr2></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-ijnerlr2>TB</text></svg> ', ' </a> <div class="nav-links" data-astro-cid-ijnerlr2> <a href="/find" data-astro-cid-ijnerlr2>', '</a> <a href="/blog" class="active" data-astro-cid-ijnerlr2>', '</a> <a href="/join" class="nav-cta" data-astro-cid-ijnerlr2>', '</a> </div> </div> </nav>  <div class="blog-hero" data-astro-cid-ijnerlr2> <div class="blog-hero-eyebrow" data-astro-cid-ijnerlr2>', '</div> <h1 class="blog-hero-title" data-astro-cid-ijnerlr2>', '</h1> <p class="blog-hero-sub" data-astro-cid-ijnerlr2>', '</p> <div class="blog-hero-stats" data-astro-cid-ijnerlr2> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="article-count" data-astro-cid-ijnerlr2> - </strong> ', '</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="trainer-count" data-astro-cid-ijnerlr2> - </strong> ', '</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong data-astro-cid-ijnerlr2>100%</strong> ', `</div> </div> </div>  <div class="filter-bar" id="filter-bar" data-astro-cid-ijnerlr2> <button class="filter-pill active" onclick="filterArticles('all', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('nutrition', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('training', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('fat-loss', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('muscle-gain', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('recovery', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('mindset', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('local', this)" data-astro-cid-ijnerlr2>`, '</button> </div>  <div class="blog-main" data-astro-cid-ijnerlr2> <div class="blog-content" data-astro-cid-ijnerlr2> <!-- Write for us banner --> <div class="write-banner" data-astro-cid-ijnerlr2> <div class="write-banner-title" data-astro-cid-ijnerlr2>', '</div> <div class="write-banner-sub" data-astro-cid-ijnerlr2>', '</div> <a href="/edit" class="write-banner-btn" data-astro-cid-ijnerlr2>', '</a> </div> <!-- Featured article --> <div id="featured-slot" data-astro-cid-ijnerlr2></div> <!-- Article grid --> <div id="article-grid" class="article-grid" data-astro-cid-ijnerlr2></div> <!-- Empty state --> <div id="empty-state" class="empty-state" style="display:none;" data-astro-cid-ijnerlr2> <div class="empty-state-icon" data-astro-cid-ijnerlr2>📝</div> <div class="empty-state-title" data-astro-cid-ijnerlr2>', "</div> <p data-astro-cid-ijnerlr2>", '</p> </div> </div> <!-- Sidebar --> <aside class="blog-sidebar" data-astro-cid-ijnerlr2> <!-- Top contributors --> <div class="sidebar-card" data-astro-cid-ijnerlr2> <div class="sidebar-title" data-astro-cid-ijnerlr2>', '</div> <div id="top-contributors" data-astro-cid-ijnerlr2></div> </div> <!-- CTA --> <div class="sidebar-cta" data-astro-cid-ijnerlr2> <div class="sidebar-cta-title" data-astro-cid-ijnerlr2>', '</div> <div class="sidebar-cta-sub" data-astro-cid-ijnerlr2>', '</div> <a href="/find" class="sidebar-cta-btn" data-astro-cid-ijnerlr2>', '</a> </div> </aside> </div>  <footer class="blog-footer" data-astro-cid-ijnerlr2> <p data-astro-cid-ijnerlr2>© ', " ", ' · <a href="/" data-astro-cid-ijnerlr2>', '</a> · <a href="/find" data-astro-cid-ijnerlr2>', '</a> · <a href="/blog" data-astro-cid-ijnerlr2>', `</a></p> </footer> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
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
    container.innerHTML = '<div style="font-size:12px;color:var(--text-faint);">No contributors yet  -  be the first to publish.</div>';
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
  document.getElementById('trainer-count').textContent = uniqueTrainers || ' - ';
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

// Sample articles for when DB is empty  -  locale-aware
const LOCALE_SAMPLES = {localeSamplesJson};
function renderSampleArticles() {
  const samples = LOCALE_SAMPLES;
  allArticles = samples;
  renderArticles(samples);
  loadTopContributors(samples);
  document.getElementById('article-count').textContent = samples.length + '+';
  document.getElementById('trainer-count').textContent = samples.length;
}

// Init
loadBlog();
<\/script> `], ["   ", '<nav class="nav" data-astro-cid-ijnerlr2> <div class="nav-inner" data-astro-cid-ijnerlr2> <a href="/" class="nav-logo" data-astro-cid-ijnerlr2> <svg width="28" height="28" viewBox="0 0 32 32" data-astro-cid-ijnerlr2><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-ijnerlr2></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-ijnerlr2>TB</text></svg> ', ' </a> <div class="nav-links" data-astro-cid-ijnerlr2> <a href="/find" data-astro-cid-ijnerlr2>', '</a> <a href="/blog" class="active" data-astro-cid-ijnerlr2>', '</a> <a href="/join" class="nav-cta" data-astro-cid-ijnerlr2>', '</a> </div> </div> </nav>  <div class="blog-hero" data-astro-cid-ijnerlr2> <div class="blog-hero-eyebrow" data-astro-cid-ijnerlr2>', '</div> <h1 class="blog-hero-title" data-astro-cid-ijnerlr2>', '</h1> <p class="blog-hero-sub" data-astro-cid-ijnerlr2>', '</p> <div class="blog-hero-stats" data-astro-cid-ijnerlr2> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="article-count" data-astro-cid-ijnerlr2> - </strong> ', '</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong id="trainer-count" data-astro-cid-ijnerlr2> - </strong> ', '</div> <div class="blog-stat" data-astro-cid-ijnerlr2><strong data-astro-cid-ijnerlr2>100%</strong> ', `</div> </div> </div>  <div class="filter-bar" id="filter-bar" data-astro-cid-ijnerlr2> <button class="filter-pill active" onclick="filterArticles('all', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('nutrition', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('training', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('fat-loss', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('muscle-gain', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('recovery', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('mindset', this)" data-astro-cid-ijnerlr2>`, `</button> <button class="filter-pill" onclick="filterArticles('local', this)" data-astro-cid-ijnerlr2>`, '</button> </div>  <div class="blog-main" data-astro-cid-ijnerlr2> <div class="blog-content" data-astro-cid-ijnerlr2> <!-- Write for us banner --> <div class="write-banner" data-astro-cid-ijnerlr2> <div class="write-banner-title" data-astro-cid-ijnerlr2>', '</div> <div class="write-banner-sub" data-astro-cid-ijnerlr2>', '</div> <a href="/edit" class="write-banner-btn" data-astro-cid-ijnerlr2>', '</a> </div> <!-- Featured article --> <div id="featured-slot" data-astro-cid-ijnerlr2></div> <!-- Article grid --> <div id="article-grid" class="article-grid" data-astro-cid-ijnerlr2></div> <!-- Empty state --> <div id="empty-state" class="empty-state" style="display:none;" data-astro-cid-ijnerlr2> <div class="empty-state-icon" data-astro-cid-ijnerlr2>📝</div> <div class="empty-state-title" data-astro-cid-ijnerlr2>', "</div> <p data-astro-cid-ijnerlr2>", '</p> </div> </div> <!-- Sidebar --> <aside class="blog-sidebar" data-astro-cid-ijnerlr2> <!-- Top contributors --> <div class="sidebar-card" data-astro-cid-ijnerlr2> <div class="sidebar-title" data-astro-cid-ijnerlr2>', '</div> <div id="top-contributors" data-astro-cid-ijnerlr2></div> </div> <!-- CTA --> <div class="sidebar-cta" data-astro-cid-ijnerlr2> <div class="sidebar-cta-title" data-astro-cid-ijnerlr2>', '</div> <div class="sidebar-cta-sub" data-astro-cid-ijnerlr2>', '</div> <a href="/find" class="sidebar-cta-btn" data-astro-cid-ijnerlr2>', '</a> </div> </aside> </div>  <footer class="blog-footer" data-astro-cid-ijnerlr2> <p data-astro-cid-ijnerlr2>© ', " ", ' · <a href="/" data-astro-cid-ijnerlr2>', '</a> · <a href="/find" data-astro-cid-ijnerlr2>', '</a> · <a href="/blog" data-astro-cid-ijnerlr2>', `</a></p> </footer> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
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
    container.innerHTML = '<div style="font-size:12px;color:var(--text-faint);">No contributors yet  -  be the first to publish.</div>';
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
  document.getElementById('trainer-count').textContent = uniqueTrainers || ' - ';
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

// Sample articles for when DB is empty  -  locale-aware
const LOCALE_SAMPLES = {localeSamplesJson};
function renderSampleArticles() {
  const samples = LOCALE_SAMPLES;
  allArticles = samples;
  renderArticles(samples);
  loadTopContributors(samples);
  document.getElementById('article-count').textContent = samples.length + '+';
  document.getElementById('trainer-count').textContent = samples.length;
}

// Init
loadBlog();
<\/script> `])), maybeRenderHead(), brandName, blogStrings.nav_find, blogStrings.nav_blog, blogStrings.nav_join_cta, blogStrings.eyebrow, blogStrings.title, blogStrings.sub, blogStrings.articles_stat, blogStrings.trainers_stat, blogStrings.evidence, blogStrings.filter_all, blogStrings.filter_nutrition, blogStrings.filter_training, blogStrings.filter_fatloss, blogStrings.filter_muscle, blogStrings.filter_recovery, blogStrings.filter_mindset, blogStrings.filter_local, blogStrings.write_title, blogStrings.write_sub, blogStrings.write_cta, blogStrings.empty_title, blogStrings.empty_sub, blogStrings.sidebar_contributors, blogStrings.sidebar_cta_title, blogStrings.sidebar_cta_sub, blogStrings.sidebar_cta_btn, (/* @__PURE__ */ new Date()).getFullYear(), brandName, blogStrings.footer_for_trainers, blogStrings.footer_find, blogStrings.nav_blog) })}`;
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
