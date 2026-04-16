const I="https://mezhtdbfyvkshpuplqqw.supabase.co",u="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzE5NTIsImV4cCI6MjA2MDIwNzk1Mn0.Yd4OGMBqwvLz5_6vFAFqBNRLNFBMXCRKFiGJFCqQUYI",b="trainedby-admin-2026";let y=[],f=[];const c={ae:{flag:"🇦🇪",name:"TrainedBy UAE",domain:"window.location.hostname",live:!0,currency:"AED",proPrice:149},uk:{flag:"🇬🇧",name:"TrainedBy UK",domain:"trainedby.uk",live:!0,currency:"GBP",proPrice:9.99},com:{flag:"🌍",name:"TrainedBy Global",domain:"trainedby.com",live:!0,currency:"USD",proPrice:19},in:{flag:"🇮🇳",name:"TrainedBy India",domain:"trainedby.in",live:!1,currency:"INR",proPrice:499},fr:{flag:"🇫🇷",name:"CoachéPar",domain:"coachepar.fr",live:!1,currency:"EUR",proPrice:19},it:{flag:"🇮🇹",name:"AllenatoCon",domain:"allenaticon.it",live:!1,currency:"EUR",proPrice:19},es:{flag:"🇪🇸",name:"EntrenaCon",domain:"entrenacon.com",live:!1,currency:"EUR",proPrice:19},mx:{flag:"🇲🇽",name:"EntrenaCon MX",domain:"entrenacon.mx",live:!1,currency:"MXN",proPrice:399}};function h(){document.getElementById("gate-input").value===b?(document.getElementById("gate").style.display="none",document.getElementById("topbar").style.display="flex",document.getElementById("main").style.display="block",B(),w()):document.getElementById("gate-error").style.display="block"}function B(){function t(){document.getElementById("clock").textContent=new Date().toUTCString().replace(" GMT"," UTC")}t(),setInterval(t,1e3)}async function m(t){const n=await fetch(`${I}/rest/v1/${t}`,{headers:{apikey:u,Authorization:`Bearer ${u}`,"x-admin-secret":b,Prefer:"return=representation"}});return n.ok?n.json():[]}async function w(){document.getElementById("last-updated").textContent="Refreshing...",await Promise.all([x(),C(),T(),S()]),document.getElementById("last-updated").textContent=`Last updated: ${new Date().toLocaleTimeString()}`}async function x(){const[t,n]=await Promise.all([m("trainers?select=id,plan,market,verification_status,created_at"),m("market_waitlist?select=id,market")]),a=t.length,r=t.filter(e=>e.plan==="pro").length,o=t.filter(e=>e.verification_status==="verified").length,s=t.filter(e=>new Date(e.created_at)>new Date(Date.now()-10080*60*1e3)).length,d=n.length;let v=0;t.filter(e=>e.plan==="pro").forEach(e=>{const i=c[e.market];i&&(v+=i.proPrice)}),document.getElementById("g-trainers").textContent=a.toLocaleString(),document.getElementById("g-pro").textContent=r.toLocaleString(),document.getElementById("g-verified").textContent=o.toLocaleString(),document.getElementById("g-waitlist").textContent=d.toLocaleString(),document.getElementById("g-week").textContent=`+${s}`,document.getElementById("g-mrr").textContent=`~$${Math.round(v).toLocaleString()}`;const l={};t.forEach(e=>{l[e.market]||(l[e.market]={total:0,pro:0,verified:0}),l[e.market].total++,e.plan==="pro"&&l[e.market].pro++,e.verification_status==="verified"&&l[e.market].verified++});const p={};n.forEach(e=>{p[e.market]=(p[e.market]||0)+1});const k=document.getElementById("market-grid");k.innerHTML=Object.entries(c).map(([e,i])=>{const g=l[e]||{total:0,pro:0,verified:0},$=p[e]||0,E=g.pro*i.proPrice;return`
        <div class="market-card ${i.live?"live":"waitlist"}">
          <div class="market-header">
            <div class="market-flag">${i.flag}</div>
            <div>
              <div class="market-name">${i.name}</div>
              <div class="market-domain">${i.domain}</div>
            </div>
            <div class="market-status ${i.live?"status-live":"status-waitlist"}">${i.live?"LIVE":"WAITLIST"}</div>
          </div>
          <div class="market-stats">
            <div class="mstat"><div class="mstat-val">${g.total}</div><div class="mstat-label">Trainers</div></div>
            <div class="mstat"><div class="mstat-val">${g.pro}</div><div class="mstat-label">Pro</div></div>
            <div class="mstat"><div class="mstat-val">${i.live?g.verified:$}</div><div class="mstat-label">${i.live?"Verified":"Waitlist"}</div></div>
          </div>
          ${i.live?`
          <div class="market-revenue">
            <div class="rev-label">Est. MRR</div>
            <div class="rev-value">${i.currency} ${E.toLocaleString()}</div>
          </div>`:`
          <div class="market-revenue">
            <div class="rev-label">Payments</div>
            <div class="rev-value" style="color:var(--text-2);font-size:13px;">Coming soon</div>
          </div>`}
        </div>
      `}).join("")}async function C(){y=await m("trainers?select=id,full_name,email,market,plan,verification_status,created_at,slug&order=created_at.desc&limit=500"),L(y)}function L(t){const n=document.getElementById("trainers-tbody");if(!t.length){n.innerHTML='<tr><td colspan="6" style="color:var(--text-2);text-align:center;padding:32px">No trainers found</td></tr>';return}n.innerHTML=t.map(a=>{const r=c[a.market]||{flag:"?",name:a.market},o=a.plan==="pro"?'<span class="badge badge-orange">PRO</span>':'<span class="badge badge-gray">FREE</span>',s=a.verification_status==="verified"?'<span class="badge badge-green">✓ Verified</span>':a.verification_status==="pending"?'<span class="badge badge-orange">Pending</span>':'<span class="badge badge-gray">Unverified</span>',d=new Date(a.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"});return`<tr>
        <td><div style="font-weight:600">${a.full_name||" - "}</div><div style="font-size:11px;color:var(--text-2)">${a.email||""}</div></td>
        <td>${r.flag} ${r.name}</td>
        <td>${o}</td>
        <td>${s}</td>
        <td style="color:var(--text-2)">${d}</td>
        <td><a href="/${a.slug||a.id}" target="_blank" style="color:var(--brand);font-size:12px;text-decoration:none">View →</a></td>
      </tr>`}).join("")}async function T(){f=await m("market_waitlist?select=*&order=created_at.desc&limit=1000"),M(f)}function M(t){const n=document.getElementById("waitlist-tbody");if(!t.length){n.innerHTML='<tr><td colspan="6" style="color:var(--text-2);text-align:center;padding:32px">No waitlist entries yet</td></tr>';return}n.innerHTML=t.map(a=>{const r=c[a.market]||{flag:"?",name:a.market},o=new Date(a.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"}),s=a.role==="trainer"?'<span class="badge badge-orange">Trainer</span>':'<span class="badge badge-gray">Client</span>';return`<tr>
        <td style="font-weight:500">${a.email}</td>
        <td style="color:var(--text-2)">${a.name||" - "}</td>
        <td>${r.flag} ${r.name}</td>
        <td>${s}</td>
        <td style="font-size:11px;color:var(--text-2)">${a.source_domain||" - "}</td>
        <td style="color:var(--text-2)">${o}</td>
      </tr>`}).join("")}async function S(){const t=await m("trainers?select=market,plan"),n={};t.forEach(r=>{n[r.market]||(n[r.market]={pro:0}),r.plan==="pro"&&n[r.market].pro++});const a=document.getElementById("revenue-tbody");a.innerHTML=Object.entries(c).map(([r,o])=>{const s=n[r]||{pro:0},d=s.pro*o.proPrice,v=o.live?'<span class="badge badge-green">Live</span>':'<span class="badge badge-orange">Coming Soon</span>';return`<tr>
        <td>${o.flag} ${r.toUpperCase()}</td>
        <td style="font-weight:600">${o.name}</td>
        <td>${o.currency}</td>
        <td style="text-align:center">${s.pro}</td>
        <td style="font-weight:700;color:var(--brand)">${o.currency} ${d.toLocaleString()}</td>
        <td style="color:var(--text-2)"> - </td>
        <td style="font-weight:700">${o.currency} ${d.toLocaleString()}</td>
        <td>${v}</td>
      </tr>`}).join("")}document.getElementById("gate-input").addEventListener("keydown",t=>{t.key==="Enter"&&h()});
