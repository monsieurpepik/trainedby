import { g as getMarket, $ as $$Base } from './Base_CMDzg9CE.mjs';
import { c as createComponent } from './astro-component_BvaTlKiI.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_Dvw9vuPO.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Find = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Find;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Find a Verified Trainer | ${brandName}`, "description": `Browse verified personal trainers on ${brandName}. Filter by speciality, location and training mode.`, "data-astro-cid-tmsqtauh": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", `<nav data-astro-cid-tmsqtauh> <a href="/landing.html" class="nav-logo" data-astro-cid-tmsqtauh>Trained<span data-astro-cid-tmsqtauh>By</span>.</a> <a href="/join.html" class="nav-cta" data-astro-cid-tmsqtauh>Get Your Page →</a> </nav> <div class="hero" data-astro-cid-tmsqtauh> <div class="hero-eyebrow" data-astro-cid-tmsqtauh> <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" data-astro-cid-tmsqtauh><circle cx="4" cy="4" r="4" data-astro-cid-tmsqtauh></circle></svg>
REPs UAE Verified Trainers
</div> <h1 data-i18n="find.title" data-astro-cid-tmsqtauh>Find Your Perfect<br data-astro-cid-tmsqtauh>Personal Trainer</h1> <p data-i18n="find.sub" data-astro-cid-tmsqtauh>Browse verified trainers across Dubai and the UAE. Filter by specialty, location, price and training style.</p> </div> <div class="search-wrap" data-astro-cid-tmsqtauh> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-tmsqtauh><circle cx="11" cy="11" r="8" data-astro-cid-tmsqtauh></circle><line x1="21" y1="21" x2="16.65" y2="16.65" data-astro-cid-tmsqtauh></line></svg> <input type="text" id="searchInput" placeholder="Search by name, specialty or gym…" data-i18n-placeholder="find.search_placeholder" oninput="filterTrainers()" data-astro-cid-tmsqtauh> </div> <div class="filters" id="filters" data-astro-cid-tmsqtauh> <button class="filter-btn active" data-filter="all" onclick="setFilter('all',this)" data-i18n="find.filter_all" data-astro-cid-tmsqtauh>All Trainers</button> <button class="filter-btn" data-filter="in-person" onclick="setFilter('in-person',this)" data-astro-cid-tmsqtauh>In-Person</button> <button class="filter-btn" data-filter="online" onclick="setFilter('online',this)" data-i18n="find.filter_online" data-astro-cid-tmsqtauh>Online</button> <button class="filter-btn" data-filter="hybrid" onclick="setFilter('hybrid',this)" data-astro-cid-tmsqtauh>Hybrid</button> <button class="filter-btn" data-filter="strength" onclick="setFilter('strength',this)" data-astro-cid-tmsqtauh>Strength</button> <button class="filter-btn" data-filter="fat-loss" onclick="setFilter('fat-loss',this)" data-astro-cid-tmsqtauh>Fat Loss</button> <button class="filter-btn" data-filter="hiit" onclick="setFilter('hiit',this)" data-astro-cid-tmsqtauh>HIIT</button> <button class="filter-btn" data-filter="pilates" onclick="setFilter('pilates',this)" data-astro-cid-tmsqtauh>Pilates</button> <button class="filter-btn" data-filter="boxing" onclick="setFilter('boxing',this)" data-astro-cid-tmsqtauh>Boxing</button> <button class="filter-btn" data-filter="yoga" onclick="setFilter('yoga',this)" data-astro-cid-tmsqtauh>Yoga</button> <button class="filter-btn" data-filter="nutrition" onclick="setFilter('nutrition',this)" data-astro-cid-tmsqtauh>Nutrition</button> <button class="filter-btn" data-filter="female-only" onclick="setFilter('female-only',this)" data-astro-cid-tmsqtauh>Female Trainers</button> </div> <div class="main" data-astro-cid-tmsqtauh> <div class="results-header" data-astro-cid-tmsqtauh> <div class="results-count" id="resultsCount" data-astro-cid-tmsqtauh>Loading trainers…</div> <select class="sort-select" id="sortSelect" onchange="sortTrainers()" data-astro-cid-tmsqtauh> <option value="featured" data-astro-cid-tmsqtauh>Featured</option> <option value="rating" data-astro-cid-tmsqtauh>Top Rated</option> <option value="experience" data-astro-cid-tmsqtauh>Most Experienced</option> <option value="price_low" data-astro-cid-tmsqtauh>Price: Low to High</option> <option value="price_high" data-astro-cid-tmsqtauh>Price: High to Low</option> </select> </div> <div id="trainerGrid" data-astro-cid-tmsqtauh> <!-- Skeletons while loading -->
$`, ` </div> <div class="load-more-wrap" id="loadMoreWrap" style="display:none" data-astro-cid-tmsqtauh> <button class="btn-load-more" onclick="loadMore()" data-astro-cid-tmsqtauh>Load More Trainers</button> </div> </div> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

let allTrainers = [];
let filtered = [];
let activeFilter = 'all';
let page = 0;
const PAGE_SIZE = 12;

async function loadTrainers() {
  try {
    const r = await fetch(
      \`\${SUPABASE_URL}/rest/v1/trainers?verification_status=eq.verified&order=created_at.desc&limit=200\`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` } }
    );
    const trainers = await r.json();

    // Also fetch packages for pricing
    const ids = trainers.map(t => t.id);
    let packages = [];
    if (ids.length) {
      const pr = await fetch(
        \`\${SUPABASE_URL}/rest/v1/session_packages?trainer_id=in.(\${ids.join(',')})&order=price.asc\`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` } }
      );
      packages = await pr.json();
    }

    // Attach min price to each trainer
    allTrainers = trainers.map(t => {
      const tPkgs = packages.filter(p => p.trainer_id === t.id);
      const minPrice = tPkgs.length ? Math.min(...tPkgs.map(p => p.price || 0)) : null;
      return { ...t, min_price: minPrice, packages: tPkgs };
    });

    // If no verified trainers, show demo data
    if (!allTrainers.length) {
      allTrainers = getDemoTrainers();
    }

    filtered = [...allTrainers];
    renderGrid();
  } catch(e) {
    allTrainers = getDemoTrainers();
    filtered = [...allTrainers];
    renderGrid();
  }
}

function getDemoTrainers() {
  return [
    { id:'demo1', full_name:'Sarah Al Mansoori', slug:'sarah', title:'Strength & Conditioning Coach', city:'Dubai', specialties:['Strength','Fat Loss','HIIT'], certifications:['REPs Level 3','NASM CPT'], years_experience:8, clients_trained:240, avg_rating:4.9, review_count:34, reps_verified:true, accepting_clients:true, training_modes:['in-person','online'], min_price:150, whatsapp:'+971501234567' },
    { id:'demo2', full_name:'Ahmed Hassan', slug:'ahmed', title:'Functional Fitness & Boxing Coach', city:'Dubai', specialties:['Boxing','Functional','HIIT'], certifications:['REPs Level 3','Boxing Coach'], years_experience:6, clients_trained:180, avg_rating:4.8, review_count:22, reps_verified:true, accepting_clients:true, training_modes:['in-person'], min_price:200, whatsapp:'+971502345678' },
    { id:'demo3', full_name:'Layla Rashidi', slug:'layla', title:'Pilates & Yoga Specialist', city:'Abu Dhabi', specialties:['Pilates','Yoga','Flexibility'], certifications:['STOTT Pilates','RYT 200'], years_experience:5, clients_trained:120, avg_rating:5.0, review_count:18, reps_verified:true, accepting_clients:true, training_modes:['in-person','online'], min_price:180, whatsapp:'+971503456789' },
    { id:'demo4', full_name:'Marcus Williams', slug:'marcus', title:'Bodybuilding & Nutrition Coach', city:'Dubai', specialties:['Muscle Gain','Nutrition','Bodybuilding'], certifications:['NASM CPT','Precision Nutrition'], years_experience:10, clients_trained:320, avg_rating:4.7, review_count:45, reps_verified:true, accepting_clients:false, training_modes:['in-person','online'], min_price:250, whatsapp:'+971504567890' },
    { id:'demo5', full_name:'Fatima Al Zaabi', slug:'fatima', title:'Women\\'s Fitness Specialist', city:'Dubai', specialties:['Fat Loss','Toning','Pre/Postnatal'], certifications:['REPs Level 3','Pre/Postnatal'], years_experience:4, clients_trained:95, avg_rating:4.9, review_count:28, reps_verified:true, accepting_clients:true, training_modes:['in-person'], min_price:150, whatsapp:'+971505678901', gender:'female' },
    { id:'demo6', full_name:'Ryan O\\'Brien', slug:'ryan', title:'Running & Endurance Coach', city:'Dubai', specialties:['Running','Endurance','Triathlon'], certifications:['UESCA Running Coach','REPs Level 3'], years_experience:7, clients_trained:200, avg_rating:4.8, review_count:31, reps_verified:true, accepting_clients:true, training_modes:['in-person','online'], min_price:120, whatsapp:'+971506789012' },
  ];
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterTrainers();
}

function filterTrainers() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();

  filtered = allTrainers.filter(t => {
    // Text search
    if (q) {
      const searchable = [
        t.full_name || t.name, t.title, t.city,
        ...(t.specialties || []), ...(t.certifications || []), t.gym_name
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in-person') return (t.training_modes || []).includes('in-person');
    if (activeFilter === 'online') return (t.training_modes || []).includes('online');
    if (activeFilter === 'hybrid') return (t.training_modes || []).includes('hybrid') || ((t.training_modes||[]).includes('in-person') && (t.training_modes||[]).includes('online'));
    if (activeFilter === 'female-only') return t.gender === 'female';
    // Specialty filters
    const specs = (t.specialties || []).map(s => s.toLowerCase());
    return specs.some(s => s.includes(activeFilter));
  });

  page = 0;
  renderGrid();
}

function sortTrainers() {
  const sort = document.getElementById('sortSelect').value;
  filtered.sort((a, b) => {
    if (sort === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sort === 'experience') return (b.years_experience || 0) - (a.years_experience || 0);
    if (sort === 'price_low') return (a.min_price || 9999) - (b.min_price || 9999);
    if (sort === 'price_high') return (b.min_price || 0) - (a.min_price || 0);
    return 0;
  });
  page = 0;
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('trainerGrid');
  const start = 0;
  const end = (page + 1) * PAGE_SIZE;
  const toShow = filtered.slice(start, end);

  document.getElementById('resultsCount').textContent =
    filtered.length === 0 ? 'No trainers found' :
    \`\${filtered.length} verified trainer\${filtered.length !== 1 ? 's' : ''}\`;

  if (!filtered.length) {
    grid.innerHTML = \`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No trainers found</div><div class="empty-sub">Try adjusting your search or filters</div></div>\`;
    document.getElementById('loadMoreWrap').style.display = 'none';
    return;
  }

  grid.innerHTML = toShow.map(t => trainerCardHTML(t)).join('');
  document.getElementById('loadMoreWrap').style.display = filtered.length > end ? 'block' : 'none';
}

function loadMore() {
  page++;
  renderGrid();
}

function trainerCardHTML(t) {
  const name = t.full_name || t.name || 'Trainer';
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  const slug = t.slug || t.id;
  const modes = t.training_modes || ['in-person'];
  const specs = (t.specialties || []).slice(0,3);
  const rating = t.avg_rating ? parseFloat(t.avg_rating) : null;
  const wa = t.whatsapp ? t.whatsapp.replace(/\\D/g,'') : null;

  const modeTagsHtml = modes.slice(0,2).map(m => {
    const labels = {'in-person':'In-Person','online':'Online','hybrid':'Hybrid'};
    return \`<span class="card-mode \${m}">\${labels[m]||m}</span>\`;
  }).join('');

  const starsHtml = rating ? (() => {
    let s = '';
    for (let i=1;i<=5;i++) s += \`<span class="cs \${i<=Math.round(rating)?'f':'e'}">★</span>\`;
    return \`<div class="card-rating"><div class="card-stars">\${s}</div><span class="card-rating-score">\${rating.toFixed(1)}</span><span class="card-rating-count">(\${t.review_count||0})</span></div>\`;
  })() : '';

  const statsHtml = [
    t.years_experience ? \`<div class="card-stat"><div class="cs-val">\${t.years_experience}</div><div class="cs-lbl">Yrs</div></div>\` : '',
    t.clients_trained ? \`<div class="card-stat"><div class="cs-val">\${t.clients_trained}+</div><div class="cs-lbl">Clients</div></div>\` : '',
    \`<div class="card-stat"><div class="cs-val" style="color:\${t.accepting_clients!==false?'var(--green)':'var(--white-30)'}">\${t.accepting_clients!==false?'✓':'✗'}</div><div class="cs-lbl">Open</div></div>\`
  ].filter(Boolean).join('');

  return \`
  <a href="/\${slug}" class="trainer-card">
    <div class="card-cover" style="\${t.cover_url?\`background-image:url('\${t.cover_url}')\`:''}">
      <div class="card-cover-overlay"></div>
      <div class="card-mode-tags">\${modeTagsHtml}</div>
    </div>
    <div class="card-body">
      <div class="card-top">
        <div class="card-avatar">
          \${t.avatar_url ? \`<img src="\${t.avatar_url}" alt="\${name}">\` : initials}
        </div>
        <div class="card-info">
          <div class="card-name">
            \${name}
            \${t.reps_verified ? \`<span class="card-verified"><svg viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span>\` : ''}
          </div>
          <div class="card-title">\${t.title || 'Personal Trainer'} · \${t.city || 'UAE'}</div>
        </div>
      </div>
      \${starsHtml}
      <div class="card-tags">\${specs.map(s => \`<span class="card-tag">\${s}</span>\`).join('')}</div>
      <div class="card-stats">\${statsHtml}</div>
    </div>
    <div class="card-footer">
      <div class="card-price">\${t.min_price ? \`AED \${t.min_price.toLocaleString()} <span>/ session</span>\` : '<span>Contact for price</span>'}</div>
      \${wa ? \`<a href="https://wa.me/\${wa}" class="card-wa" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp</a>\` : ''}
    </div>
  </a>\`;
}

loadTrainers();
<\/script> `], ["  ", `<nav data-astro-cid-tmsqtauh> <a href="/landing.html" class="nav-logo" data-astro-cid-tmsqtauh>Trained<span data-astro-cid-tmsqtauh>By</span>.</a> <a href="/join.html" class="nav-cta" data-astro-cid-tmsqtauh>Get Your Page →</a> </nav> <div class="hero" data-astro-cid-tmsqtauh> <div class="hero-eyebrow" data-astro-cid-tmsqtauh> <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" data-astro-cid-tmsqtauh><circle cx="4" cy="4" r="4" data-astro-cid-tmsqtauh></circle></svg>
REPs UAE Verified Trainers
</div> <h1 data-i18n="find.title" data-astro-cid-tmsqtauh>Find Your Perfect<br data-astro-cid-tmsqtauh>Personal Trainer</h1> <p data-i18n="find.sub" data-astro-cid-tmsqtauh>Browse verified trainers across Dubai and the UAE. Filter by specialty, location, price and training style.</p> </div> <div class="search-wrap" data-astro-cid-tmsqtauh> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-tmsqtauh><circle cx="11" cy="11" r="8" data-astro-cid-tmsqtauh></circle><line x1="21" y1="21" x2="16.65" y2="16.65" data-astro-cid-tmsqtauh></line></svg> <input type="text" id="searchInput" placeholder="Search by name, specialty or gym…" data-i18n-placeholder="find.search_placeholder" oninput="filterTrainers()" data-astro-cid-tmsqtauh> </div> <div class="filters" id="filters" data-astro-cid-tmsqtauh> <button class="filter-btn active" data-filter="all" onclick="setFilter('all',this)" data-i18n="find.filter_all" data-astro-cid-tmsqtauh>All Trainers</button> <button class="filter-btn" data-filter="in-person" onclick="setFilter('in-person',this)" data-astro-cid-tmsqtauh>In-Person</button> <button class="filter-btn" data-filter="online" onclick="setFilter('online',this)" data-i18n="find.filter_online" data-astro-cid-tmsqtauh>Online</button> <button class="filter-btn" data-filter="hybrid" onclick="setFilter('hybrid',this)" data-astro-cid-tmsqtauh>Hybrid</button> <button class="filter-btn" data-filter="strength" onclick="setFilter('strength',this)" data-astro-cid-tmsqtauh>Strength</button> <button class="filter-btn" data-filter="fat-loss" onclick="setFilter('fat-loss',this)" data-astro-cid-tmsqtauh>Fat Loss</button> <button class="filter-btn" data-filter="hiit" onclick="setFilter('hiit',this)" data-astro-cid-tmsqtauh>HIIT</button> <button class="filter-btn" data-filter="pilates" onclick="setFilter('pilates',this)" data-astro-cid-tmsqtauh>Pilates</button> <button class="filter-btn" data-filter="boxing" onclick="setFilter('boxing',this)" data-astro-cid-tmsqtauh>Boxing</button> <button class="filter-btn" data-filter="yoga" onclick="setFilter('yoga',this)" data-astro-cid-tmsqtauh>Yoga</button> <button class="filter-btn" data-filter="nutrition" onclick="setFilter('nutrition',this)" data-astro-cid-tmsqtauh>Nutrition</button> <button class="filter-btn" data-filter="female-only" onclick="setFilter('female-only',this)" data-astro-cid-tmsqtauh>Female Trainers</button> </div> <div class="main" data-astro-cid-tmsqtauh> <div class="results-header" data-astro-cid-tmsqtauh> <div class="results-count" id="resultsCount" data-astro-cid-tmsqtauh>Loading trainers…</div> <select class="sort-select" id="sortSelect" onchange="sortTrainers()" data-astro-cid-tmsqtauh> <option value="featured" data-astro-cid-tmsqtauh>Featured</option> <option value="rating" data-astro-cid-tmsqtauh>Top Rated</option> <option value="experience" data-astro-cid-tmsqtauh>Most Experienced</option> <option value="price_low" data-astro-cid-tmsqtauh>Price: Low to High</option> <option value="price_high" data-astro-cid-tmsqtauh>Price: High to Low</option> </select> </div> <div id="trainerGrid" data-astro-cid-tmsqtauh> <!-- Skeletons while loading -->
$`, ` </div> <div class="load-more-wrap" id="loadMoreWrap" style="display:none" data-astro-cid-tmsqtauh> <button class="btn-load-more" onclick="loadMore()" data-astro-cid-tmsqtauh>Load More Trainers</button> </div> </div> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

let allTrainers = [];
let filtered = [];
let activeFilter = 'all';
let page = 0;
const PAGE_SIZE = 12;

async function loadTrainers() {
  try {
    const r = await fetch(
      \\\`\\\${SUPABASE_URL}/rest/v1/trainers?verification_status=eq.verified&order=created_at.desc&limit=200\\\`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\` } }
    );
    const trainers = await r.json();

    // Also fetch packages for pricing
    const ids = trainers.map(t => t.id);
    let packages = [];
    if (ids.length) {
      const pr = await fetch(
        \\\`\\\${SUPABASE_URL}/rest/v1/session_packages?trainer_id=in.(\\\${ids.join(',')})&order=price.asc\\\`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\` } }
      );
      packages = await pr.json();
    }

    // Attach min price to each trainer
    allTrainers = trainers.map(t => {
      const tPkgs = packages.filter(p => p.trainer_id === t.id);
      const minPrice = tPkgs.length ? Math.min(...tPkgs.map(p => p.price || 0)) : null;
      return { ...t, min_price: minPrice, packages: tPkgs };
    });

    // If no verified trainers, show demo data
    if (!allTrainers.length) {
      allTrainers = getDemoTrainers();
    }

    filtered = [...allTrainers];
    renderGrid();
  } catch(e) {
    allTrainers = getDemoTrainers();
    filtered = [...allTrainers];
    renderGrid();
  }
}

function getDemoTrainers() {
  return [
    { id:'demo1', full_name:'Sarah Al Mansoori', slug:'sarah', title:'Strength & Conditioning Coach', city:'Dubai', specialties:['Strength','Fat Loss','HIIT'], certifications:['REPs Level 3','NASM CPT'], years_experience:8, clients_trained:240, avg_rating:4.9, review_count:34, reps_verified:true, accepting_clients:true, training_modes:['in-person','online'], min_price:150, whatsapp:'+971501234567' },
    { id:'demo2', full_name:'Ahmed Hassan', slug:'ahmed', title:'Functional Fitness & Boxing Coach', city:'Dubai', specialties:['Boxing','Functional','HIIT'], certifications:['REPs Level 3','Boxing Coach'], years_experience:6, clients_trained:180, avg_rating:4.8, review_count:22, reps_verified:true, accepting_clients:true, training_modes:['in-person'], min_price:200, whatsapp:'+971502345678' },
    { id:'demo3', full_name:'Layla Rashidi', slug:'layla', title:'Pilates & Yoga Specialist', city:'Abu Dhabi', specialties:['Pilates','Yoga','Flexibility'], certifications:['STOTT Pilates','RYT 200'], years_experience:5, clients_trained:120, avg_rating:5.0, review_count:18, reps_verified:true, accepting_clients:true, training_modes:['in-person','online'], min_price:180, whatsapp:'+971503456789' },
    { id:'demo4', full_name:'Marcus Williams', slug:'marcus', title:'Bodybuilding & Nutrition Coach', city:'Dubai', specialties:['Muscle Gain','Nutrition','Bodybuilding'], certifications:['NASM CPT','Precision Nutrition'], years_experience:10, clients_trained:320, avg_rating:4.7, review_count:45, reps_verified:true, accepting_clients:false, training_modes:['in-person','online'], min_price:250, whatsapp:'+971504567890' },
    { id:'demo5', full_name:'Fatima Al Zaabi', slug:'fatima', title:'Women\\\\'s Fitness Specialist', city:'Dubai', specialties:['Fat Loss','Toning','Pre/Postnatal'], certifications:['REPs Level 3','Pre/Postnatal'], years_experience:4, clients_trained:95, avg_rating:4.9, review_count:28, reps_verified:true, accepting_clients:true, training_modes:['in-person'], min_price:150, whatsapp:'+971505678901', gender:'female' },
    { id:'demo6', full_name:'Ryan O\\\\'Brien', slug:'ryan', title:'Running & Endurance Coach', city:'Dubai', specialties:['Running','Endurance','Triathlon'], certifications:['UESCA Running Coach','REPs Level 3'], years_experience:7, clients_trained:200, avg_rating:4.8, review_count:31, reps_verified:true, accepting_clients:true, training_modes:['in-person','online'], min_price:120, whatsapp:'+971506789012' },
  ];
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterTrainers();
}

function filterTrainers() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();

  filtered = allTrainers.filter(t => {
    // Text search
    if (q) {
      const searchable = [
        t.full_name || t.name, t.title, t.city,
        ...(t.specialties || []), ...(t.certifications || []), t.gym_name
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in-person') return (t.training_modes || []).includes('in-person');
    if (activeFilter === 'online') return (t.training_modes || []).includes('online');
    if (activeFilter === 'hybrid') return (t.training_modes || []).includes('hybrid') || ((t.training_modes||[]).includes('in-person') && (t.training_modes||[]).includes('online'));
    if (activeFilter === 'female-only') return t.gender === 'female';
    // Specialty filters
    const specs = (t.specialties || []).map(s => s.toLowerCase());
    return specs.some(s => s.includes(activeFilter));
  });

  page = 0;
  renderGrid();
}

function sortTrainers() {
  const sort = document.getElementById('sortSelect').value;
  filtered.sort((a, b) => {
    if (sort === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sort === 'experience') return (b.years_experience || 0) - (a.years_experience || 0);
    if (sort === 'price_low') return (a.min_price || 9999) - (b.min_price || 9999);
    if (sort === 'price_high') return (b.min_price || 0) - (a.min_price || 0);
    return 0;
  });
  page = 0;
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('trainerGrid');
  const start = 0;
  const end = (page + 1) * PAGE_SIZE;
  const toShow = filtered.slice(start, end);

  document.getElementById('resultsCount').textContent =
    filtered.length === 0 ? 'No trainers found' :
    \\\`\\\${filtered.length} verified trainer\\\${filtered.length !== 1 ? 's' : ''}\\\`;

  if (!filtered.length) {
    grid.innerHTML = \\\`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No trainers found</div><div class="empty-sub">Try adjusting your search or filters</div></div>\\\`;
    document.getElementById('loadMoreWrap').style.display = 'none';
    return;
  }

  grid.innerHTML = toShow.map(t => trainerCardHTML(t)).join('');
  document.getElementById('loadMoreWrap').style.display = filtered.length > end ? 'block' : 'none';
}

function loadMore() {
  page++;
  renderGrid();
}

function trainerCardHTML(t) {
  const name = t.full_name || t.name || 'Trainer';
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  const slug = t.slug || t.id;
  const modes = t.training_modes || ['in-person'];
  const specs = (t.specialties || []).slice(0,3);
  const rating = t.avg_rating ? parseFloat(t.avg_rating) : null;
  const wa = t.whatsapp ? t.whatsapp.replace(/\\\\D/g,'') : null;

  const modeTagsHtml = modes.slice(0,2).map(m => {
    const labels = {'in-person':'In-Person','online':'Online','hybrid':'Hybrid'};
    return \\\`<span class="card-mode \\\${m}">\\\${labels[m]||m}</span>\\\`;
  }).join('');

  const starsHtml = rating ? (() => {
    let s = '';
    for (let i=1;i<=5;i++) s += \\\`<span class="cs \\\${i<=Math.round(rating)?'f':'e'}">★</span>\\\`;
    return \\\`<div class="card-rating"><div class="card-stars">\\\${s}</div><span class="card-rating-score">\\\${rating.toFixed(1)}</span><span class="card-rating-count">(\\\${t.review_count||0})</span></div>\\\`;
  })() : '';

  const statsHtml = [
    t.years_experience ? \\\`<div class="card-stat"><div class="cs-val">\\\${t.years_experience}</div><div class="cs-lbl">Yrs</div></div>\\\` : '',
    t.clients_trained ? \\\`<div class="card-stat"><div class="cs-val">\\\${t.clients_trained}+</div><div class="cs-lbl">Clients</div></div>\\\` : '',
    \\\`<div class="card-stat"><div class="cs-val" style="color:\\\${t.accepting_clients!==false?'var(--green)':'var(--white-30)'}">\\\${t.accepting_clients!==false?'✓':'✗'}</div><div class="cs-lbl">Open</div></div>\\\`
  ].filter(Boolean).join('');

  return \\\`
  <a href="/\\\${slug}" class="trainer-card">
    <div class="card-cover" style="\\\${t.cover_url?\\\`background-image:url('\\\${t.cover_url}')\\\`:''}">
      <div class="card-cover-overlay"></div>
      <div class="card-mode-tags">\\\${modeTagsHtml}</div>
    </div>
    <div class="card-body">
      <div class="card-top">
        <div class="card-avatar">
          \\\${t.avatar_url ? \\\`<img src="\\\${t.avatar_url}" alt="\\\${name}">\\\` : initials}
        </div>
        <div class="card-info">
          <div class="card-name">
            \\\${name}
            \\\${t.reps_verified ? \\\`<span class="card-verified"><svg viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span>\\\` : ''}
          </div>
          <div class="card-title">\\\${t.title || 'Personal Trainer'} · \\\${t.city || 'UAE'}</div>
        </div>
      </div>
      \\\${starsHtml}
      <div class="card-tags">\\\${specs.map(s => \\\`<span class="card-tag">\\\${s}</span>\\\`).join('')}</div>
      <div class="card-stats">\\\${statsHtml}</div>
    </div>
    <div class="card-footer">
      <div class="card-price">\\\${t.min_price ? \\\`AED \\\${t.min_price.toLocaleString()} <span>/ session</span>\\\` : '<span>Contact for price</span>'}</div>
      \\\${wa ? \\\`<a href="https://wa.me/\\\${wa}" class="card-wa" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp</a>\\\` : ''}
    </div>
  </a>\\\`;
}

loadTrainers();
<\/script> `])), maybeRenderHead(), Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skel skel-cover"></div>
      <div class="skel-body">
        <div class="skel skel-line w80"></div>
        <div class="skel skel-line w60"></div>
        <div class="skel skel-line w40" style="margin-top:12px"></div>
      </div>
    </div>`).join("")) })}`;
}, "/home/ubuntu/trainedby2/src/pages/find.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/find.astro";
const $$url = "/find";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Find,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
