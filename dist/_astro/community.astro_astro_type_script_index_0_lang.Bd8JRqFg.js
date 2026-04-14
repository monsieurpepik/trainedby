const f="https://mezhtdbfyvkshpuplqqw.supabase.co",u="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NjA1NzcsImV4cCI6MjA2MDEzNjU3N30.YVkNmqTJBfzHFQbVmqYzpqKi_EJkBrHiOh-Lq2zFUGo";let o=[],l="all";async function g(){try{o=await(await fetch(`${f}/rest/v1/community_posts?select=*,trainers(name,reps_verified,city,avatar_url)&order=created_at.desc&limit=30`,{headers:{apikey:u,Authorization:`Bearer ${u}`}})).json(),Array.isArray(o)||(o=[]),c(o),h(o),$(o)}catch{m()}}function h(s){document.getElementById("post-count").textContent=s.length;const i=new Set(s.map(t=>t.trainer_id).filter(Boolean));document.getElementById("trainer-count").textContent=i.size;const a=s.reduce((t,e)=>t+(e.like_count||0),0);document.getElementById("like-count").textContent=a}function $(s){const i={};for(const e of s)e.trainer_id&&(i[e.trainer_id]||(i[e.trainer_id]={name:e.trainers?.name||"Trainer",posts:0,verified:e.trainers?.reps_verified}),i[e.trainer_id].posts++);const a=Object.entries(i).sort((e,n)=>n[1].posts-e[1].posts).slice(0,5),t=document.getElementById("top-contributors");if(a.length===0){t.innerHTML='<p style="color:var(--text-faint);font-size:13px">No posts yet</p>';return}t.innerHTML=a.map(([e,n])=>`
    <div class="top-contributor">
      <div class="tc-avatar">${(n.name||"T").charAt(0).toUpperCase()}</div>
      <div class="tc-info">
        <div class="tc-name">${n.name}${n.verified?" ✓":""}</div>
        <div class="tc-posts">${n.posts} post${n.posts!==1?"s":""}</div>
      </div>
    </div>
  `).join("")}function m(){document.getElementById("posts-feed").innerHTML=`
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <h3>No posts yet</h3>
      <p>Be the first to share a training tip, transformation, or insight with the community.</p>
    </div>
  `}function c(s){const i=document.getElementById("posts-feed");if(!s||s.length===0){m();return}const a=l==="all"?s:s.filter(t=>t.category===l);if(a.length===0){i.innerHTML='<div class="empty-state"><h3>No posts in this category yet</h3><p>Be the first to post here.</p></div>';return}i.innerHTML=a.map(t=>{const e=t.trainers||{},n=(e.name||"T").split(" ").map(r=>r[0]).join("").substring(0,2).toUpperCase(),v=y(t.created_at),d=(t.tags||[]).slice(0,4),p={tip:"Training Tip",transformation:"Transformation",nutrition:"Nutrition",business:"Business",mindset:"Mindset",other:"Community"}[t.category]||"Post";return t.category==="transformation"?`
        <div class="transformation-card" data-id="${t.id}">
          <div class="transformation-header">
            <div class="post-avatar">${e.avatar_url?`<img src="${e.avatar_url}" alt="${e.name}">`:n}</div>
            <div class="post-author-info">
              <div class="post-author-name">${e.name||"Trainer"}${e.reps_verified?'<span class="post-verified"><svg viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3"/></svg></span>':""}</div>
              <div class="post-meta">${e.city||""} · ${v}</div>
            </div>
            <span class="transformation-badge">Transformation</span>
          </div>
          <div class="post-body">
            <div class="post-title">${t.title||""}</div>
            <div class="post-excerpt">${(t.content||"").substring(0,200)}${(t.content||"").length>200?"...":""}</div>
            ${t.stats?`
              <div class="transformation-stats" style="margin-top:14px">
                ${t.stats.duration?`<div class="transformation-stat"><strong>${t.stats.duration}</strong><span>Duration</span></div>`:""}
                ${t.stats.weight_lost?`<div class="transformation-stat"><strong>${t.stats.weight_lost}</strong><span>Lost</span></div>`:""}
                ${t.stats.muscle_gained?`<div class="transformation-stat"><strong>${t.stats.muscle_gained}</strong><span>Gained</span></div>`:""}
              </div>
            `:""}
          </div>
          <div class="post-footer">
            <button class="post-action ${t.user_liked?"liked":""}" onclick="likePost('${t.id}', this)">
              <svg viewBox="0 0 24 24" fill="${t.user_liked?"currentColor":"none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              ${t.like_count||0}
            </button>
            <button class="post-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              ${t.comment_count||0}
            </button>
            ${d.map(r=>`<span class="post-tag">#${r}</span>`).join("")}
          </div>
        </div>
      `:`
      <div class="post-card" data-id="${t.id}">
        <div class="post-header">
          <div class="post-avatar">${e.avatar_url?`<img src="${e.avatar_url}" alt="${e.name}">`:n}</div>
          <div class="post-author-info">
            <div class="post-author-name">${e.name||"Trainer"}${e.reps_verified?'<span class="post-verified"><svg viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3"/></svg></span>':""}</div>
            <div class="post-meta">${e.city||""} · ${v}</div>
          </div>
          <span class="post-category">${p}</span>
        </div>
        <div class="post-body">
          <div class="post-title">${t.title||""}</div>
          <div class="post-excerpt">${(t.content||"").substring(0,280)}${(t.content||"").length>280?"...":""}</div>
          ${d.length>0?`<div class="post-tags">${d.map(r=>`<span class="post-tag">#${r}</span>`).join("")}</div>`:""}
        </div>
        <div class="post-footer">
          <button class="post-action ${t.user_liked?"liked":""}" onclick="likePost('${t.id}', this)">
            <svg viewBox="0 0 24 24" fill="${t.user_liked?"currentColor":"none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            ${t.like_count||0}
          </button>
          <button class="post-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            ${t.comment_count||0}
          </button>
          <a class="post-read-more" href="#">Read more →</a>
        </div>
      </div>
    `}).join("")}function y(s){const i=Date.now()-new Date(s).getTime(),a=Math.floor(i/6e4);if(a<60)return`${a}m ago`;const t=Math.floor(a/60);if(t<24)return`${t}h ago`;const e=Math.floor(t/24);return e<7?`${e}d ago`:new Date(s).toLocaleDateString("en-AE",{day:"numeric",month:"short"})}document.querySelectorAll(".filter-btn").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(i=>i.classList.remove("active")),s.classList.add("active"),l=s.dataset.cat,c(o)})});document.getElementById("search-input").addEventListener("input",s=>{const i=s.target.value.toLowerCase();if(!i){c(o);return}const a=o.filter(t=>(t.title||"").toLowerCase().includes(i)||(t.content||"").toLowerCase().includes(i)||(t.tags||[]).some(e=>e.toLowerCase().includes(i)));c(a)});function _(){document.getElementById("post-modal").classList.remove("open")}document.getElementById("post-modal").addEventListener("click",s=>{s.target===s.currentTarget&&_()});g();
