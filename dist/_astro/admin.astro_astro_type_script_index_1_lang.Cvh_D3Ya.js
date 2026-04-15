const l="https://mezhtdbfyvkshpuplqqw.supabase.co",o="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDk3NTQsImV4cCI6MjA1OTE4NTc1NH0.vPDjMbWBCHgHEMkHHJMFCgPPIFbKDMqkfTCUQFGxGaY";let s=null,d=[],i=[],g=[],u=null;async function y(){const e=document.getElementById("tokenInput").value.trim();if(e)try{const n=await(await fetch(`${l}/rest/v1/academies?admin_magic_token=eq.${encodeURIComponent(e)}&select=id,slug,name,sport`,{headers:{apikey:o,Authorization:`Bearer ${o}`}})).json();if(!n||n.length===0){alert("Invalid token. Please check your admin link.");return}u=e,s=n[0],document.getElementById("authGate").style.display="none",document.getElementById("app").style.display="flex",v()}catch{alert("Authentication failed. Please try again.")}}window.addEventListener("DOMContentLoaded",()=>{const t=new URLSearchParams(window.location.search).get("token");t&&(document.getElementById("tokenInput").value=t,y())});async function v(){document.getElementById("sb-name").textContent=s.name,document.getElementById("sb-sport").textContent=s.sport,document.getElementById("view-profile-link").href=`/academy/${s.slug}`,document.getElementById("overview-title").textContent=`${s.name} — Overview`,await Promise.all([h(),$(),_()]),f()}async function h(){d=await(await fetch(`${l}/rest/v1/programs?academy_id=eq.${s.id}&order=created_at.desc`,{headers:{apikey:o,Authorization:`Bearer ${o}`}})).json(),I()}async function $(){i=await(await fetch(`${l}/rest/v1/academy_bookings?academy_id=eq.${s.id}&order=created_at.desc&limit=100`,{headers:{apikey:o,Authorization:`Bearer ${o}`}})).json(),k()}async function _(){g=await(await fetch(`${l}/rest/v1/coach_payouts?academy_id=eq.${s.id}&order=period_start.desc`,{headers:{apikey:o,Authorization:`Bearer ${o}`}})).json(),b()}function f(){const e=i.filter(a=>a.status==="confirmed"),t=e.reduce((a,r)=>a+Number(r.amount_paid||0),0),n=e.reduce((a,r)=>a+Number(r.platform_fee||0),0),m=d.filter(a=>a.is_active).length;document.getElementById("kpi-progs").textContent=m,document.getElementById("kpi-bookings").textContent=e.length,document.getElementById("kpi-revenue").textContent=`AED ${t.toFixed(0)}`,document.getElementById("kpi-fee").textContent=`AED ${n.toFixed(0)}`;const c=i.slice(0,5),p=c.length?`<table class="data-table"><thead><tr><th>Child</th><th>Parent</th><th>Programme</th><th>Amount</th><th>Status</th></tr></thead><tbody>
    ${c.map(a=>`<tr>
      <td><strong>${a.child_name}</strong></td>
      <td>${a.parent_name}<br><span style="font-size:11px;color:var(--white-60)">${a.parent_email}</span></td>
      <td>${d.find(r=>r.id===a.program_id)?.name||"—"}</td>
      <td>${a.currency} ${a.amount_paid}</td>
      <td><span class="badge badge-${a.status}">${a.status}</span></td>
    </tr>`).join("")}
  </tbody></table>`:'<div class="empty-state"><div class="empty-icon">🎟</div><p>No bookings yet</p></div>';document.getElementById("recent-bookings-table").innerHTML=p}function I(){const e=document.getElementById("prog-grid");if(!d.length){e.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><p>No programmes yet.<br>Add your first programme to start accepting bookings.</p></div>';return}e.innerHTML=d.map(t=>{const n=Math.min(100,Math.round((t.enrolled_count||0)/t.max_capacity*100)),m=n>=100?"full":n>=75?"warn":"",c=t.currency==="GBP"?`£${t.price_gbp}`:`AED ${t.price_aed}`;return`<div class="prog-admin-card">
      <div class="prog-admin-name">${t.name}</div>
      <div class="prog-admin-meta">${t.sport} · ${t.program_type} · ${t.age_label||"All ages"}</div>
      <div class="prog-admin-stats">
        <div class="prog-stat"><div class="prog-stat-val">${t.enrolled_count||0}</div><div class="prog-stat-lbl">Enrolled</div></div>
        <div class="prog-stat"><div class="prog-stat-val">${t.max_capacity}</div><div class="prog-stat-lbl">Capacity</div></div>
        <div class="prog-stat"><div class="prog-stat-val">${c}</div><div class="prog-stat-lbl">Price</div></div>
      </div>
      <div class="capacity-bar"><div class="capacity-fill ${m}" style="width:${n}%"></div></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="toggleProgram('${t.id}',${!t.is_active})">${t.is_active?"Deactivate":"Activate"}</button>
        <span class="badge ${t.is_active?"badge-confirmed":"badge-cancelled"}">${t.is_active?"Active":"Inactive"}</span>
      </div>
    </div>`}).join("")}function k(){const e=document.getElementById("bookings-tbody");if(document.getElementById("bookings-count").textContent=`${i.length} total`,!i.length){e.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--white-60);padding:32px">No bookings yet</td></tr>';return}e.innerHTML=i.map(t=>`<tr>
    <td><strong>${t.child_name}</strong>${t.child_notes?`<br><span style="font-size:11px;color:var(--white-60)">${t.child_notes}</span>`:""}</td>
    <td>${t.parent_name}<br><span style="font-size:11px;color:var(--white-60)">${t.parent_email} · ${t.parent_phone}</span></td>
    <td>${d.find(n=>n.id===t.program_id)?.name||"—"}</td>
    <td>${t.currency} ${t.amount_paid}<br><span style="font-size:11px;color:var(--white-60)">Net: ${t.currency} ${t.academy_payout||(t.amount_paid*.9).toFixed(2)}</span></td>
    <td><span class="badge badge-${t.status}">${t.status}</span></td>
    <td style="font-size:12px;color:var(--white-60)">${new Date(t.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})}</td>
  </tr>`).join("")}function b(){const e=document.getElementById("payouts-tbody");if(!g.length){e.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--white-60);padding:32px">No payout records yet. Payouts are processed weekly.</td></tr>';return}e.innerHTML=g.map(t=>`<tr>
    <td>${t.period_start} → ${t.period_end}</td>
    <td>${t.sessions_count}</td>
    <td>${t.currency} ${t.gross_amount}</td>
    <td>${t.currency} ${t.platform_fee}</td>
    <td><strong>${t.currency} ${t.net_amount}</strong></td>
    <td><span class="badge badge-${t.status==="paid"?"confirmed":t.status==="pending"?"pending":"cancelled"}">${t.status}</span></td>
  </tr>`).join("")}
