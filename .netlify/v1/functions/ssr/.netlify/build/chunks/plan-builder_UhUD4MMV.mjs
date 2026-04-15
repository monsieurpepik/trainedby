import { g as getMarket, $ as $$Base } from './Base_glshNjsF.mjs';
import { c as createComponent } from './astro-component_QCe02764.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_qCRG1Hg9.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$PlanBuilder = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PlanBuilder;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `AI Plan Builder — ${brandName}`, "description": "Create evidence-based, citation-backed diet and workout plans for your clients in under 60 seconds.", "data-astro-cid-ysl2tgr5": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<div class="wrap" data-astro-cid-ysl2tgr5> <!-- HEADER --> <header class="header" data-astro-cid-ysl2tgr5> <a href="/dashboard" class="header-logo" data-astro-cid-ysl2tgr5> <svg width="24" height="24" viewBox="0 0 32 32" fill="none" data-astro-cid-ysl2tgr5><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-ysl2tgr5></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-ysl2tgr5>TB</text></svg> ', ` </a> <div class="header-badge" data-astro-cid-ysl2tgr5>⚡ AI Plan Builder</div> </header> <!-- PAGE TITLE --> <div class="page-title" data-astro-cid-ysl2tgr5> <h1 data-astro-cid-ysl2tgr5>AI Plan Builder</h1> <p data-astro-cid-ysl2tgr5>Generate evidence-based, personalised diet and workout plans for your clients. Each plan is grounded in current sports science research and branded with your name.</p> <div class="science-badge" data-astro-cid-ysl2tgr5>🔬 Powered by Perplexity Sonar + ACSM/ISSN Guidelines</div> </div> <!-- FORM --> <form id="planForm" data-astro-cid-ysl2tgr5> <!-- Plan Type --> <div class="form-section" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Plan Type</div> <div class="type-toggle" data-astro-cid-ysl2tgr5> <button type="button" class="type-btn active" data-type="both" data-astro-cid-ysl2tgr5> <span class="type-icon" data-astro-cid-ysl2tgr5>🎯</span>Diet + Workout
</button> <button type="button" class="type-btn" data-type="diet" data-astro-cid-ysl2tgr5> <span class="type-icon" data-astro-cid-ysl2tgr5>🥗</span>Diet Only
</button> <button type="button" class="type-btn" data-type="workout" data-astro-cid-ysl2tgr5> <span class="type-icon" data-astro-cid-ysl2tgr5>💪</span>Workout Only
</button> </div> <input type="hidden" id="planType" value="both" data-astro-cid-ysl2tgr5> </div> <!-- Client Profile --> <div class="form-section" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Client Profile</div> <div class="form-grid" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Client Name</label> <input class="form-input" id="clientName" type="text" placeholder="Ahmed Al Rashidi" required data-astro-cid-ysl2tgr5> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Goal</label> <select class="form-select" id="goal" data-astro-cid-ysl2tgr5> <option value="fat_loss" data-astro-cid-ysl2tgr5>Fat Loss</option> <option value="muscle_gain" data-astro-cid-ysl2tgr5>Muscle Gain</option> <option value="endurance" data-astro-cid-ysl2tgr5>Endurance</option> <option value="general_fitness" selected data-astro-cid-ysl2tgr5>General Fitness</option> <option value="sport_performance" data-astro-cid-ysl2tgr5>Sport Performance</option> </select> </div> </div> <div class="form-grid-3" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Age</label> <input class="form-input" id="age" type="number" value="30" min="16" max="80" required data-astro-cid-ysl2tgr5> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Weight (kg)</label> <input class="form-input" id="weight" type="number" value="80" min="40" max="200" required data-astro-cid-ysl2tgr5> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Height (cm)</label> <input class="form-input" id="height" type="number" value="175" min="140" max="220" required data-astro-cid-ysl2tgr5> </div> </div> <div class="form-grid" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Gender</label> <select class="form-select" id="gender" data-astro-cid-ysl2tgr5> <option value="male" data-astro-cid-ysl2tgr5>Male</option> <option value="female" data-astro-cid-ysl2tgr5>Female</option> </select> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Activity Level</label> <select class="form-select" id="activityLevel" data-astro-cid-ysl2tgr5> <option value="sedentary" data-astro-cid-ysl2tgr5>Sedentary (desk job)</option> <option value="lightly_active" data-astro-cid-ysl2tgr5>Lightly Active</option> <option value="moderately_active" selected data-astro-cid-ysl2tgr5>Moderately Active</option> <option value="very_active" data-astro-cid-ysl2tgr5>Very Active</option> </select> </div> </div> </div> <!-- Workout Settings --> <div class="form-section" id="workoutSection" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Training Settings</div> <div class="form-grid" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Training Days / Week</label> <select class="form-select" id="trainingDays" data-astro-cid-ysl2tgr5> <option value="3" data-astro-cid-ysl2tgr5>3 days</option> <option value="4" selected data-astro-cid-ysl2tgr5>4 days</option> <option value="5" data-astro-cid-ysl2tgr5>5 days</option> <option value="6" data-astro-cid-ysl2tgr5>6 days</option> </select> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Equipment Available</label> <select class="form-select" id="equipment" data-astro-cid-ysl2tgr5> <option value="gym_full" selected data-astro-cid-ysl2tgr5>Full Gym</option> <option value="gym_basic" data-astro-cid-ysl2tgr5>Basic Gym</option> <option value="home" data-astro-cid-ysl2tgr5>Home / Minimal</option> <option value="outdoor" data-astro-cid-ysl2tgr5>Outdoor Only</option> </select> </div> </div> <div class="form-grid" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Fitness Level</label> <select class="form-select" id="fitnessLevel" data-astro-cid-ysl2tgr5> <option value="beginner" data-astro-cid-ysl2tgr5>Beginner</option> <option value="intermediate" selected data-astro-cid-ysl2tgr5>Intermediate</option> <option value="advanced" data-astro-cid-ysl2tgr5>Advanced</option> </select> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Injuries / Limitations</label> <input class="form-input" id="injuries" type="text" placeholder="e.g. lower back, knee" data-astro-cid-ysl2tgr5> </div> </div> </div> <!-- Diet Settings --> <div class="form-section" id="dietSection" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Dietary Preferences</div> <div class="form-field" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Dietary Restrictions</label> <div class="pill-group" id="restrictionPills" data-astro-cid-ysl2tgr5> <div class="pill" data-val="halal" data-astro-cid-ysl2tgr5>Halal</div> <div class="pill" data-val="vegetarian" data-astro-cid-ysl2tgr5>Vegetarian</div> <div class="pill" data-val="vegan" data-astro-cid-ysl2tgr5>Vegan</div> <div class="pill" data-val="lactose_free" data-astro-cid-ysl2tgr5>Lactose Free</div> <div class="pill" data-val="gluten_free" data-astro-cid-ysl2tgr5>Gluten Free</div> <div class="pill" data-val="no_pork" data-astro-cid-ysl2tgr5>No Pork</div> <div class="pill" data-val="low_carb" data-astro-cid-ysl2tgr5>Low Carb</div> <div class="pill" data-val="high_protein" data-astro-cid-ysl2tgr5>High Protein</div> </div> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Food Allergies</label> <input class="form-input" id="allergies" type="text" placeholder="e.g. nuts, shellfish, eggs" data-astro-cid-ysl2tgr5> </div> </div> <!-- Generate --> <div class="generate-wrap" data-astro-cid-ysl2tgr5> <button type="submit" class="generate-btn" id="generateBtn" data-astro-cid-ysl2tgr5> <span data-astro-cid-ysl2tgr5>🔬</span> Generate Evidence-Based Plan
</button> <p class="generate-note" data-astro-cid-ysl2tgr5>Sourced from ACSM, ISSN, and peer-reviewed sports science via Perplexity Sonar</p> </div> </form> <!-- LOADING --> <div class="loading-state" id="loadingState" data-astro-cid-ysl2tgr5> <div class="loading-spinner" data-astro-cid-ysl2tgr5></div> <div style="font-family:'Manrope',sans-serif;font-weight:700;font-size:16px;margin-bottom:6px" data-astro-cid-ysl2tgr5>Building your plan...</div> <div style="font-size:13px;color:var(--text-muted)" data-astro-cid-ysl2tgr5>Sourcing current sports science research</div> <div class="loading-steps" data-astro-cid-ysl2tgr5> <div class="loading-step active" id="step1" data-astro-cid-ysl2tgr5>🔬 Querying Perplexity Sonar for latest research...</div> <div class="loading-step" id="step2" data-astro-cid-ysl2tgr5>🧮 Calculating TDEE and macronutrient targets...</div> <div class="loading-step" id="step3" data-astro-cid-ysl2tgr5>🥗 Generating personalised meal plan...</div> <div class="loading-step" id="step4" data-astro-cid-ysl2tgr5>💪 Building progressive workout programme...</div> <div class="loading-step" id="step5" data-astro-cid-ysl2tgr5>✅ Packaging your branded plan...</div> </div> </div> <!-- RESULT --> <div class="result-section" id="resultSection" data-astro-cid-ysl2tgr5> <div class="result-header" data-astro-cid-ysl2tgr5> <div class="result-title" id="resultTitle" data-astro-cid-ysl2tgr5>Plan Ready</div> <div class="result-meta" id="resultMeta" data-astro-cid-ysl2tgr5></div> <div class="result-actions" data-astro-cid-ysl2tgr5> <button class="result-btn result-btn-brand" onclick="printPlan()" data-astro-cid-ysl2tgr5>⬇ Download PDF</button> <button class="result-btn result-btn-ghost" onclick="copyPlan()" data-astro-cid-ysl2tgr5>📋 Copy as Text</button> <button class="result-btn result-btn-ghost" onclick="resetForm()" data-astro-cid-ysl2tgr5>← New Plan</button> </div> </div> <div id="planOutput" data-astro-cid-ysl2tgr5></div> </div> </div> <script>
  const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

  // ── Plan type toggle ──
  let planType = 'both';
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      planType = btn.dataset.type;
      document.getElementById('planType').value = planType;
      document.getElementById('workoutSection').style.display = planType === 'diet' ? 'none' : '';
      document.getElementById('dietSection').style.display = planType === 'workout' ? 'none' : '';
    });
  });

  // ── Pill toggles ──
  const selectedRestrictions = new Set();
  document.querySelectorAll('#restrictionPills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      const val = pill.dataset.val;
      selectedRestrictions.has(val) ? selectedRestrictions.delete(val) : selectedRestrictions.add(val);
    });
  });

  // ── Form submit ──
  document.getElementById('planForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await generatePlan();
  });

  async function generatePlan() {
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    document.getElementById('planForm').style.display = 'none';
    document.getElementById('loadingState').classList.add('visible');
    document.getElementById('resultSection').classList.remove('visible');

    // Animate loading steps
    const steps = ['step1','step2','step3','step4','step5'];
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx > 0) document.getElementById(steps[stepIdx-1]).className = 'loading-step done';
      if (stepIdx < steps.length) {
        document.getElementById(steps[stepIdx]).className = 'loading-step active';
        stepIdx++;
      } else {
        clearInterval(stepInterval);
      }
    }, 1800);

    const payload = {
      type: planType,
      name: document.getElementById('clientName').value || 'Client',
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      weight_kg: parseFloat(document.getElementById('weight').value),
      height_cm: parseFloat(document.getElementById('height').value),
      goal: document.getElementById('goal').value,
      activity_level: document.getElementById('activityLevel').value,
      training_days_per_week: parseInt(document.getElementById('trainingDays').value),
      equipment: document.getElementById('equipment').value,
      fitness_level: document.getElementById('fitnessLevel').value,
      injuries: document.getElementById('injuries').value ? document.getElementById('injuries').value.split(',').map(s=>s.trim()) : [],
      dietary_restrictions: [...selectedRestrictions],
      food_allergies: document.getElementById('allergies').value ? document.getElementById('allergies').value.split(',').map(s=>s.trim()) : [],
      trainer_name: 'Your Trainer',
    };

    try {
      const res = await fetch(\`\${SUPABASE_URL}/functions/v1/generate-plan\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      clearInterval(stepInterval);
      steps.forEach(s => document.getElementById(s).className = 'loading-step done');
      setTimeout(() => {
        document.getElementById('loadingState').classList.remove('visible');
        if (data.success) {
          renderPlan(data.plan, data.meta);
        } else {
          alert('Error generating plan: ' + (data.error || 'Unknown error'));
          resetForm();
        }
      }, 600);
    } catch (err) {
      clearInterval(stepInterval);
      document.getElementById('loadingState').classList.remove('visible');
      alert('Network error. Please try again.');
      resetForm();
    }
  }

  function renderPlan(plan, meta) {
    const out = document.getElementById('planOutput');
    document.getElementById('resultTitle').textContent = \`\${plan.client_name}'s Plan\`;
    document.getElementById('resultMeta').textContent = \`Generated \${plan.generated_date} · By \${plan.trainer_name} · \${meta.research_grounded ? 'Research-grounded via Perplexity Sonar' : 'AI-generated'}\`;
    document.getElementById('resultSection').classList.add('visible');

    let html = '';

    // Goal summary
    html += \`<div class="plan-card">
      <div class="plan-card-title">🎯 Programme Overview <span class="tag tag-science">Evidence-Based</span></div>
      <p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin-bottom:12px">\${plan.goal_summary}</p>
      <p style="font-size:12px;color:var(--gold);font-style:italic">\${plan.science_note}</p>
    </div>\`;

    // Diet plan
    if (plan.diet_plan) {
      const d = plan.diet_plan;
      html += \`<div class="plan-card">
        <div class="plan-card-title">🥗 Diet Plan <span class="tag tag-diet">Nutrition</span></div>
        <div class="macro-row">
          <div class="macro-card"><div class="macro-val">\${d.daily_calories}</div><div class="macro-label">Calories</div></div>
          <div class="macro-card"><div class="macro-val">\${d.macros.protein_g}g</div><div class="macro-label">Protein</div></div>
          <div class="macro-card"><div class="macro-val">\${d.macros.carbs_g}g</div><div class="macro-label">Carbs</div></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <div class="macro-card" style="flex:1"><div class="macro-val">\${d.macros.fat_g}g</div><div class="macro-label">Fat</div></div>
          <div class="macro-card" style="flex:1"><div class="macro-val">\${Math.round(d.hydration_ml/1000*10)/10}L</div><div class="macro-label">Water</div></div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;padding:10px 12px;background:var(--surface-3);border-radius:8px">⏰ \${d.meal_timing_note}</p>\`;

      if (d.days && d.days.length > 0) {
        d.days.slice(0, 3).forEach(day => {
          html += \`<div class="meal-day"><div class="meal-day-title">\${day.day}</div>\`;
          day.meals.forEach(meal => {
            html += \`<div class="meal-row">
              <div class="meal-time">\${meal.time}</div>
              <div style="flex:1">
                <div class="meal-name">\${meal.meal}</div>
                <div class="meal-foods">\${meal.foods.join(' · ')}</div>
              </div>
              <div class="meal-cals">\${meal.calories} kcal<br><span style="font-size:9px;font-weight:400">\${meal.protein_g}g protein</span></div>
            </div>\`;
          });
          html += \`</div>\`;
        });
        if (d.days.length > 3) {
          html += \`<p style="font-size:12px;color:var(--text-faint);text-align:center;padding:10px">+ \${d.days.length - 3} more days in the full plan</p>\`;
        }
      }
      html += \`</div>\`;
    }

    // Workout plan
    if (plan.workout_plan) {
      const w = plan.workout_plan;
      html += \`<div class="plan-card">
        <div class="plan-card-title">💪 \${w.programme_name} <span class="tag tag-workout">Training</span></div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <div class="macro-card" style="flex:1"><div class="macro-val">\${w.duration_weeks}</div><div class="macro-label">Weeks</div></div>
          <div class="macro-card" style="flex:1"><div class="macro-val">\${w.sessions_per_week}x</div><div class="macro-label">Per Week</div></div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;padding:10px 12px;background:var(--surface-3);border-radius:8px">📈 \${w.progressive_overload_note}</p>\`;

      if (w.weeks && w.weeks.length > 0) {
        w.weeks.slice(0, 2).forEach(week => {
          html += \`<div class="workout-week"><div class="workout-week-title">Week \${week.week}</div>\`;
          week.sessions.forEach(session => {
            html += \`<div class="session-card">
              <div class="session-header">
                <div><div class="session-day">\${session.day}</div><div class="session-focus">\${session.focus}</div></div>
                <div class="session-duration">\${session.duration_min} min</div>
              </div>
              <div style="font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:grid;grid-template-columns:1fr 80px 80px 60px;gap:8px">
                <span>Exercise</span><span style="text-align:center">Sets</span><span style="text-align:center">Reps</span><span style="text-align:center">Rest</span>
              </div>\`;
            session.exercises.forEach(ex => {
              html += \`<div class="exercise-row">
                <div class="exercise-name">\${ex.name}</div>
                <div class="exercise-meta">\${ex.sets}</div>
                <div class="exercise-meta">\${ex.reps}</div>
                <div class="exercise-meta">\${ex.rest_sec}s</div>
                \${ex.notes ? \`<div class="exercise-note">\${ex.notes}</div>\` : ''}
              </div>\`;
            });
            html += \`</div>\`;
          });
          html += \`</div>\`;
        });
        if (w.weeks.length > 2) {
          html += \`<p style="font-size:12px;color:var(--text-faint);text-align:center;padding:10px">+ \${w.weeks.length - 2} more weeks in the full plan</p>\`;
        }
      }
      html += \`</div>\`;
    }

    // Supplements
    if (plan.supplement_recommendations && plan.supplement_recommendations.length > 0) {
      html += \`<div class="plan-card">
        <div class="plan-card-title">💊 Supplement Stack <span class="tag tag-science">Evidence-Rated</span></div>
        <p style="font-size:11px;color:var(--text-faint);margin-bottom:12px">Evidence levels: A = Strong (multiple RCTs), B = Moderate, C = Emerging</p>\`;
      plan.supplement_recommendations.forEach(s => {
        html += \`<div class="supp-row">
          <div class="supp-name">\${s.supplement}</div>
          <div class="supp-dose">\${s.dose} · \${s.timing}</div>
          <div class="supp-evidence evidence-\${s.evidence_level}">Grade \${s.evidence_level}</div>
        </div>\`;
      });
      html += \`</div>\`;
    }

    // Citations
    if (plan.citations && plan.citations.length > 0) {
      html += \`<div class="plan-card">
        <div class="plan-card-title">📚 Research Sources <span class="tag tag-science">Cited</span></div>
        <div class="citations-list">\`;
      plan.citations.forEach((c, i) => {
        html += \`<div class="citation-item">[\${i+1}] \${c}</div>\`;
      });
      html += \`</div></div>\`;
    }

    // Check-in questions
    if (plan.weekly_check_in_questions && plan.weekly_check_in_questions.length > 0) {
      html += \`<div class="plan-card">
        <div class="plan-card-title">📋 Weekly Check-In Questions</div>
        <div style="display:flex;flex-direction:column;gap:8px">\`;
      plan.weekly_check_in_questions.forEach((q, i) => {
        html += \`<div style="font-size:13px;color:var(--text-muted);padding:8px 12px;background:var(--surface-3);border-radius:8px">\${i+1}. \${q}</div>\`;
      });
      html += \`</div></div>\`;
    }

    out.innerHTML = html;
    window.currentPlan = plan;
  }

  function resetForm() {
    document.getElementById('planForm').style.display = '';
    document.getElementById('loadingState').classList.remove('visible');
    document.getElementById('resultSection').classList.remove('visible');
    document.getElementById('generateBtn').disabled = false;
    document.querySelectorAll('.loading-step').forEach((s, i) => {
      s.className = i === 0 ? 'loading-step active' : 'loading-step';
    });
  }

  function printPlan() {
    window.print();
  }

  function copyPlan() {
    if (!window.currentPlan) return;
    const text = JSON.stringify(window.currentPlan, null, 2);
    navigator.clipboard.writeText(text).then(() => alert('Plan copied to clipboard as JSON'));
  }
<\/script> `], ["  ", '<div class="wrap" data-astro-cid-ysl2tgr5> <!-- HEADER --> <header class="header" data-astro-cid-ysl2tgr5> <a href="/dashboard" class="header-logo" data-astro-cid-ysl2tgr5> <svg width="24" height="24" viewBox="0 0 32 32" fill="none" data-astro-cid-ysl2tgr5><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-ysl2tgr5></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-ysl2tgr5>TB</text></svg> ', ` </a> <div class="header-badge" data-astro-cid-ysl2tgr5>⚡ AI Plan Builder</div> </header> <!-- PAGE TITLE --> <div class="page-title" data-astro-cid-ysl2tgr5> <h1 data-astro-cid-ysl2tgr5>AI Plan Builder</h1> <p data-astro-cid-ysl2tgr5>Generate evidence-based, personalised diet and workout plans for your clients. Each plan is grounded in current sports science research and branded with your name.</p> <div class="science-badge" data-astro-cid-ysl2tgr5>🔬 Powered by Perplexity Sonar + ACSM/ISSN Guidelines</div> </div> <!-- FORM --> <form id="planForm" data-astro-cid-ysl2tgr5> <!-- Plan Type --> <div class="form-section" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Plan Type</div> <div class="type-toggle" data-astro-cid-ysl2tgr5> <button type="button" class="type-btn active" data-type="both" data-astro-cid-ysl2tgr5> <span class="type-icon" data-astro-cid-ysl2tgr5>🎯</span>Diet + Workout
</button> <button type="button" class="type-btn" data-type="diet" data-astro-cid-ysl2tgr5> <span class="type-icon" data-astro-cid-ysl2tgr5>🥗</span>Diet Only
</button> <button type="button" class="type-btn" data-type="workout" data-astro-cid-ysl2tgr5> <span class="type-icon" data-astro-cid-ysl2tgr5>💪</span>Workout Only
</button> </div> <input type="hidden" id="planType" value="both" data-astro-cid-ysl2tgr5> </div> <!-- Client Profile --> <div class="form-section" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Client Profile</div> <div class="form-grid" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Client Name</label> <input class="form-input" id="clientName" type="text" placeholder="Ahmed Al Rashidi" required data-astro-cid-ysl2tgr5> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Goal</label> <select class="form-select" id="goal" data-astro-cid-ysl2tgr5> <option value="fat_loss" data-astro-cid-ysl2tgr5>Fat Loss</option> <option value="muscle_gain" data-astro-cid-ysl2tgr5>Muscle Gain</option> <option value="endurance" data-astro-cid-ysl2tgr5>Endurance</option> <option value="general_fitness" selected data-astro-cid-ysl2tgr5>General Fitness</option> <option value="sport_performance" data-astro-cid-ysl2tgr5>Sport Performance</option> </select> </div> </div> <div class="form-grid-3" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Age</label> <input class="form-input" id="age" type="number" value="30" min="16" max="80" required data-astro-cid-ysl2tgr5> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Weight (kg)</label> <input class="form-input" id="weight" type="number" value="80" min="40" max="200" required data-astro-cid-ysl2tgr5> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Height (cm)</label> <input class="form-input" id="height" type="number" value="175" min="140" max="220" required data-astro-cid-ysl2tgr5> </div> </div> <div class="form-grid" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Gender</label> <select class="form-select" id="gender" data-astro-cid-ysl2tgr5> <option value="male" data-astro-cid-ysl2tgr5>Male</option> <option value="female" data-astro-cid-ysl2tgr5>Female</option> </select> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Activity Level</label> <select class="form-select" id="activityLevel" data-astro-cid-ysl2tgr5> <option value="sedentary" data-astro-cid-ysl2tgr5>Sedentary (desk job)</option> <option value="lightly_active" data-astro-cid-ysl2tgr5>Lightly Active</option> <option value="moderately_active" selected data-astro-cid-ysl2tgr5>Moderately Active</option> <option value="very_active" data-astro-cid-ysl2tgr5>Very Active</option> </select> </div> </div> </div> <!-- Workout Settings --> <div class="form-section" id="workoutSection" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Training Settings</div> <div class="form-grid" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Training Days / Week</label> <select class="form-select" id="trainingDays" data-astro-cid-ysl2tgr5> <option value="3" data-astro-cid-ysl2tgr5>3 days</option> <option value="4" selected data-astro-cid-ysl2tgr5>4 days</option> <option value="5" data-astro-cid-ysl2tgr5>5 days</option> <option value="6" data-astro-cid-ysl2tgr5>6 days</option> </select> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Equipment Available</label> <select class="form-select" id="equipment" data-astro-cid-ysl2tgr5> <option value="gym_full" selected data-astro-cid-ysl2tgr5>Full Gym</option> <option value="gym_basic" data-astro-cid-ysl2tgr5>Basic Gym</option> <option value="home" data-astro-cid-ysl2tgr5>Home / Minimal</option> <option value="outdoor" data-astro-cid-ysl2tgr5>Outdoor Only</option> </select> </div> </div> <div class="form-grid" data-astro-cid-ysl2tgr5> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Fitness Level</label> <select class="form-select" id="fitnessLevel" data-astro-cid-ysl2tgr5> <option value="beginner" data-astro-cid-ysl2tgr5>Beginner</option> <option value="intermediate" selected data-astro-cid-ysl2tgr5>Intermediate</option> <option value="advanced" data-astro-cid-ysl2tgr5>Advanced</option> </select> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Injuries / Limitations</label> <input class="form-input" id="injuries" type="text" placeholder="e.g. lower back, knee" data-astro-cid-ysl2tgr5> </div> </div> </div> <!-- Diet Settings --> <div class="form-section" id="dietSection" data-astro-cid-ysl2tgr5> <div class="form-section-title" data-astro-cid-ysl2tgr5>Dietary Preferences</div> <div class="form-field" style="margin-bottom:14px" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Dietary Restrictions</label> <div class="pill-group" id="restrictionPills" data-astro-cid-ysl2tgr5> <div class="pill" data-val="halal" data-astro-cid-ysl2tgr5>Halal</div> <div class="pill" data-val="vegetarian" data-astro-cid-ysl2tgr5>Vegetarian</div> <div class="pill" data-val="vegan" data-astro-cid-ysl2tgr5>Vegan</div> <div class="pill" data-val="lactose_free" data-astro-cid-ysl2tgr5>Lactose Free</div> <div class="pill" data-val="gluten_free" data-astro-cid-ysl2tgr5>Gluten Free</div> <div class="pill" data-val="no_pork" data-astro-cid-ysl2tgr5>No Pork</div> <div class="pill" data-val="low_carb" data-astro-cid-ysl2tgr5>Low Carb</div> <div class="pill" data-val="high_protein" data-astro-cid-ysl2tgr5>High Protein</div> </div> </div> <div class="form-field" data-astro-cid-ysl2tgr5> <label class="form-label" data-astro-cid-ysl2tgr5>Food Allergies</label> <input class="form-input" id="allergies" type="text" placeholder="e.g. nuts, shellfish, eggs" data-astro-cid-ysl2tgr5> </div> </div> <!-- Generate --> <div class="generate-wrap" data-astro-cid-ysl2tgr5> <button type="submit" class="generate-btn" id="generateBtn" data-astro-cid-ysl2tgr5> <span data-astro-cid-ysl2tgr5>🔬</span> Generate Evidence-Based Plan
</button> <p class="generate-note" data-astro-cid-ysl2tgr5>Sourced from ACSM, ISSN, and peer-reviewed sports science via Perplexity Sonar</p> </div> </form> <!-- LOADING --> <div class="loading-state" id="loadingState" data-astro-cid-ysl2tgr5> <div class="loading-spinner" data-astro-cid-ysl2tgr5></div> <div style="font-family:'Manrope',sans-serif;font-weight:700;font-size:16px;margin-bottom:6px" data-astro-cid-ysl2tgr5>Building your plan...</div> <div style="font-size:13px;color:var(--text-muted)" data-astro-cid-ysl2tgr5>Sourcing current sports science research</div> <div class="loading-steps" data-astro-cid-ysl2tgr5> <div class="loading-step active" id="step1" data-astro-cid-ysl2tgr5>🔬 Querying Perplexity Sonar for latest research...</div> <div class="loading-step" id="step2" data-astro-cid-ysl2tgr5>🧮 Calculating TDEE and macronutrient targets...</div> <div class="loading-step" id="step3" data-astro-cid-ysl2tgr5>🥗 Generating personalised meal plan...</div> <div class="loading-step" id="step4" data-astro-cid-ysl2tgr5>💪 Building progressive workout programme...</div> <div class="loading-step" id="step5" data-astro-cid-ysl2tgr5>✅ Packaging your branded plan...</div> </div> </div> <!-- RESULT --> <div class="result-section" id="resultSection" data-astro-cid-ysl2tgr5> <div class="result-header" data-astro-cid-ysl2tgr5> <div class="result-title" id="resultTitle" data-astro-cid-ysl2tgr5>Plan Ready</div> <div class="result-meta" id="resultMeta" data-astro-cid-ysl2tgr5></div> <div class="result-actions" data-astro-cid-ysl2tgr5> <button class="result-btn result-btn-brand" onclick="printPlan()" data-astro-cid-ysl2tgr5>⬇ Download PDF</button> <button class="result-btn result-btn-ghost" onclick="copyPlan()" data-astro-cid-ysl2tgr5>📋 Copy as Text</button> <button class="result-btn result-btn-ghost" onclick="resetForm()" data-astro-cid-ysl2tgr5>← New Plan</button> </div> </div> <div id="planOutput" data-astro-cid-ysl2tgr5></div> </div> </div> <script>
  const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

  // ── Plan type toggle ──
  let planType = 'both';
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      planType = btn.dataset.type;
      document.getElementById('planType').value = planType;
      document.getElementById('workoutSection').style.display = planType === 'diet' ? 'none' : '';
      document.getElementById('dietSection').style.display = planType === 'workout' ? 'none' : '';
    });
  });

  // ── Pill toggles ──
  const selectedRestrictions = new Set();
  document.querySelectorAll('#restrictionPills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      const val = pill.dataset.val;
      selectedRestrictions.has(val) ? selectedRestrictions.delete(val) : selectedRestrictions.add(val);
    });
  });

  // ── Form submit ──
  document.getElementById('planForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await generatePlan();
  });

  async function generatePlan() {
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    document.getElementById('planForm').style.display = 'none';
    document.getElementById('loadingState').classList.add('visible');
    document.getElementById('resultSection').classList.remove('visible');

    // Animate loading steps
    const steps = ['step1','step2','step3','step4','step5'];
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx > 0) document.getElementById(steps[stepIdx-1]).className = 'loading-step done';
      if (stepIdx < steps.length) {
        document.getElementById(steps[stepIdx]).className = 'loading-step active';
        stepIdx++;
      } else {
        clearInterval(stepInterval);
      }
    }, 1800);

    const payload = {
      type: planType,
      name: document.getElementById('clientName').value || 'Client',
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      weight_kg: parseFloat(document.getElementById('weight').value),
      height_cm: parseFloat(document.getElementById('height').value),
      goal: document.getElementById('goal').value,
      activity_level: document.getElementById('activityLevel').value,
      training_days_per_week: parseInt(document.getElementById('trainingDays').value),
      equipment: document.getElementById('equipment').value,
      fitness_level: document.getElementById('fitnessLevel').value,
      injuries: document.getElementById('injuries').value ? document.getElementById('injuries').value.split(',').map(s=>s.trim()) : [],
      dietary_restrictions: [...selectedRestrictions],
      food_allergies: document.getElementById('allergies').value ? document.getElementById('allergies').value.split(',').map(s=>s.trim()) : [],
      trainer_name: 'Your Trainer',
    };

    try {
      const res = await fetch(\\\`\\\${SUPABASE_URL}/functions/v1/generate-plan\\\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': \\\`Bearer \\\${SUPABASE_ANON_KEY}\\\` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      clearInterval(stepInterval);
      steps.forEach(s => document.getElementById(s).className = 'loading-step done');
      setTimeout(() => {
        document.getElementById('loadingState').classList.remove('visible');
        if (data.success) {
          renderPlan(data.plan, data.meta);
        } else {
          alert('Error generating plan: ' + (data.error || 'Unknown error'));
          resetForm();
        }
      }, 600);
    } catch (err) {
      clearInterval(stepInterval);
      document.getElementById('loadingState').classList.remove('visible');
      alert('Network error. Please try again.');
      resetForm();
    }
  }

  function renderPlan(plan, meta) {
    const out = document.getElementById('planOutput');
    document.getElementById('resultTitle').textContent = \\\`\\\${plan.client_name}'s Plan\\\`;
    document.getElementById('resultMeta').textContent = \\\`Generated \\\${plan.generated_date} · By \\\${plan.trainer_name} · \\\${meta.research_grounded ? 'Research-grounded via Perplexity Sonar' : 'AI-generated'}\\\`;
    document.getElementById('resultSection').classList.add('visible');

    let html = '';

    // Goal summary
    html += \\\`<div class="plan-card">
      <div class="plan-card-title">🎯 Programme Overview <span class="tag tag-science">Evidence-Based</span></div>
      <p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin-bottom:12px">\\\${plan.goal_summary}</p>
      <p style="font-size:12px;color:var(--gold);font-style:italic">\\\${plan.science_note}</p>
    </div>\\\`;

    // Diet plan
    if (plan.diet_plan) {
      const d = plan.diet_plan;
      html += \\\`<div class="plan-card">
        <div class="plan-card-title">🥗 Diet Plan <span class="tag tag-diet">Nutrition</span></div>
        <div class="macro-row">
          <div class="macro-card"><div class="macro-val">\\\${d.daily_calories}</div><div class="macro-label">Calories</div></div>
          <div class="macro-card"><div class="macro-val">\\\${d.macros.protein_g}g</div><div class="macro-label">Protein</div></div>
          <div class="macro-card"><div class="macro-val">\\\${d.macros.carbs_g}g</div><div class="macro-label">Carbs</div></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <div class="macro-card" style="flex:1"><div class="macro-val">\\\${d.macros.fat_g}g</div><div class="macro-label">Fat</div></div>
          <div class="macro-card" style="flex:1"><div class="macro-val">\\\${Math.round(d.hydration_ml/1000*10)/10}L</div><div class="macro-label">Water</div></div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;padding:10px 12px;background:var(--surface-3);border-radius:8px">⏰ \\\${d.meal_timing_note}</p>\\\`;

      if (d.days && d.days.length > 0) {
        d.days.slice(0, 3).forEach(day => {
          html += \\\`<div class="meal-day"><div class="meal-day-title">\\\${day.day}</div>\\\`;
          day.meals.forEach(meal => {
            html += \\\`<div class="meal-row">
              <div class="meal-time">\\\${meal.time}</div>
              <div style="flex:1">
                <div class="meal-name">\\\${meal.meal}</div>
                <div class="meal-foods">\\\${meal.foods.join(' · ')}</div>
              </div>
              <div class="meal-cals">\\\${meal.calories} kcal<br><span style="font-size:9px;font-weight:400">\\\${meal.protein_g}g protein</span></div>
            </div>\\\`;
          });
          html += \\\`</div>\\\`;
        });
        if (d.days.length > 3) {
          html += \\\`<p style="font-size:12px;color:var(--text-faint);text-align:center;padding:10px">+ \\\${d.days.length - 3} more days in the full plan</p>\\\`;
        }
      }
      html += \\\`</div>\\\`;
    }

    // Workout plan
    if (plan.workout_plan) {
      const w = plan.workout_plan;
      html += \\\`<div class="plan-card">
        <div class="plan-card-title">💪 \\\${w.programme_name} <span class="tag tag-workout">Training</span></div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <div class="macro-card" style="flex:1"><div class="macro-val">\\\${w.duration_weeks}</div><div class="macro-label">Weeks</div></div>
          <div class="macro-card" style="flex:1"><div class="macro-val">\\\${w.sessions_per_week}x</div><div class="macro-label">Per Week</div></div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;padding:10px 12px;background:var(--surface-3);border-radius:8px">📈 \\\${w.progressive_overload_note}</p>\\\`;

      if (w.weeks && w.weeks.length > 0) {
        w.weeks.slice(0, 2).forEach(week => {
          html += \\\`<div class="workout-week"><div class="workout-week-title">Week \\\${week.week}</div>\\\`;
          week.sessions.forEach(session => {
            html += \\\`<div class="session-card">
              <div class="session-header">
                <div><div class="session-day">\\\${session.day}</div><div class="session-focus">\\\${session.focus}</div></div>
                <div class="session-duration">\\\${session.duration_min} min</div>
              </div>
              <div style="font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:grid;grid-template-columns:1fr 80px 80px 60px;gap:8px">
                <span>Exercise</span><span style="text-align:center">Sets</span><span style="text-align:center">Reps</span><span style="text-align:center">Rest</span>
              </div>\\\`;
            session.exercises.forEach(ex => {
              html += \\\`<div class="exercise-row">
                <div class="exercise-name">\\\${ex.name}</div>
                <div class="exercise-meta">\\\${ex.sets}</div>
                <div class="exercise-meta">\\\${ex.reps}</div>
                <div class="exercise-meta">\\\${ex.rest_sec}s</div>
                \\\${ex.notes ? \\\`<div class="exercise-note">\\\${ex.notes}</div>\\\` : ''}
              </div>\\\`;
            });
            html += \\\`</div>\\\`;
          });
          html += \\\`</div>\\\`;
        });
        if (w.weeks.length > 2) {
          html += \\\`<p style="font-size:12px;color:var(--text-faint);text-align:center;padding:10px">+ \\\${w.weeks.length - 2} more weeks in the full plan</p>\\\`;
        }
      }
      html += \\\`</div>\\\`;
    }

    // Supplements
    if (plan.supplement_recommendations && plan.supplement_recommendations.length > 0) {
      html += \\\`<div class="plan-card">
        <div class="plan-card-title">💊 Supplement Stack <span class="tag tag-science">Evidence-Rated</span></div>
        <p style="font-size:11px;color:var(--text-faint);margin-bottom:12px">Evidence levels: A = Strong (multiple RCTs), B = Moderate, C = Emerging</p>\\\`;
      plan.supplement_recommendations.forEach(s => {
        html += \\\`<div class="supp-row">
          <div class="supp-name">\\\${s.supplement}</div>
          <div class="supp-dose">\\\${s.dose} · \\\${s.timing}</div>
          <div class="supp-evidence evidence-\\\${s.evidence_level}">Grade \\\${s.evidence_level}</div>
        </div>\\\`;
      });
      html += \\\`</div>\\\`;
    }

    // Citations
    if (plan.citations && plan.citations.length > 0) {
      html += \\\`<div class="plan-card">
        <div class="plan-card-title">📚 Research Sources <span class="tag tag-science">Cited</span></div>
        <div class="citations-list">\\\`;
      plan.citations.forEach((c, i) => {
        html += \\\`<div class="citation-item">[\\\${i+1}] \\\${c}</div>\\\`;
      });
      html += \\\`</div></div>\\\`;
    }

    // Check-in questions
    if (plan.weekly_check_in_questions && plan.weekly_check_in_questions.length > 0) {
      html += \\\`<div class="plan-card">
        <div class="plan-card-title">📋 Weekly Check-In Questions</div>
        <div style="display:flex;flex-direction:column;gap:8px">\\\`;
      plan.weekly_check_in_questions.forEach((q, i) => {
        html += \\\`<div style="font-size:13px;color:var(--text-muted);padding:8px 12px;background:var(--surface-3);border-radius:8px">\\\${i+1}. \\\${q}</div>\\\`;
      });
      html += \\\`</div></div>\\\`;
    }

    out.innerHTML = html;
    window.currentPlan = plan;
  }

  function resetForm() {
    document.getElementById('planForm').style.display = '';
    document.getElementById('loadingState').classList.remove('visible');
    document.getElementById('resultSection').classList.remove('visible');
    document.getElementById('generateBtn').disabled = false;
    document.querySelectorAll('.loading-step').forEach((s, i) => {
      s.className = i === 0 ? 'loading-step active' : 'loading-step';
    });
  }

  function printPlan() {
    window.print();
  }

  function copyPlan() {
    if (!window.currentPlan) return;
    const text = JSON.stringify(window.currentPlan, null, 2);
    navigator.clipboard.writeText(text).then(() => alert('Plan copied to clipboard as JSON'));
  }
<\/script> `])), maybeRenderHead(), brandName) })}`;
}, "/home/ubuntu/trainedby2/src/pages/plan-builder.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/plan-builder.astro";
const $$url = "/plan-builder";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PlanBuilder,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
