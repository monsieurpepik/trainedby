const v="https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1",u="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";let l=[],d=[];function c(e){let t=0;return e.avatar_url&&(t+=20),e.bio&&e.bio.length>30&&(t+=20),e.reps_verified&&(t+=15),e.specialties&&e.specialties.length>0&&(t+=10),e.city&&(t+=10),e.instagram&&(t+=10),e.packages&&e.packages.length>0&&(t+=10),e.years_experience&&(t+=5),t}function y(e){return e>=80?"#00C853":e>=50?"#ffaa00":"#ff4444"}function p(e){return e.email&&e.email.includes("xss_test")||e.email&&e.email==="not-an-email"||e.name&&e.name.includes("<script>")}async function m(){try{const e=await fetch(`${v}/get-trainer?all=true`,{headers:{Authorization:"Bearer "+u}});l=await(await fetch("https://mezhtdbfyvkshpuplqqw.supabase.co/rest/v1/trainers?select=*&order=created_at.desc",{headers:{Authorization:"Bearer "+u,apikey:u}})).json(),Array.isArray(l)||(l=[]),h(),w(),document.getElementById("last-updated").textContent="Last updated: "+new Date().toLocaleTimeString("en-AE")}catch(e){document.getElementById("trainer-tbody").innerHTML='<tr><td colspan="8" class="loading" style="color:#ff4444">Error loading trainers: '+e.message+"</td></tr>"}}function h(){const e=l.filter(n=>!p(n)),t=new Date(Date.now()-10080*60*1e3);document.getElementById("kpi-total").textContent=e.length,document.getElementById("kpi-pro").textContent=e.filter(n=>n.plan==="pro").length,document.getElementById("kpi-reps").textContent=e.filter(n=>n.reps_verified).length,document.getElementById("kpi-complete").textContent=e.filter(n=>c(n)>=80).length,document.getElementById("kpi-week").textContent=e.filter(n=>new Date(n.created_at)>t).length}function w(){const e=document.getElementById("search").value.toLowerCase(),t=document.getElementById("filter-plan").value,n=document.getElementById("filter-reps").value,s=document.getElementById("filter-completion").value,i=document.getElementById("filter-sort").value;d=l.filter(a=>{if(e&&!((a.name||"").toLowerCase().includes(e)||(a.email||"").toLowerCase().includes(e)||(a.city||"").toLowerCase().includes(e))||t&&a.plan!==t||n==="verified"&&!a.reps_verified||n==="unverified"&&a.reps_verified)return!1;const r=c(a);return!(s==="high"&&r<80||s==="low"&&r>=50)}),d.sort((a,r)=>i==="oldest"?new Date(a.created_at)-new Date(r.created_at):i==="completion"?c(r)-c(a):i==="name"?(a.name||"").localeCompare(r.name||""):new Date(r.created_at)-new Date(a.created_at)),I()}function I(){const e=document.getElementById("trainer-tbody");if(d.length===0){e.innerHTML='<tr><td colspan="8"><div class="empty-state"><h3>No trainers found</h3><p>Try adjusting your filters.</p></div></td></tr>';return}e.innerHTML=d.map(t=>{const n=c(t),s=y(n),i=(t.name||"?").split(" ").map(g=>g[0]).join("").substring(0,2).toUpperCase(),a=p(t),r=new Date(t.created_at).toLocaleDateString("en-AE",{day:"numeric",month:"short",year:"2-digit"}),f=t.last_seen_at?E(new Date(t.last_seen_at)):'<span style="color:var(--text-faint)">Never</span>';return`<tr>
      <td>
        <div class="trainer-cell">
          ${t.avatar_url?`<img class="trainer-avatar" src="${t.avatar_url}" alt="${i}">`:`<div class="trainer-avatar">${i}</div>`}
          <div>
            <div class="trainer-name">${o(t.name||"Unknown")} ${a?'<span class="badge badge-test">TEST</span>':""}</div>
            <div class="trainer-email">${o(t.email||"—")}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge ${t.plan==="pro"?"badge-pro":"badge-free"}">
          ${t.plan==="pro"?"★ Pro":"Free"}
        </span>
      </td>
      <td>
        ${t.reps_verified?'<span class="badge badge-reps">✓ Verified</span>':'<span class="badge badge-pending">Pending</span>'}
      </td>
      <td>
        <div class="completion-wrap">
          <div class="completion-bar">
            <div class="completion-fill" style="width:${n}%;background:${s}"></div>
          </div>
          <span class="completion-pct" style="color:${s}">${n}%</span>
        </div>
      </td>
      <td style="color:var(--text-muted)">${o(t.city||"—")}</td>
      <td style="color:var(--text-muted);white-space:nowrap">${r}</td>
      <td style="color:var(--text-muted)">${f}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn view" onclick="openDetail('${t.id}')">View</button>
          <button class="action-btn email" onclick="sendEmail('${t.id}','${o(t.email||"")}','${o(t.name||"")}')">Email</button>
        </div>
      </td>
    </tr>`}).join("")}function b(){document.getElementById("detail-modal").classList.remove("open")}function o(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function E(e){const t=(Date.now()-e.getTime())/1e3;return t<60?"Just now":t<3600?Math.floor(t/60)+"m ago":t<86400?Math.floor(t/3600)+"h ago":t<604800?Math.floor(t/86400)+"d ago":e.toLocaleDateString("en-AE",{day:"numeric",month:"short"})}document.getElementById("detail-modal").addEventListener("click",function(e){e.target===this&&b()});m();setInterval(m,6e4);
