// ============================================================
// TrainedBy.ae — Config & API Client
// ============================================================

export const CONFIG = {
  SUPABASE_URL: window.__TB_CONFIG?.SUPABASE_URL || 'https://mezhtdbfyvkshpuplqqw.supabase.co',
  SUPABASE_ANON_KEY: window.__TB_CONFIG?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo',
  get EDGE_BASE() { return this.SUPABASE_URL + '/functions/v1'; },
  SITE_URL: 'https://trainedby.ae',
  BRAND_COLOR: '#FF5C00',
};

// ============================================================
// API Client
// ============================================================
export const api = {
  async getTrainer(slug) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/get-trainer?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Trainer not found');
    return res.json();
  },

  async registerTrainer(data) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/register-trainer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async sendMagicLink(email, redirect) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/send-magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirect }),
    });
    if (!res.ok) throw new Error('Could not send magic link');
    return res.json();
  },

  async verifyMagicLink(token) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/verify-magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('Invalid or expired token');
    return res.json();
  },

  async submitLead(data) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/submit-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Lead submission failed');
    return res.json();
  },

  async updateTrainer(data, token) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/update-trainer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  },

  async weeklyStats(token) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/weekly-stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Stats fetch failed');
    return res.json();
  },

  async createCheckout(data, token) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Checkout failed');
    return res.json();
  },

  async verifyReps(trainerId, repsNumber, token) {
    const res = await fetch(`${CONFIG.EDGE_BASE}/verify-reps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ trainer_id: trainerId, reps_number: repsNumber }),
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json();
  },

  async trackEvent(trainerId, eventType, metadata = {}) {
    // Fire and forget — don't await
    fetch(`${CONFIG.EDGE_BASE}/track-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: trainerId, event_type: eventType, metadata }),
    }).catch(() => {});
  },
};

// ============================================================
// Auth helpers
// ============================================================
export const auth = {
  getToken() { return localStorage.getItem('tb_edit_token'); },
  setToken(token) { localStorage.setItem('tb_edit_token', token); },
  clearToken() { localStorage.removeItem('tb_edit_token'); },
  isLoggedIn() { return !!this.getToken(); },
};

// ============================================================
// Fitness calculations
// ============================================================
export const fitness = {
  bmi(weightKg, heightCm) {
    const h = heightCm / 100;
    return parseFloat((weightKg / (h * h)).toFixed(1));
  },
  bmiCategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#4fc3f7' };
    if (bmi < 25) return { label: 'Healthy', color: '#00C853' };
    if (bmi < 30) return { label: 'Overweight', color: '#FF5C00' };
    return { label: 'Obese', color: '#ff5555' };
  },
  tdee(weightKg, heightCm, age, gender, activityLevel) {
    // Mifflin-St Jeor BMR
    let bmr = gender === 'female'
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161
      : (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
  },
};

// ============================================================
// UI helpers
// ============================================================
export function showToast(msg, type = '', duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:max(24px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%) translateY(80px);background:#1c1c1c;border:1px solid rgba(255,255,255,0.08);color:#fff;padding:12px 20px;border-radius:24px;font-size:13px;font-weight:600;z-index:1000;transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.5);';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  if (type === 'success') toast.style.cssText += 'background:rgba(0,200,83,0.08);border-color:rgba(0,200,83,0.2);color:#00C853;';
  else if (type === 'error') toast.style.cssText += 'background:rgba(255,85,85,0.08);border-color:rgba(255,85,85,0.2);color:#ff5555;';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(80px)'; }, duration);
}

export function formatAED(amount) {
  return 'AED ' + Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 0 });
}

export function formatTimeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export function getSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const reserved = ['edit', 'dashboard', 'join', 'pricing', 'privacy', 'terms', 'landing'];
  return parts[0] && !reserved.includes(parts[0]) ? parts[0] : null;
}
