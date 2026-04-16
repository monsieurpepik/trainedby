const P="https://mezhtdbfyvkshpuplqqw.supabase.co",B="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";function R(){if(window.__TRAINER_SLUG__)return window.__TRAINER_SLUG__;const e=location.pathname.replace(/^\//,"").trim();if(e&&e!=="index.html"&&e!=="profile")return e;const t=new URLSearchParams(location.search);return t.get("trainer")||t.get("slug")||""}async function S(){const e=R();if(!e){A("No trainer specified");return}try{const t=await fetch(`${P}/functions/v1/get-trainer?slug=${encodeURIComponent(e)}`,{headers:{Authorization:`Bearer ${B}`,apikey:B}});if(!t.ok)throw new Error(`HTTP ${t.status}`);const r=await t.json();if(!r||r.error)throw new Error("Trainer not found");const d=r.trainer||r,n=r.packages||[];L(d,n)}catch{A("Trainer not found")}}function A(e="Trainer not found"){const t=document.getElementById("profile-mount"),r=document.getElementById("loading-state");r&&(r.style.display="none"),t&&(t.style.display="block",t.innerHTML=`
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:24px;padding:32px;text-align:center">
            <div style="font-size:48px">🔍</div>
            <h1 style="font-size:24px;font-weight:700">Trainer not found</h1>
            <p style="color:rgba(255,255,255,0.6);max-width:360px">This trainer profile doesn't exist or has been removed.</p>
            <a href="/find" style="background:#FF5C00;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">Find a Trainer</a>
          </div>`)}function L(e,t){const r=document.getElementById("loading-state"),d=document.getElementById("profile-mount");if(r&&(r.style.display="none"),!d)return;d.style.display="block";const n=e.name||e.full_name||"",s=e.avatar_url||e.profile_photo_url||"",u=document.getElementById("bg");if(u&&s&&(u.style.backgroundImage=`url('${s}')`),s){const i=new Image;i.crossOrigin="anonymous",i.onload=function(){try{const c=document.createElement("canvas");c.width=8,c.height=8;const z=c.getContext("2d");z.drawImage(i,0,0,8,8);const a=z.getImageData(0,0,8,8).data;let g=0,f=0,x=0,l=0;for(let o=0;o<a.length;o+=4){const I=(a[o]+a[o+1]+a[o+2])/3;I>30&&I<230&&(g+=a[o],f+=a[o+1],x+=a[o+2],l++)}l>0&&(g=Math.round(g/l),f=Math.round(f/l),x=Math.round(x/l),document.documentElement.style.setProperty("--avatar-color",`${g},${f},${x}`))}catch{}},i.src=s}const b=window.__BRAND__&&window.__BRAND__.name?window.__BRAND__.name:window.__BRAND__||"TrainedBy",C=Array.isArray(e.specialties)?e.specialties:e.specialties?[e.specialties]:["Personal Trainer"],y=e.avg_rating?parseFloat(e.avg_rating).toFixed(1):"5.0",m=e.review_count||0,M=e.plan==="pro"||e.plan==="elite",j=e.reps_verified||e.is_verified||e.verification_status==="verified",T=e.city||"",E=e.country||"",h=[T,E].filter(Boolean).join(", "),v=e.bio||"",w=e.instagram||e.instagram_handle||"",k=e.whatsapp||e.phone||"",$=Array.isArray(e.certifications)?e.certifications:[],p=Array.isArray(t)?t:[],_=p[0]?.price||null,F=p[0]?.currency||"";document.title=`${n}  -  Verified Trainer on ${b}`,d.innerHTML=`
        <div style="max-width:680px;margin:0 auto;padding:24px 16px 80px">

          <!-- Back nav -->
          <a href="/find" style="display:inline-flex;align-items:center;gap:8px;color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;margin-bottom:24px;transition:color 0.2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">
            ← Back to results
          </a>

          <!-- Hero card -->
          <div style="background:rgba(10,10,10,0.72);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,0.10);border-radius:24px;overflow:hidden;margin-bottom:16px;box-shadow:0 8px 48px rgba(0,0,0,0.5)">
            <div style="position:relative;height:240px;background:linear-gradient(135deg,#1a1a1a,#0a0a0a)">
              ${s?`<img src="${s}" alt="${n}" style="width:100%;height:100%;object-fit:cover;object-position:top">`:""}
              <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.75) 100%)"></div>
              ${j?'<div style="position:absolute;top:16px;right:16px;background:rgba(34,197,94,0.18);border:1px solid rgba(34,197,94,0.35);color:#22c55e;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;backdrop-filter:blur(12px);letter-spacing:0.03em">✓ Verified</div>':""}
              ${M?'<div style="position:absolute;top:16px;left:16px;background:linear-gradient(135deg,rgba(197,162,39,0.25),rgba(245,208,107,0.15));border:1px solid rgba(197,162,39,0.4);color:#f5d06b;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:800;backdrop-filter:blur(12px);letter-spacing:0.05em">PRO</div>':""}
            </div>
            <div style="padding:22px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
                <div>
                  <h1 style="font-family:var(--font-display,'Manrope',sans-serif);font-size:26px;font-weight:900;margin-bottom:4px;letter-spacing:-0.03em">${n}</h1>
                  <p style="color:rgba(255,255,255,0.55);font-size:14px;font-family:var(--font-body,'Inter',sans-serif)">${C.join(" · ")}${h?" · "+h:""}</p>
                </div>
                <div style="text-align:right">
                  <div style="font-family:var(--font-display,'Manrope',sans-serif);font-size:22px;font-weight:900;color:var(--brand,#FF5C00);letter-spacing:-0.02em">${_?`From ${F} ${_}`:""}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.4);font-family:var(--font-body,'Inter',sans-serif)">per session</div>
                </div>
              </div>

              ${m>0?`
              <div style="display:flex;align-items:center;gap:6px;margin-top:12px">
                <span style="color:#f59e0b;font-size:16px">${"★".repeat(Math.round(parseFloat(y)))}${"☆".repeat(5-Math.round(parseFloat(y)))}</span>
                <span style="font-weight:700">${y}</span>
                <span style="color:rgba(255,255,255,0.5);font-size:13px">(${m} reviews)</span>
              </div>`:""}

              ${v?`<p style="margin-top:16px;color:rgba(255,255,255,0.8);line-height:1.6;font-size:15px">${v}</p>`:""}
            </div>
          </div>

          <!-- Certifications -->
          ${$.length>0?`
          <div style="background:rgba(10,10,10,0.65);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:20px;margin-bottom:16px;box-shadow:0 4px 24px rgba(0,0,0,0.3)">
            <h2 style="font-family:var(--font-display,'Manrope',sans-serif);font-size:15px;font-weight:800;margin-bottom:14px;letter-spacing:-0.01em">Certifications</h2>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${$.map(i=>`<span style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600">${i}</span>`).join("")}
            </div>
          </div>`:""}

          <!-- Packages -->
          ${p.length>0?`
          <div style="background:rgba(10,10,10,0.65);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:20px;margin-bottom:16px;box-shadow:0 4px 24px rgba(0,0,0,0.3)">
            <h2 style="font-family:var(--font-display,'Manrope',sans-serif);font-size:15px;font-weight:800;margin-bottom:14px;letter-spacing:-0.01em">Training Packages</h2>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${p.map(i=>`
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px">
                <div>
                  <div style="font-weight:700;font-size:15px">${i.name||i.title||"Package"}</div>
                  ${i.description?`<div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:2px">${i.description}</div>`:""}
                </div>
                <div style="font-family:var(--font-display,'Manrope',sans-serif);font-size:18px;font-weight:900;color:var(--brand,#FF5C00);white-space:nowrap;letter-spacing:-0.02em">${i.price?`${i.currency||""} ${i.price}`.trim():""}</div>
              </div>`).join("")}
            </div>
          </div>`:""}

          <!-- CTA buttons -->
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
            ${k?`
            <a href="https://wa.me/${k.replace(/\D/g,"")}?text=Hi ${encodeURIComponent(n)}, I found your profile on ${b} and I'd like to book a session."
               target="_blank" rel="noopener" class="wa-cta-pulse"
               style="display:flex;align-items:center;justify-content:center;gap:10px;background:#25D366;color:#fff;padding:16px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Book via WhatsApp
            </a>`:""}
            ${w?`
            <a href="https://instagram.com/${w.replace("@","")}"
               target="_blank" rel="noopener"
               style="display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;padding:16px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              View on Instagram
            </a>`:""}
            <a href="/find"
               style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);padding:14px;border-radius:14px;text-decoration:none;font-weight:600;font-size:15px">
              ← Browse all trainers
            </a>
            ${"share"in navigator?`
            <button onclick="shareProfile('${n}')" id="share-btn"
               style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);padding:12px;border-radius:14px;font-weight:600;font-size:14px;cursor:pointer;width:100%;font-family:inherit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share this profile
            </button>`:""}
          </div>

          <!-- Powered by footer -->
          <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08)">
            <a href="/" style="color:rgba(255,255,255,0.3);text-decoration:none;font-size:13px">
              Powered by <strong style="color:rgba(255,255,255,0.5)">${b}</strong>
            </a>
          </div>
        </div>`}S();
