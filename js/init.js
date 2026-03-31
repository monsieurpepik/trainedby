// TrainedBy.ae — Main Init Bundle
// Handles trainer profile page logic

const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const SITE_URL = 'https://trainedby.ae';

// ── State ──────────────────────────────────────────────────────
let currentTrainer = null;
let currentPackages = [];
let assessData = {};
let assessStep = 1;

// ── Helpers ───────────────────────────────────────────────────
function getSlug() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const reserved = ['edit','dashboard','join','pricing','privacy','terms','landing'];
  return parts[0] && !reserved.includes(parts[0]) ? parts[0] : null;
}

function show(id) { const el = document.getElementById(id); if (el) { el.classList.remove('hidden'); el.style.display = ''; } }
function hide(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val ?? ''; }
function setAttr(id, attr, val) { const el = document.getElementById(id); if (el) el[attr] = val; }

function showToast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:max(24px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%) translateY(80px);background:#1c1c1c;border:1px solid rgba(255,255,255,0.08);color:#fff;padding:12px 20px;border-radius:24px;font-size:13px;font-weight:600;z-index:9999;transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.5);';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  if (type === 'success') t.style.background = 'rgba(0,200,83,0.15)';
  else if (type === 'error') t.style.background = 'rgba(255,85,85,0.15)';
  else t.style.background = '#1c1c1c';
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(80px)'; }, 3000);
}

function formatAED(n) { return 'AED ' + Number(n).toLocaleString('en-AE'); }

// ── Fitness calculations ───────────────────────────────────────
function calcBMI(w, h) { const hm = h / 100; return +(w / (hm * hm)).toFixed(1); }
function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#4fc3f7' };
  if (bmi < 25)   return { label: 'Healthy', color: '#00C853' };
  if (bmi < 30)   return { label: 'Overweight', color: '#FF5C00' };
  return { label: 'Obese', color: '#ff5555' };
}
function calcTDEE(w, h, age, gender, activity) {
  const bmr = gender === 'female'
    ? (10 * w) + (6.25 * h) - (5 * age) - 161
    : (10 * w) + (6.25 * h) - (5 * age) + 5;
  const m = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(bmr * (m[activity] || 1.55));
}

// ── Fetch trainer ──────────────────────────────────────────────
async function loadTrainer() {
  const slug = getSlug();

  // No slug — show landing redirect
  if (!slug) {
    window.location.href = '/landing.html';
    return;
  }

  show('loading');
  hide('error'); hide('pending'); hide('trainer-page'); hide('skeleton');

  try {
    const res = await fetch(`${EDGE_BASE}/get-trainer?slug=${encodeURIComponent(slug)}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY }
    });

    if (!res.ok) throw new Error('not_found');
    const data = await res.json();
    const trainer = data.trainer;
    const packages = data.packages || [];

    if (!trainer) throw new Error('not_found');

    // Track profile view (fire & forget)
    fetch(`${EDGE_BASE}/track-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ trainer_id: trainer.id, event_type: 'profile_view' }),
    }).catch(() => {});

    if (trainer.verification_status === 'pending') {
      hide('loading');
      setText('pending-trainer-name', trainer.name);
      const token = localStorage.getItem('tb_edit_token');
      if (token) {
        const editLink = document.getElementById('pending-edit-link');
        if (editLink) editLink.style.display = 'flex';
      }
      show('pending');
      return;
    }

    currentTrainer = trainer;
    currentPackages = packages;
    renderTrainer(trainer, packages);

  } catch (e) {
    hide('loading');
    show('error');
  }
}

function renderTrainer(t, packages) {
  hide('loading'); hide('skeleton');

  // Background
  const bg = document.getElementById('bg');
  if (bg && t.cover_url) {
    bg.style.backgroundImage = `url(${t.cover_url})`;
    bg.classList.remove('bg-fallback');
  }

  // Avatar
  const avatar = document.getElementById('trainer-avatar');
  if (avatar) {
    if (t.avatar_url) {
      avatar.src = t.avatar_url;
      avatar.onerror = () => { avatar.style.display = 'none'; showInitials(t.name); };
    } else {
      avatar.style.display = 'none';
      showInitials(t.name);
    }
  }

  // REPs badge
  if (t.verification_status === 'verified') {
    const badge = document.getElementById('reps-badge');
    if (badge) badge.style.display = 'flex';
  }

  // Name, title, bio
  setText('trainer-name', t.name);
  setText('trainer-title', [t.title, t.city].filter(Boolean).join(' · '));
  setText('trainer-bio', t.bio);

  // Stats
  setText('stat-exp', t.years_experience ? `${t.years_experience}` : '—');
  setText('stat-clients', t.clients_trained ? `${t.clients_trained}+` : '—');
  setText('stat-sessions', t.sessions_delivered ? `${t.sessions_delivered}+` : '—');
  setText('stat-accepting', t.accepting_clients ? 'Yes ✓' : 'Waitlist');

  // Specialties
  const tagsEl = document.getElementById('specialty-tags');
  const specs = t.specialties || [];
  if (tagsEl && specs.length) {
    tagsEl.innerHTML = specs.map(s =>
      `<span class="tag">${s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>`
    ).join('');
  }
  // Certifications
  const certEl = document.getElementById('certifications-list');
  if (certEl && t.certifications?.length) {
    certEl.innerHTML = t.certifications.map(c => `<span class="cert-tag">${c}</span>`).join('');
    show('certifications-section');
  }

  // WhatsApp button
  const waBtn = document.getElementById('wa-btn');
  if (waBtn && t.whatsapp) {
    const msg = encodeURIComponent(`Hi ${t.name}, I found your profile on TrainedBy.ae and I'm interested in training with you.`);
    waBtn.href = `https://wa.me/${t.whatsapp.replace(/\D/g,'')}?text=${msg}`;
  }

  // Packages
  renderPackages(packages);

  // Gallery
  if (t.gallery_urls?.length) {
    const galleryEl = document.getElementById('gallery-grid');
    if (galleryEl) {
      galleryEl.innerHTML = t.gallery_urls.map((url, i) =>
        `<div class="gallery-item" onclick="openLightbox('${url}')"><img src="${url}" alt="Transformation ${i+1}" loading="lazy"></div>`
      ).join('');
      show('gallery-section');
    }
  }

  // Nav
  const navLogo = document.getElementById('nav-logo');
  if (navLogo) navLogo.textContent = t.name?.split(' ')[0] || 'TB';

  const editBtn = document.getElementById('nav-edit-btn');
  const token = localStorage.getItem('tb_edit_token');
  if (editBtn && token) {
    editBtn.style.display = 'flex';
    editBtn.href = '/edit';
  }

  const claimBtn = document.getElementById('nav-claim-btn');
  if (claimBtn && !token) claimBtn.style.display = 'flex';

  // Update page title + OG
  document.title = `${t.name} — ${t.title || 'Personal Trainer'} | TrainedBy`;
  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.content = `${t.name} — ${t.title || 'Personal Trainer'} in ${t.city || 'UAE'}`;

  // Social links
  renderSocials(t);

  show('trainer-page');
}

function showInitials(name) {
  const initEl = document.getElementById('trainer-initials');
  if (initEl && name) {
    const parts = name.trim().split(' ');
    initEl.textContent = parts.length >= 2
      ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
      : name[0].toUpperCase();
    initEl.style.display = 'flex';
  }
}

function renderPackages(packages) {
  const container = document.getElementById('packages-list');
  if (!container) return;
  if (!packages.length) { hide('packages-section'); return; }

  container.innerHTML = packages.map(p => `
    <div class="package-card${p.is_featured ? ' featured' : ''}" onclick="openLeadModal('${p.name}')">
      ${p.is_featured ? '<div class="package-badge">Most Popular</div>' : ''}
      <div class="package-header">
        <span class="package-name">${p.name}</span>
        <span class="package-price">${formatAED(p.price)}</span>
      </div>
      <div class="package-meta">
        ${p.sessions ? `<span>${p.sessions} sessions</span>` : ''}
        ${p.duration ? `<span>${p.duration}</span>` : ''}
        ${p.currency ? `<span>${p.currency}</span>` : ''}
      </div>
      ${p.description ? `<p class="package-desc">${p.description}</p>` : ''}
      <button class="package-cta">Book This Package →</button>
    </div>
  `).join('');
  show('packages-section');
}

function renderSocials(t) {
  const container = document.getElementById('social-links');
  if (!container) return;
  const links = [];
  if (t.instagram) links.push(`<a href="https://instagram.com/${t.instagram.replace('@','')}" target="_blank" rel="noopener" class="social-link"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>`);
  if (t.tiktok) links.push(`<a href="https://tiktok.com/@${t.tiktok.replace('@','')}" target="_blank" rel="noopener" class="social-link"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg></a>`);
  if (t.youtube) links.push(`<a href="${t.youtube}" target="_blank" rel="noopener" class="social-link"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>`);
  if (links.length) container.innerHTML = links.join('');
}

// ── Modals ─────────────────────────────────────────────────────
window.openLeadModal = function(packageName = '') {
  const modal = document.getElementById('lead-modal');
  if (modal) {
    modal.classList.add('open');
    const title = document.getElementById('lead-modal-title');
    if (title) title.textContent = packageName ? `Book: ${packageName}` : 'Book a Trial Session';
    modal.dataset.package = packageName;
  }
};

window.closeLeadModal = function() {
  const modal = document.getElementById('lead-modal');
  if (modal) modal.classList.remove('open');
};

window.openAssessModal = function() {
  const modal = document.getElementById('assess-modal');
  if (modal) {
    modal.classList.add('open');
    assessGoStep(1);
  }
};

window.closeAssessModal = function() {
  const modal = document.getElementById('assess-modal');
  if (modal) modal.classList.remove('open');
};

window.openLightbox = function(url) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) { img.src = url; lb.classList.add('open'); }
};

window.closeLightbox = function() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
};

// ── Assessment ─────────────────────────────────────────────────
window.setAssessField = function(btn, field, value) {
  assessData[field] = value;
  // Toggle active on siblings
  const parent = btn.parentElement;
  parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Live TDEE calc on step 2
  if (['goal','activity'].includes(field)) updateTDEE();
};

window.assessGoStep = function(step) {
  // Validate step 1
  if (step === 2) {
    const age = parseInt(document.getElementById('assess-age')?.value);
    const weight = parseFloat(document.getElementById('assess-weight')?.value);
    const height = parseFloat(document.getElementById('assess-height')?.value);
    if (!age || age < 10 || age > 100) { showToast('Please enter a valid age', 'error'); return; }
    if (!weight || weight < 30 || weight > 300) { showToast('Please enter a valid weight', 'error'); return; }
    if (!height || height < 100 || height > 250) { showToast('Please enter a valid height', 'error'); return; }
    assessData.age = age; assessData.weight = weight; assessData.height = height;
    if (!assessData.gender) assessData.gender = 'male';
    updateTDEE();
  }
  if (step === 3 && !assessData.goal) { showToast('Please select a goal', 'error'); return; }

  assessStep = step;
  [1,2,3].forEach(s => {
    const el = document.getElementById(`assess-step-${s}`);
    if (el) el.style.display = s === step ? 'block' : 'none';
  });
};

window.setGender = function(btn, gender) {
  assessData.gender = gender;
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateTDEE();
};

function updateTDEE() {
  const { weight, height, age, gender = 'male', activity = 'moderate', goal } = assessData;
  if (!weight || !height || !age) return;
  const bmi = calcBMI(weight, height);
  const cat = bmiCategory(bmi);
  const tdee = calcTDEE(weight, height, age, gender, activity);
  const goalOffset = { fat_loss: -500, muscle_gain: +300, endurance: +100, general_fitness: 0 };
  const target = tdee + (goalOffset[goal] || 0);
  setText('tdee-maintain', `${tdee} kcal`);
  const goalEl = document.getElementById('tdee-goal');
  if (goalEl) { goalEl.textContent = `${target} kcal`; goalEl.style.color = '#FF5C00'; }
  const bmiEl = document.getElementById('bmi-value');
  if (bmiEl) { bmiEl.textContent = bmi; bmiEl.style.color = cat.color; }
  const bmiLabelEl = document.getElementById('bmi-label');
  if (bmiLabelEl) { bmiLabelEl.textContent = cat.label; bmiLabelEl.style.color = cat.color; }
}

window.submitAssessment = async function() {
  const name = document.getElementById('assess-name')?.value?.trim();
  const phone = document.getElementById('assess-phone')?.value?.trim();
  const errEl = document.getElementById('assess-error');

  if (!name) { if (errEl) { errEl.textContent = 'Please enter your name'; errEl.style.display = 'block'; } return; }
  if (!phone || phone.length < 8) { if (errEl) { errEl.textContent = 'Please enter a valid phone number'; errEl.style.display = 'block'; } return; }
  if (errEl) errEl.style.display = 'none';

  const btn = document.getElementById('assess-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    await fetch(`${EDGE_BASE}/submit-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({
        trainer_id: currentTrainer?.id,
        name, phone: `+971${phone.replace(/\s/g,'')}`,
        type: 'assessment',
        assessment_data: assessData,
      }),
    });
    closeAssessModal();
    showToast('Sent! Your trainer will contact you on WhatsApp.', 'success');
  } catch {
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send My Results'; }
  }
};

// ── Lead form ──────────────────────────────────────────────────
window.submitLead = async function() {
  const name = document.getElementById('lead-name')?.value?.trim();
  const phone = document.getElementById('lead-phone')?.value?.trim();
  const goal = document.getElementById('lead-goal')?.value;
  const errEl = document.getElementById('lead-error');

  if (!name) { if (errEl) { errEl.textContent = 'Please enter your name'; errEl.style.display = 'block'; } return; }
  if (!phone || phone.length < 8) { if (errEl) { errEl.textContent = 'Please enter a valid phone number'; errEl.style.display = 'block'; } return; }
  if (errEl) errEl.style.display = 'none';

  const btn = document.getElementById('lead-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  const modal = document.getElementById('lead-modal');
  const packageName = modal?.dataset?.package || '';

  try {
    await fetch(`${EDGE_BASE}/submit-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({
        trainer_id: currentTrainer?.id,
        name, phone: `+971${phone.replace(/\s/g,'')}`,
        goal, package_name: packageName, type: 'booking',
      }),
    });
    closeLeadModal();
    showToast('Request sent! The trainer will WhatsApp you shortly.', 'success');
    // Reset form
    if (document.getElementById('lead-name')) document.getElementById('lead-name').value = '';
    if (document.getElementById('lead-phone')) document.getElementById('lead-phone').value = '';
  } catch {
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Request'; }
  }
};

// ── Share ──────────────────────────────────────────────────────
window.shareProfile = function() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: currentTrainer?.name, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied!', 'success')).catch(() => {});
  }
};

// ── Search ─────────────────────────────────────────────────────
window.searchTrainer = async function() {
  const q = document.getElementById('trainer-search')?.value?.trim();
  if (!q || q.length < 2) return;
  window.location.href = `/${q.toLowerCase().replace(/\s+/g,'-')}`;
};

// ── Init ───────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTrainer);
} else {
  loadTrainer();
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.id === 'lead-modal') closeLeadModal();
  if (e.target.id === 'assess-modal') closeAssessModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLeadModal(); closeAssessModal(); closeLightbox(); }
});
