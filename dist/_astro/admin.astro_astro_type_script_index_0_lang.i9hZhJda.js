const v="https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1",p="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";let l=[],c=[];function y(e){const t=e.verification_status||(e.reps_verified?"verified":"unverified");return t==="verified"||e.reps_verified?'<span class="badge badge-reps">✓ Verified</span>':t==="pending"?'<span class="badge badge-pending">⏳ Pending</span>':t==="lapsed"?'<span class="badge badge-lapsed">⚠ Lapsed</span>':t==="name_mismatch"?'<span class="badge badge-pending">Name Mismatch</span>':'<span class="badge badge-free">Unverified</span>'}function d(e){let t=0;return e.avatar_url&&(t+=20),e.bio&&e.bio.length>30&&(t+=20),e.reps_verified&&(t+=15),e.specialties&&e.specialties.length>0&&(t+=10),e.city&&(t+=10),e.instagram&&(t+=10),e.packages&&e.packages.length>0&&(t+=10),e.years_experience&&(t+=5),t}function h(e){return e>=80?"#00C853":e>=50?"#ffaa00":"#ff4444"}function u(e){return e.email&&e.email.includes("xss_test")||e.email&&e.email==="not-an-email"||e.name&&e.name.includes("<script>")}async function f(){try{const e=await fetch(`${v}/get-trainer?all=true`,{headers:{Authorization:"Bearer "+p}});l=await(await fetch("https://mezhtdbfyvkshpuplqqw.supabase.co/rest/v1/trainers?select=*&order=created_at.desc",{headers:{Authorization:"Bearer "+p,apikey:p}})).json(),Array.isArray(l)||(l=[]),b(),I(),document.getElementById("last-updated").textContent="Last updated: "+new Date().toLocaleTimeString("en-AE");const n=l.filter(r=>r.verification_status==="pending"&&!u(r)).length,a=document.getElementById("queue-badge");n>0?(a.textContent=n,a.style.display=""):a.style.display="none"}catch(e){document.getElementById("trainer-tbody").innerHTML='<tr><td colspan="8" class="loading" style="color:#ff4444">Error loading trainers: '+e.message+"</td></tr>"}}function b(){const e=l.filter(n=>!u(n)),t=new Date(Date.now()-10080*60*1e3);document.getElementById("kpi-total").textContent=e.length,document.getElementById("kpi-pro").textContent=e.filter(n=>n.plan==="pro").length,document.getElementById("kpi-reps").textContent=e.filter(n=>n.reps_verified||n.verification_status==="verified").length,document.getElementById("kpi-pending").textContent=e.filter(n=>n.verification_status==="pending").length,document.getElementById("kpi-complete").textContent=e.filter(n=>d(n)>=80).length,document.getElementById("kpi-week").textContent=e.filter(n=>new Date(n.created_at)>t).length}function I(){const e=document.getElementById("search").value.toLowerCase(),t=document.getElementById("filter-plan").value,n=document.getElementById("filter-reps").value,a=document.getElementById("filter-completion").value,r=document.getElementById("filter-sort").value;c=l.filter(i=>{if(e&&!((i.name||"").toLowerCase().includes(e)||(i.email||"").toLowerCase().includes(e)||(i.city||"").toLowerCase().includes(e))||t&&i.plan!==t||n==="verified"&&!(i.reps_verified||i.verification_status==="verified")||n==="pending"&&i.verification_status!=="pending"||n==="lapsed"&&i.verification_status!=="lapsed"||n==="unverified"&&(i.reps_verified||["verified","pending","lapsed"].includes(i.verification_status)))return!1;const s=d(i);return!(a==="high"&&s<80||a==="low"&&s>=50)}),c.sort((i,s)=>r==="oldest"?new Date(i.created_at)-new Date(s.created_at):r==="completion"?d(s)-d(i):r==="name"?(i.name||"").localeCompare(s.name||""):new Date(s.created_at)-new Date(i.created_at)),w()}function w(){const e=document.getElementById("trainer-tbody");if(c.length===0){e.innerHTML='<tr><td colspan="8"><div class="empty-state"><h3>No trainers found</h3><p>Try adjusting your filters.</p></div></td></tr>';return}e.innerHTML=c.map(t=>{const n=d(t),a=h(n),r=(t.name||"?").split(" ").map(g=>g[0]).join("").substring(0,2).toUpperCase(),i=u(t),s=new Date(t.created_at).toLocaleDateString("en-AE",{day:"numeric",month:"short",year:"2-digit"}),m=(t.market||"ae").toUpperCase();return`<tr>
      <td>
        <div class="trainer-cell">
          ${t.avatar_url?`<img class="trainer-avatar" src="${t.avatar_url}" alt="${r}">`:`<div class="trainer-avatar">${r}</div>`}
          <div>
            <div class="trainer-name">${o(t.name||"Unknown")} ${i?'<span class="badge badge-test">TEST</span>':""}</div>
            <div class="trainer-email">${o(t.email||"—")}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge ${t.plan==="pro"?"badge-pro":"badge-free"}">
          ${t.plan==="pro"?"★ Pro":"Free"}
        </span>
      </td>
      <td>${y(t)}</td>
      <td>
        <div class="completion-wrap">
          <div class="completion-bar">
            <div class="completion-fill" style="width:${n}%;background:${a}"></div>
          </div>
          <span class="completion-pct" style="color:${a}">${n}%</span>
        </div>
      </td>
      <td style="color:var(--text-muted)">${o(t.city||"—")}</td>
      <td style="color:var(--text-faint);font-size:11px;font-weight:700">${m}</td>
      <td style="color:var(--text-muted);white-space:nowrap">${s}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn view" onclick="openDetail('${t.id}')">View</button>
          <button class="action-btn email" onclick="sendEmail('${t.id}','${o(t.email||"")}','${o(t.name||"")}')">Email</button>
        </div>
      </td>
    </tr>`}).join("")}function E(){document.getElementById("detail-modal").classList.remove("open")}function o(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function _(){document.getElementById("cert-lightbox").classList.remove("open")}document.getElementById("detail-modal").addEventListener("click",function(e){e.target===this&&E()});document.getElementById("cert-lightbox").addEventListener("click",function(e){e.target===this&&_()});f();setInterval(f,6e4);
