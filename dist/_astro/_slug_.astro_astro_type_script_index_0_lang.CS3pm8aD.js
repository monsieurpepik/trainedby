const $="https://mezhtdbfyvkshpuplqqw.supabase.co",b="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";function k(){if(window.__TRAINER_SLUG__)return window.__TRAINER_SLUG__;const e=location.pathname.replace(/^\//,"").trim();if(e&&e!=="index.html"&&e!=="profile")return e;const i=new URLSearchParams(location.search);return i.get("trainer")||i.get("slug")||""}async function z(){const e=k();if(!e){u("No trainer specified");return}try{const i=await fetch(`${$}/functions/v1/get-trainer?slug=${encodeURIComponent(e)}`,{headers:{Authorization:`Bearer ${b}`,apikey:b}});if(!i.ok)throw new Error(`HTTP ${i.status}`);const t=await i.json();if(!t||t.error)throw new Error("Trainer not found");_(t)}catch{u("Trainer not found")}}function u(e="Trainer not found"){const i=document.getElementById("profile-mount"),t=document.getElementById("loading-state");t&&(t.style.display="none"),i&&(i.style.display="block",i.innerHTML=`
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:24px;padding:32px;text-align:center">
            <div style="font-size:48px">🔍</div>
            <h1 style="font-size:24px;font-weight:700">Trainer not found</h1>
            <p style="color:rgba(255,255,255,0.6);max-width:360px">This trainer profile doesn't exist or has been removed.</p>
            <a href="/find" style="background:#FF5C00;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">Find a Trainer</a>
          </div>`)}function _(e){const i=document.getElementById("loading-state"),t=document.getElementById("profile-mount");if(i&&(i.style.display="none"),!t)return;t.style.display="block";const s=document.getElementById("bg");s&&e.profile_photo_url&&(s.style.backgroundImage=`url('${e.profile_photo_url}')`);const r=window.__BRAND__||"TrainedBy",y=Array.isArray(e.specialty)?e.specialty:[e.specialty||"Personal Trainer"],n=e.avg_rating?parseFloat(e.avg_rating).toFixed(1):"5.0",p=e.review_count||0,h=e.plan==="pro"||e.plan==="elite",m=e.is_verified,v=e.city||"",w=e.country||"",d=[v,w].filter(Boolean).join(", "),l=e.bio||"",c=e.instagram_handle||"",g=e.whatsapp||"",f=Array.isArray(e.certifications)?e.certifications:[],a=Array.isArray(e.packages)?e.packages:[],x=e.price_from||a[0]?.price||null;document.title=`${e.full_name} — Verified Trainer on ${r}`,t.innerHTML=`
        <div style="max-width:680px;margin:0 auto;padding:24px 16px 80px">

          <!-- Back nav -->
          <a href="/find" style="display:inline-flex;align-items:center;gap:8px;color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;margin-bottom:24px;transition:color 0.2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">
            ← Back to results
          </a>

          <!-- Hero card -->
          <div style="background:rgba(10,10,10,0.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;overflow:hidden;margin-bottom:16px">
            <div style="position:relative;height:220px;background:linear-gradient(135deg,#1a1a1a,#0a0a0a)">
              ${e.profile_photo_url?`<img src="${e.profile_photo_url}" alt="${e.full_name}" style="width:100%;height:100%;object-fit:cover;object-position:top">`:""}
              <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.8) 100%)"></div>
              ${m?'<div style="position:absolute;top:16px;right:16px;background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.4);color:#22c55e;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;backdrop-filter:blur(8px)">✓ Verified</div>':""}
              ${h?'<div style="position:absolute;top:16px;left:16px;background:rgba(255,92,0,0.2);border:1px solid rgba(255,92,0,0.4);color:#FF5C00;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;backdrop-filter:blur(8px)">PRO</div>':""}
            </div>
            <div style="padding:20px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
                <div>
                  <h1 style="font-size:24px;font-weight:800;margin-bottom:4px">${e.full_name}</h1>
                  <p style="color:rgba(255,255,255,0.6);font-size:14px">${y.join(" · ")}${d?" · "+d:""}</p>
                </div>
                <div style="text-align:right">
                  <div style="font-size:22px;font-weight:800;color:#FF5C00">${x?`From $${x}`:""}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.5)">per session</div>
                </div>
              </div>

              ${p>0?`
              <div style="display:flex;align-items:center;gap:6px;margin-top:12px">
                <span style="color:#f59e0b;font-size:16px">${"★".repeat(Math.round(parseFloat(n)))}${"☆".repeat(5-Math.round(parseFloat(n)))}</span>
                <span style="font-weight:700">${n}</span>
                <span style="color:rgba(255,255,255,0.5);font-size:13px">(${p} reviews)</span>
              </div>`:""}

              ${l?`<p style="margin-top:16px;color:rgba(255,255,255,0.8);line-height:1.6;font-size:15px">${l}</p>`:""}
            </div>
          </div>

          <!-- Certifications -->
          ${f.length>0?`
          <div style="background:rgba(10,10,10,0.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:20px;margin-bottom:16px">
            <h2 style="font-size:16px;font-weight:700;margin-bottom:14px">Certifications</h2>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${f.map(o=>`<span style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600">${o}</span>`).join("")}
            </div>
          </div>`:""}

          <!-- Packages -->
          ${a.length>0?`
          <div style="background:rgba(10,10,10,0.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:20px;margin-bottom:16px">
            <h2 style="font-size:16px;font-weight:700;margin-bottom:14px">Training Packages</h2>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${a.map(o=>`
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px">
                <div>
                  <div style="font-weight:700;font-size:15px">${o.name||o.title||"Package"}</div>
                  ${o.description?`<div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:2px">${o.description}</div>`:""}
                </div>
                <div style="font-size:18px;font-weight:800;color:#FF5C00;white-space:nowrap">${o.price?`$${o.price}`:""}</div>
              </div>`).join("")}
            </div>
          </div>`:""}

          <!-- CTA buttons -->
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
            ${g?`
            <a href="https://wa.me/${g.replace(/\D/g,"")}?text=Hi ${encodeURIComponent(e.full_name)}, I found your profile on ${r} and I'd like to book a session."
               target="_blank" rel="noopener"
               style="display:flex;align-items:center;justify-content:center;gap:10px;background:#25D366;color:#fff;padding:16px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Book via WhatsApp
            </a>`:""}
            ${c?`
            <a href="https://instagram.com/${c.replace("@","")}"
               target="_blank" rel="noopener"
               style="display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;padding:16px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              View on Instagram
            </a>`:""}
            <a href="/find"
               style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);padding:14px;border-radius:14px;text-decoration:none;font-weight:600;font-size:15px">
              ← Browse all trainers
            </a>
          </div>

          <!-- Powered by footer -->
          <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08)">
            <a href="/" style="color:rgba(255,255,255,0.3);text-decoration:none;font-size:13px">
              Powered by <strong style="color:rgba(255,255,255,0.5)">${r}</strong>
            </a>
          </div>
        </div>`}z();
