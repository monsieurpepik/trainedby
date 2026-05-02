/* empty css               */
import { c as createComponent } from './astro-component_DiJ9uz96.mjs';
import { h as renderComponent, r as renderTemplate, l as defineScriptVars, f as addAttribute, k as Fragment, m as maybeRenderHead } from './ssr-function_D_8GPgmW.mjs';
import { g as getLocale, $ as $$Base, t } from './Base_X9W0huPu.mjs';
import { g as getMarket } from './market_CY7-kFE1.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Join = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Join;
  const market = getMarket(Astro2.url.hostname);
  const locale = getLocale(Astro2.request);
  const DEMO_SLUGS = {
    "en-ae": "sarah-al-mansoori",
    "en-uk": "james-hartley",
    "en-us": "marcus-johnson",
    "en-in": "arjun-sharma",
    "es": "lucia-fernandez",
    "fr": "thomas-moreau",
    "it": "giulia-romano"
  };
  const demoSlug = DEMO_SLUGS[locale] ?? "sarah-al-mansoori";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${market.brandName} – Link-in-Bio & Booking Hub for Fitness Trainers`, "description": `Create your verified personal trainer profile on ${market.brandName}. ${market.certificationBody} verified. Free to set up in 2 minutes.`, "data-astro-cid-jtzn4zcc": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<div class="join-wrap" data-astro-cid-jtzn4zcc> <!-- Header --> <div class="join-header" data-astro-cid-jtzn4zcc> <a href="/" class="join-logo" data-astro-cid-jtzn4zcc> <svg width="28" height="28" viewBox="0 0 32 32" data-astro-cid-jtzn4zcc><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-jtzn4zcc></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-jtzn4zcc>TB</text></svg> <span data-brand-name data-astro-cid-jtzn4zcc>TrainedBy</span> </a> <a href="/edit" class="join-login-link" data-astro-cid-jtzn4zcc><span data-i18n="join.already" data-astro-cid-jtzn4zcc>Already a member?</span> <span data-i18n="join.login" data-astro-cid-jtzn4zcc>Sign in</span></a> </div> <!-- Progress --> <div class="progress-bar" data-astro-cid-jtzn4zcc> <div class="progress-fill" id="progress-fill" style="width:10%" data-astro-cid-jtzn4zcc></div> </div> <!-- Step indicator --> <div class="step-indicator" id="step-indicator" data-astro-cid-jtzn4zcc> <div class="step-dot active" id="dot-1" data-astro-cid-jtzn4zcc>1</div> <div class="step-line" id="line-1" data-astro-cid-jtzn4zcc></div> <div class="step-dot inactive" id="dot-2" data-astro-cid-jtzn4zcc>2</div> <div class="step-line" id="line-2" data-astro-cid-jtzn4zcc></div> <div class="step-dot inactive" id="dot-3" data-astro-cid-jtzn4zcc>3</div> </div> <!-- ===== STEP 1: Essentials ===== --> <div id="step-1" data-astro-cid-jtzn4zcc> <h1 class="step-title" data-astro-cid-jtzn4zcc>', '</h1> <p class="step-subtitle" data-astro-cid-jtzn4zcc>', '</p> <!-- Auto-Build from Instagram --> <div style="background:linear-gradient(135deg,rgba(255,92,0,0.07),rgba(255,92,0,0.02));border:1px solid rgba(255,92,0,0.2);border-radius:14px;padding:14px 16px;margin-bottom:20px;" data-astro-cid-jtzn4zcc> <div style="font-size:12px;font-weight:700;color:var(--brand);letter-spacing:0.04em;text-transform:uppercase;margin-bottom:6px;" data-astro-cid-jtzn4zcc>', '</div> <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px;line-height:1.5;" data-astro-cid-jtzn4zcc>', `</div> <div style="display:flex;gap:8px;" data-astro-cid-jtzn4zcc> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;overflow:hidden;flex:1;" data-astro-cid-jtzn4zcc> <span style="padding:10px 0 10px 12px;color:var(--text-faint);font-size:14px;" data-astro-cid-jtzn4zcc>@</span> <input type="text" id="ig-autobuild" placeholder="yourhandle" autocomplete="off" style="background:transparent;border:none;outline:none;padding:10px 12px 10px 4px;color:var(--text);font-size:14px;width:100%;font-family:'Inter',sans-serif;" data-astro-cid-jtzn4zcc> </div> <button onclick="autoBuildFromIG()" id="autobuild-btn" style="background:var(--brand);color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:'Inter',sans-serif;" data-astro-cid-jtzn4zcc>`, '</button> </div> <div id="autobuild-status" style="font-size:11px;color:var(--text-faint);margin-top:6px;" data-astro-cid-jtzn4zcc></div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-i18n="join.name_label" data-astro-cid-jtzn4zcc>Full Name <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <input type="text" id="s1-name" placeholder="e.g. Sarah Al Mansoori" autocomplete="name" data-astro-cid-jtzn4zcc> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', ' <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <div class="slug-field" id="slug-field-wrap" data-astro-cid-jtzn4zcc> <span class="slug-prefix" id="slug-prefix" data-astro-cid-jtzn4zcc>loading.../</span> <input type="text" id="s1-slug" placeholder="sarah" autocomplete="off" oninput="checkSlug(this.value)" data-astro-cid-jtzn4zcc> <span class="slug-status" id="slug-status" data-astro-cid-jtzn4zcc></span> </div> <div class="field-hint" data-astro-cid-jtzn4zcc>', '</div> <div class="field-error hidden" id="slug-error" data-astro-cid-jtzn4zcc></div> </div> <div class="field-row" data-astro-cid-jtzn4zcc> <div class="field" style="margin-bottom:0" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Email <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <input type="email" id="s1-email" placeholder="you@email.com" autocomplete="email" data-astro-cid-jtzn4zcc> </div> <div class="field" style="margin-bottom:0" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>WhatsApp <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <div class="phone-field" id="wa-field-wrap" data-astro-cid-jtzn4zcc> <span class="phone-prefix" id="phone-prefix-display" data-astro-cid-jtzn4zcc>', `</span> <input type="tel" id="s1-phone" placeholder="50 123 4567" inputmode="tel" autocomplete="tel" onfocus="document.getElementById('wa-field-wrap').style.borderColor='var(--brand)'" onblur="document.getElementById('wa-field-wrap').style.borderColor='var(--border)'" data-astro-cid-jtzn4zcc> </div> </div> </div> <div class="field-hint" style="margin-bottom:16px;" data-astro-cid-jtzn4zcc>`, '</div> <!-- REPs section --> <div class="reps-card" data-astro-cid-jtzn4zcc> <div class="reps-card-icon" data-astro-cid-jtzn4zcc> <svg width="20" height="20" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-jtzn4zcc><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z" data-astro-cid-jtzn4zcc></path></svg> </div> <div data-astro-cid-jtzn4zcc> <div class="reps-card-title" data-astro-cid-jtzn4zcc>', ' Verified Badge</div> <div class="reps-card-sub" data-astro-cid-jtzn4zcc>', '</div> </div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', ' <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <input type="text" id="s1-reps"', ` autocomplete="off" style="font-family:'Manrope',sans-serif;font-weight:700;font-size:16px;letter-spacing:0.05em;" data-astro-cid-jtzn4zcc> <div class="field-hint" id="cert-hint" data-astro-cid-jtzn4zcc> `, ' </div> </div> <div class="field-error hidden" id="s1-error" data-astro-cid-jtzn4zcc></div> <button class="btn-primary" id="s1-btn" onclick="step1Next()" data-astro-cid-jtzn4zcc>\nContinue →\n</button> <div class="trust-row" data-astro-cid-jtzn4zcc> <div class="trust-item" data-astro-cid-jtzn4zcc> <svg width="13" height="13" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-jtzn4zcc><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z" data-astro-cid-jtzn4zcc></path></svg> ', ' </div> <div class="trust-item" data-astro-cid-jtzn4zcc> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" data-astro-cid-jtzn4zcc><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-jtzn4zcc></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-jtzn4zcc></path></svg> ', ' </div> <div class="trust-item" data-astro-cid-jtzn4zcc> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" data-astro-cid-jtzn4zcc><circle cx="12" cy="12" r="10" data-astro-cid-jtzn4zcc></circle><polyline points="12 6 12 12 16 14" data-astro-cid-jtzn4zcc></polyline></svg> ', ' </div> </div> <p style="text-align:center;margin-top:20px;font-size:12px;color:rgba(255,255,255,0.35)" data-astro-cid-jtzn4zcc>\nWondering what your profile will look like?\n<a', ' style="color:rgba(255,255,255,0.55);text-decoration:underline;text-underline-offset:3px" target="_blank" rel="noopener" data-astro-cid-jtzn4zcc>See an example</a> </p> </div> <!-- ===== STEP 2: Specialties + OTP ===== --> <div id="step-2" class="hidden" data-astro-cid-jtzn4zcc> <h1 class="step-title" data-astro-cid-jtzn4zcc>', '</h1> <p class="step-subtitle" data-astro-cid-jtzn4zcc>', '</p> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', ` <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <div class="toggle-row" id="spec-toggle-row" data-astro-cid-jtzn4zcc> <div class="toggle-pill" onclick="toggleSpec(this,'Strength')" data-astro-cid-jtzn4zcc>Strength</div> <div class="toggle-pill" onclick="toggleSpec(this,'Fat Loss')" data-astro-cid-jtzn4zcc>Fat Loss</div> <div class="toggle-pill" onclick="toggleSpec(this,'Muscle Gain')" data-astro-cid-jtzn4zcc>Muscle Gain</div> <div class="toggle-pill" onclick="toggleSpec(this,'HIIT')" data-astro-cid-jtzn4zcc>HIIT</div> <div class="toggle-pill" onclick="toggleSpec(this,'Cardio')" data-astro-cid-jtzn4zcc>Cardio</div> <div class="toggle-pill" onclick="toggleSpec(this,'Yoga')" data-astro-cid-jtzn4zcc>Yoga</div> <div class="toggle-pill" onclick="toggleSpec(this,'Pilates')" data-astro-cid-jtzn4zcc>Pilates</div> <div class="toggle-pill" onclick="toggleSpec(this,'CrossFit')" data-astro-cid-jtzn4zcc>CrossFit</div> <div class="toggle-pill" onclick="toggleSpec(this,'Boxing')" data-astro-cid-jtzn4zcc>Boxing</div> <div class="toggle-pill" onclick="toggleSpec(this,'Nutrition')" data-astro-cid-jtzn4zcc>Nutrition</div> <div class="toggle-pill" onclick="toggleSpec(this,'Rehabilitation')" data-astro-cid-jtzn4zcc>Rehabilitation</div> <div class="toggle-pill" onclick="toggleSpec(this,'Sport Specific')" data-astro-cid-jtzn4zcc>Sport Specific</div> <div class="toggle-pill" onclick="toggleSpec(this,'Pre/Post Natal')" data-astro-cid-jtzn4zcc>Pre/Post Natal</div> <div class="toggle-pill" onclick="toggleSpec(this,'Seniors')" data-astro-cid-jtzn4zcc>Seniors</div> </div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>`, ' <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <input type="text" id="s2-title" placeholder="e.g. Strength & Conditioning Coach" maxlength="60" data-astro-cid-jtzn4zcc> <div class="field-hint" data-astro-cid-jtzn4zcc>', '</div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', `</label> <div class="toggle-row" data-astro-cid-jtzn4zcc> <div class="toggle-pill active" id="mode-in-person" onclick="toggleMode(this,'in-person')" data-astro-cid-jtzn4zcc>`, `</div> <div class="toggle-pill" id="mode-online" onclick="toggleMode(this,'online')" data-astro-cid-jtzn4zcc>`, `</div> <div class="toggle-pill" id="mode-hybrid" onclick="toggleMode(this,'hybrid')" data-astro-cid-jtzn4zcc>`, '</div> </div> </div> <div class="divider" data-astro-cid-jtzn4zcc><span class="divider-text" data-astro-cid-jtzn4zcc>', '</span></div> <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.6;" data-astro-cid-jtzn4zcc> ', ' <strong id="email-display" style="color:var(--text);" data-astro-cid-jtzn4zcc></strong> </p> <div class="otp-row" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-0" oninput="otpInput(this,0)" onkeydown="otpKeydown(event,0)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-1" oninput="otpInput(this,1)" onkeydown="otpKeydown(event,1)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-2" oninput="otpInput(this,2)" onkeydown="otpKeydown(event,2)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-3" oninput="otpInput(this,3)" onkeydown="otpKeydown(event,3)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-4" oninput="otpInput(this,4)" onkeydown="otpKeydown(event,4)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-5" oninput="otpInput(this,5)" onkeydown="otpKeydown(event,5)" data-astro-cid-jtzn4zcc> </div> <div class="field-error hidden" id="s2-error" style="text-align:center;margin-bottom:12px;" data-astro-cid-jtzn4zcc></div> <!-- Consent checkbox - required before account creation (GDPR / CCPA / PDPL) --> <label id="consent-label" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;cursor:pointer;font-size:13px;color:var(--text-muted);line-height:1.5;" data-astro-cid-jtzn4zcc> <input type="checkbox" id="consent-checkbox" style="margin-top:2px;accent-color:var(--brand);width:16px;height:16px;flex-shrink:0;" data-astro-cid-jtzn4zcc> <span data-astro-cid-jtzn4zcc>I agree to the <a href="/terms" target="_blank" style="color:var(--brand);text-decoration:underline;" data-astro-cid-jtzn4zcc>Terms of Service</a> and <a href="/privacy" target="_blank" style="color:var(--brand);text-decoration:underline;" data-astro-cid-jtzn4zcc>Privacy Policy</a>. I confirm my certification details are genuine and accurate.</span> </label> <button class="btn-primary" id="verify-btn" onclick="verifyAndCreate()" data-astro-cid-jtzn4zcc> ', ' </button> <button class="btn-secondary" onclick="resendCode()" id="resend-btn" data-astro-cid-jtzn4zcc>', '</button> <button class="btn-ghost" onclick="showStep(1)" data-astro-cid-jtzn4zcc>', '</button> <p style="text-align:center;font-size:11px;color:var(--text-faint);margin-top:8px;" data-astro-cid-jtzn4zcc>', `</p> </div> <!-- ===== STEP 3: Profile & Packages ===== --> <div id="step-3" class="hidden" data-astro-cid-jtzn4zcc> <h1 class="step-title" data-astro-cid-jtzn4zcc>Complete your profile</h1> <p class="step-subtitle" data-astro-cid-jtzn4zcc>Add a photo, bio, and your training packages so clients know what to expect.</p> <!-- Profile Photo --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Profile Photo <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <div id="avatar-upload-area" onclick="document.getElementById('avatar-file-input').click()" style="width:96px;height:96px;border-radius:50%;border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;color:var(--text-muted);gap:4px;font-size:11px;transition:border-color 0.15s;" data-astro-cid-jtzn4zcc> <img id="avatar-preview-img" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Avatar preview" data-astro-cid-jtzn4zcc> <span id="avatar-upload-placeholder" data-astro-cid-jtzn4zcc> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-jtzn4zcc><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-astro-cid-jtzn4zcc></path><circle cx="12" cy="7" r="4" data-astro-cid-jtzn4zcc></circle></svg> </span> <span id="avatar-upload-label" style="font-size:10px;color:var(--text-faint);" data-astro-cid-jtzn4zcc>Upload</span> </div> <input type="file" id="avatar-file-input" accept="image/*" style="display:none;" onchange="handleAvatarFileChange(event)" data-astro-cid-jtzn4zcc> </div> <!-- Bio --> <div class="field" data-astro-cid-jtzn4zcc> <label style="display:flex;justify-content:space-between;align-items:center;" data-astro-cid-jtzn4zcc>
Bio <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;font-size:11px;" id="bio-char-count" data-astro-cid-jtzn4zcc>0 / 500</span> </label> <textarea id="s3-bio" rows="4" maxlength="500" placeholder="Tell clients about your training style and what results they can expect..." oninput="updateBioCharCount()" style="width:100%;padding:14px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'Inter',sans-serif;font-size:15px;outline:none;resize:vertical;transition:border-color 0.2s;box-sizing:border-box;" data-astro-cid-jtzn4zcc></textarea> <button id="ai-bio-btn" onclick="generateAIBio()" style="display:flex;align-items:center;gap:6px;padding:7px 14px;background:transparent;border:1px solid var(--brand);color:var(--brand);border-radius:8px;font-size:12px;cursor:pointer;margin-top:8px;transition:background 0.15s;" data-astro-cid-jtzn4zcc> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-jtzn4zcc><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" data-astro-cid-jtzn4zcc></path></svg>
Write bio with AI
</button> <p id="ai-bio-error" class="hidden" style="color:var(--danger,#ef4444);font-size:13px;margin-top:4px;" data-astro-cid-jtzn4zcc></p> </div> <!-- Instagram --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Instagram <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.2s;" onfocusin="this.style.borderColor='var(--brand)'" onfocusout="this.style.borderColor='var(--border)'" data-astro-cid-jtzn4zcc> <span style="padding:14px 0 14px 16px;color:var(--text-faint);font-size:15px;" data-astro-cid-jtzn4zcc>@</span> <input type="text" id="s3-instagram" placeholder="yourhandle" autocomplete="off" style="border:none;background:transparent;padding:14px 16px 14px 4px;font-size:15px;flex:1;min-width:0;color:var(--text);outline:none;font-family:'Inter',sans-serif;" data-astro-cid-jtzn4zcc> </div> </div> <!-- Packages --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Training Packages <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <div id="packages-list" data-astro-cid-jtzn4zcc></div> <button onclick="addPackageRow()" style="width:100%;padding:10px;background:transparent;border:1px dashed var(--border);color:var(--text-muted);border-radius:10px;font-size:13px;cursor:pointer;margin-top:4px;" data-astro-cid-jtzn4zcc>
+ Add package
</button> </div> <!-- Availability --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Availability <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <input type="text" id="s3-availability" placeholder="e.g. Weekday mornings, flexible schedule" style="width:100%;padding:14px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'Inter',sans-serif;font-size:15px;outline:none;transition:border-color 0.2s;box-sizing:border-box;" data-astro-cid-jtzn4zcc> </div> <div class="field-error hidden" id="s3-error" data-astro-cid-jtzn4zcc></div> <button class="btn-primary" id="s3-btn" onclick="completeStep3()" data-astro-cid-jtzn4zcc>Finish — Go Live 🚀</button> <button class="btn-ghost" onclick="showStep(2)" data-astro-cid-jtzn4zcc>← Back</button> </div> <!-- ===== SUCCESS ===== --> <div id="step-success" class="hidden" data-astro-cid-jtzn4zcc> <div class="success-screen" data-astro-cid-jtzn4zcc> <div class="success-icon" data-astro-cid-jtzn4zcc> <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--brand)" data-astro-cid-jtzn4zcc><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-jtzn4zcc></path></svg> </div> <h1 class="success-title" data-astro-cid-jtzn4zcc>`, '</h1> <p class="success-sub" data-astro-cid-jtzn4zcc>', '</p> <div class="url-card" data-astro-cid-jtzn4zcc> <span class="url-card-text" id="success-url" data-astro-cid-jtzn4zcc>...</span> <button class="url-copy-btn" onclick="copyProfileUrl()" id="copy-btn" data-astro-cid-jtzn4zcc>', '</button> </div> <a id="view-profile-btn" href="#" class="btn-primary" style="display:flex;text-align:center;text-decoration:none;margin-bottom:12px;" data-astro-cid-jtzn4zcc>', '</a> <a href="/dashboard" class="btn-secondary" style="display:flex;text-align:center;text-decoration:none;justify-content:center;" data-astro-cid-jtzn4zcc>', '</a> <div class="next-steps" data-astro-cid-jtzn4zcc> <div class="next-steps-title" data-astro-cid-jtzn4zcc>', '</div> <div class="next-step-item" data-astro-cid-jtzn4zcc> <div class="next-step-num" data-astro-cid-jtzn4zcc>1</div> <div data-astro-cid-jtzn4zcc>', '</div> </div> <div class="next-step-item" data-astro-cid-jtzn4zcc> <div class="next-step-num" data-astro-cid-jtzn4zcc>2</div> <div data-astro-cid-jtzn4zcc>', '</div> </div> <div class="next-step-item" data-astro-cid-jtzn4zcc> <div class="next-step-num" data-astro-cid-jtzn4zcc>3</div> <div data-astro-cid-jtzn4zcc>', '</div> </div> </div> </div> </div> </div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>(function(){', `
window.__MARKET__ = __MARKET_KEY__;
})();<\/script> <script>
// ===== CONFIG =====
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';

// ── Funnel tracking ───────────────────────────────────────────────────────────────
const SESSION_ID = crypto.randomUUID();
const UTM_SOURCE = new URLSearchParams(location.search).get('utm_source') || '';
const UTM_MEDIUM = new URLSearchParams(location.search).get('utm_medium') || '';
const REFERRER = document.referrer || '';
const REF_SLUG = (new URLSearchParams(location.search).get('ref') || '').slice(0, 80);

function trackEvent(event_name, metadata) {
  fetch(EDGE_BASE + '/growth-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
    body: JSON.stringify(Object.assign({
      action: 'track',
      event: event_name,
      session_id: SESSION_ID,
      utm_source: UTM_SOURCE,
      utm_medium: UTM_MEDIUM,
      referrer: REFERRER
    }, metadata || {}))
  }).catch(function() {}); // Non-fatal
}

// Track landing view immediately
trackEvent('join_landing_view');

// Set domain-aware slug prefix
(function() {
  const el = document.getElementById('slug-prefix');
  if (el) el.textContent = window.location.hostname + '/';
})();

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== STATE =====
const state = {
  name: '', slug: '', email: '', phone: '',
  reps_number: '',
  specialties: [], title: '',
  training_modes: ['in-person'],
  trainer_id: null
};

// ===== DRAFT (localStorage auto-save) =====
const DRAFT_KEY = 'tb_join_draft';
function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      name: state.name, slug: state.slug, email: state.email,
      phone: state.phone, reps_number: state.reps_number,
      specialties: state.specialties, title: state.title,
      training_modes: state.training_modes, trainer_id: state.trainer_id,
      bio: document.getElementById('s3-bio')?.value || '',
      instagram: document.getElementById('s3-instagram')?.value || '',
      availability: document.getElementById('s3-availability')?.value || '',
    }));
  } catch(_) {}
}
async function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.name) { state.name = d.name; const el = document.getElementById('s1-name'); if (el) el.value = d.name; }
    if (d.slug) { state.slug = d.slug; const el = document.getElementById('s1-slug'); if (el) el.value = d.slug; }
    if (d.email) { state.email = d.email; const el = document.getElementById('s1-email'); if (el) el.value = d.email; }
    if (d.phone) { state.phone = d.phone; const el = document.getElementById('s1-phone'); if (el) el.value = d.phone; }
    if (d.reps_number) { state.reps_number = d.reps_number; const el = document.getElementById('s1-reps'); if (el) el.value = d.reps_number; }
    if (d.bio) { const el = document.getElementById('s3-bio'); if (el) { el.value = d.bio; updateBioCharCount(); } }
    if (d.instagram) { const el = document.getElementById('s3-instagram'); if (el) el.value = d.instagram; }
    if (d.availability) { const el = document.getElementById('s3-availability'); if (el) el.value = d.availability; }
    if (Array.isArray(d.specialties)) state.specialties = d.specialties;
    if (d.title) state.title = d.title;
    if (Array.isArray(d.training_modes)) state.training_modes = d.training_modes;
    // If account was already created, resume at step 3
    if (d.trainer_id) {
      const { data: sessionData } = await sb.auth.getSession();
      if (sessionData?.session) {
        state.trainer_id = d.trainer_id;
        showStep(3);
      } else {
        // Stale draft from a different session — clear it
        clearDraft();
      }
    }
  } catch(_) {}
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch(_) {}
}

// ===== PROGRESS =====
function setProgress(pct) {
  document.getElementById('progress-fill').style.width = pct + '%';
}

function showStep(n) {
  ['1','2','3','success'].forEach(s => {
    const el = document.getElementById('step-' + s);
    if (el) el.classList.add('hidden');
  });
  document.getElementById('step-' + n).classList.remove('hidden');
  // Update step indicator dots
  if (n === 1) {
    document.getElementById('dot-1').className = 'step-dot active';
    document.getElementById('dot-2').className = 'step-dot inactive';
    document.getElementById('line-1').className = 'step-line';
    document.getElementById('step-indicator').style.display = 'flex';
    setProgress(10);
  } else if (n === 2) {
    document.getElementById('dot-1').className = 'step-dot done';
    document.getElementById('dot-1').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    document.getElementById('dot-2').className = 'step-dot active';
    document.getElementById('line-1').className = 'step-line done';
    document.getElementById('step-indicator').style.display = 'flex';
    setProgress(60);
  } else if (n === 3) {
    document.getElementById('dot-1').className = 'step-dot done';
    document.getElementById('dot-1').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    document.getElementById('dot-2').className = 'step-dot done';
    document.getElementById('dot-2').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    document.getElementById('dot-3').className = 'step-dot active';
    document.getElementById('dot-3').innerHTML = '3';
    document.getElementById('line-1').className = 'step-line done';
    document.getElementById('line-2').className = 'step-line done';
    document.getElementById('step-indicator').style.display = 'flex';
    setProgress(80);
  } else if (n === 'success') {
    document.getElementById('step-indicator').style.display = 'none';
    setProgress(100);
    trackEvent('join_signup_complete', { trainer_id: state.trainer_id, has_reps: !!state.reps_number });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== AUTO-BUILD FROM INSTAGRAM =====
async function autoBuildFromIG() {
  const handle = document.getElementById('ig-autobuild').value.trim().replace('@','');
  if (!handle) return;
  const btn = document.getElementById('autobuild-btn');
  const status = document.getElementById('autobuild-status');
  btn.disabled = true;
  btn.textContent = '...';
  status.textContent = 'Looking up your profile...';
  status.style.color = 'rgba(255,255,255,0.4)';
  try {
    // Use OpenAI to generate a profile stub from the Instagram handle
    // In production this would call a Supabase edge function that scrapes the public IG bio
    // For now, we pre-fill with smart defaults based on the handle
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9._]/g,'');
    const guessedName = cleanHandle
      .replace(/[._]/g,' ')
      .replace(/\\b\\w/g, c => c.toUpperCase())
      .trim();
    const guessedSlug = cleanHandle.replace(/[._]/g,'-').replace(/[^a-z0-9-]/g,'');
    // Pre-fill the form
    const nameEl = document.getElementById('s1-name');
    const slugEl = document.getElementById('s1-slug');
    if (!nameEl.value) nameEl.value = guessedName;
    if (!slugEl.value) {
      slugEl.value = guessedSlug.substring(0,30);
      checkSlug(slugEl.value);
    }
    // Store Instagram handle in state for later
    state.instagram = '@' + handle;
    status.textContent = '\\u2713 Pre-filled from @' + handle + ' - review and adjust below';
    status.style.color = '#00C853';
  } catch(e) {
    status.textContent = 'Could not fetch profile. Fill in manually below.';
    status.style.color = '#ff5555';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Fill \\u2192';
  }
}

// ===== SLUG CHECK =====
let slugCheckTimer = null;
let slugValid = false;
function checkSlug(val) {
  const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
  document.getElementById('s1-slug').value = clean;
  const status = document.getElementById('slug-status');
  const errEl = document.getElementById('slug-error');
  slugValid = false;
  if (!clean || clean.length < 2) { status.innerHTML = ''; errEl.classList.add('hidden'); return; }
  clearTimeout(slugCheckTimer);
  status.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:12px;">...</span>';
  slugCheckTimer = setTimeout(async () => {
    try {
      const { data } = await sb.from('trainers').select('id').eq('slug', clean).maybeSingle();
      if (data) {
        status.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5555"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        errEl.textContent = 'This URL is taken. Try another.';
        errEl.classList.remove('hidden');
        slugValid = false;
      } else {
        status.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#00C853"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z"/></svg>';
        errEl.classList.add('hidden');
        slugValid = true;
      }
    } catch(e) { slugValid = true; status.innerHTML = ''; }
  }, 400);
}

// ===== Client-side sanitization (belt-and-suspenders; server also sanitizes) =====
function sanitizeInput(str) {
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'\`]/g, '').trim().slice(0, 500);
}

// ===== STEP 1 =====
async function step1Next() {
  const name = sanitizeInput(document.getElementById('s1-name').value.trim());
  const slug = document.getElementById('s1-slug').value.trim();
  const email = document.getElementById('s1-email').value.trim();
  const phone = document.getElementById('s1-phone').value.trim();
  const reps = document.getElementById('s1-reps').value.trim();
  const errEl = document.getElementById('s1-error');

  if (!name) { showErr(errEl, 'Please enter your full name.'); return; }
  if (!slug || slug.length < 2) { showErr(errEl, 'Please choose a profile URL (min 2 characters).'); return; }
  if (!email || !email.includes('@')) { showErr(errEl, 'Please enter a valid email address.'); return; }
  if (!phone) { showErr(errEl, 'Please enter your WhatsApp number.'); return; }

  errEl.classList.add('hidden');
  const btn = document.getElementById('s1-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending code...';

  try {
    // Send OTP via Supabase Auth
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;

    state.name = name;
    state.slug = slug;
    state.email = email;
    state.phone = phone.replace(/\\D/g,'');
    state.reps_number = reps;

    document.getElementById('email-display').textContent = email;
    trackEvent('join_step1_complete', { has_reps: !!reps });
    showStep(2);
  } catch(e) {
    showErr(errEl, e.message || 'Failed to send code. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Continue →';
  }
}

// ===== SPECIALTIES =====
function toggleSpec(el, val) {
  el.classList.toggle('active');
  if (el.classList.contains('active')) {
    if (!state.specialties.includes(val)) state.specialties.push(val);
  } else {
    state.specialties = state.specialties.filter(s => s !== val);
  }
}

// ===== TRAINING MODE =====
function toggleMode(el, val) {
  ['in-person','online','hybrid'].forEach(m => {
    const d = document.getElementById('mode-' + m);
    if (d) d.classList.remove('active');
  });
  el.classList.add('active');
  state.training_modes = [val];
}

// ===== OTP =====
function otpInput(el, idx) {
  const val = el.value.replace(/\\D/g,'');
  el.value = val;
  if (val && idx < 5) {
    document.getElementById('otp-' + (idx+1)).focus();
  }
  // Auto-verify when all 6 digits entered
  if (idx === 5 && val) {
    const code = Array.from({length:6}, (_,i) => document.getElementById('otp-'+i).value).join('');
    if (code.length === 6) verifyAndCreate();
  }
}

function otpKeydown(e, idx) {
  if (e.key === 'Backspace' && !e.target.value && idx > 0) {
    document.getElementById('otp-' + (idx-1)).focus();
  }
}

// ===== VERIFY & CREATE =====
async function verifyAndCreate() {
  const title = document.getElementById('s2-title').value.trim();
  const errEl = document.getElementById('s2-error');

  if (state.specialties.length === 0) { showErr(errEl, 'Please select at least one specialty.'); return; }
  if (!title) { showErr(errEl, 'Please enter your title/role.'); return; }

  // Consent validation - required for GDPR / CCPA / PDPL compliance
  const consentBox = document.getElementById('consent-checkbox');
  if (consentBox && !consentBox.checked) {
    showErr(errEl, 'Please agree to the Terms of Service and Privacy Policy to continue.');
    document.getElementById('consent-label')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const code = Array.from({length:6}, (_,i) => document.getElementById('otp-'+i).value).join('');
  if (code.length < 6) { showErr(errEl, 'Please enter the 6-digit code from your email.'); return; }

  errEl.classList.add('hidden');
  const btn = document.getElementById('verify-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating your profile...';

  state.title = title;

  try {
    // Verify OTP
    const { data: authData, error: authErr } = await sb.auth.verifyOtp({
      email: state.email,
      token: code,
      type: 'email'
    });
    if (authErr) throw authErr;

    const userId = authData?.user?.id;

    // Create trainer record
    const trainerPayload = {
      name: state.name,
      slug: state.slug,
      email: state.email,
      whatsapp: (document.getElementById('phone-prefix-display')?.textContent ?? '{market.phonePrefix}') + state.phone,
      reps_number: state.reps_number || null,
      verification_status: state.reps_number ? 'pending' : 'unverified',
      market: window.__MARKET__ || 'ae',
      specialties: state.specialties,
      title: state.title,
      training_modes: state.training_modes,
      plan: 'free',
      accepting_clients: true,
      referred_by_slug: REF_SLUG || null,
    };
    if (userId) trainerPayload.user_id = userId;

    const { data: trainer, error: trainerErr } = await sb
      .from('trainers')
      .insert(trainerPayload)
      .select()
      .single();

    if (trainerErr) {
      // Trainer might already exist - try to fetch
      const { data: existing } = await sb.from('trainers').select('*').eq('email', state.email).maybeSingle();
      if (!existing) throw trainerErr;
      state.trainer_id = existing.id;
    } else {
      state.trainer_id = trainer?.id;
    }

    // Success — proceed to step 3 for profile completion
    saveDraft();
    showStep(3);

  } catch(e) {
    showErr(errEl, e.message || 'Verification failed. Please check your code and try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Verify &amp; Go Live 🚀';
  }
}

// ===== RESEND =====
async function resendCode() {
  const btn = document.getElementById('resend-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  try {
    await sb.auth.signInWithOtp({ email: state.email, options: { shouldCreateUser: true } });
    btn.textContent = 'Code sent!';
    setTimeout(() => { btn.textContent = 'Resend Code'; btn.disabled = false; }, 3000);
  } catch(e) {
    btn.textContent = 'Resend Code';
    btn.disabled = false;
  }
}

// ===== COPY URL =====
function copyProfileUrl() {
  const url = 'https://' + document.getElementById('success-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.querySelector('.url-copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// ===== HELPERS =====
function showErr(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Pre-fill slug from name as user types
document.getElementById('s1-name').addEventListener('input', function() {
  const slugField = document.getElementById('s1-slug');
  if (!slugField.dataset.userEdited) {
    const auto = this.value.toLowerCase().replace(/\\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
    slugField.value = auto;
    if (auto.length >= 2) checkSlug(auto);
  }
});
document.getElementById('s1-slug').addEventListener('input', function() {
  this.dataset.userEdited = '1';
});
['s1-email', 's1-slug', 's1-phone', 's1-reps'].forEach(function(id) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', saveDraft);
});

// ===== STEP 3 FUNCTIONS =====
let _avatarBlob = null;

function handleAvatarFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  _avatarBlob = file;
  const url = URL.createObjectURL(file);
  const img = document.getElementById('avatar-preview-img');
  const placeholder = document.getElementById('avatar-upload-placeholder');
  const label = document.getElementById('avatar-upload-label');
  if (img) { img.src = url; img.style.display = 'block'; }
  if (placeholder) placeholder.style.display = 'none';
  if (label) label.style.display = 'none';
}

function updateBioCharCount() {
  const val = document.getElementById('s3-bio')?.value || '';
  const el = document.getElementById('bio-char-count');
  if (el) el.textContent = val.length + ' / 500';
  saveDraft();
}

async function generateAIBio() {
  const btn = document.getElementById('ai-bio-btn');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Generating...';
  const bioErrEl = document.getElementById('ai-bio-error');
  if (bioErrEl) bioErrEl.classList.add('hidden');
  try {
    const { data: sessionData } = await sb.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const res = await fetch(EDGE_BASE + '/ai-bio-writer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { 'Authorization': 'Bearer ' + jwt } : {})
      },
      body: JSON.stringify({
        name: state.name,
        specialties: state.specialties,
        title: state.title,
        market: window.__MARKET__ || 'ae'
      })
    });
    if (res.ok) {
      const { bio } = await res.json();
      if (bio) {
        const bioEl = document.getElementById('s3-bio');
        if (bioEl) { bioEl.value = bio; updateBioCharCount(); }
      } else {
        if (bioErrEl) { bioErrEl.textContent = 'Could not generate bio — please write your own.'; bioErrEl.classList.remove('hidden'); }
      }
    } else {
      if (bioErrEl) { bioErrEl.textContent = 'Could not generate bio — please write your own.'; bioErrEl.classList.remove('hidden'); }
    }
  } catch(_) {
    if (bioErrEl) { bioErrEl.textContent = 'Could not generate bio — please write your own.'; bioErrEl.classList.remove('hidden'); }
  }
  btn.disabled = false;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Write bio with AI';
}

let _packageCount = 0;
let _step3Submitting = false;
function addPackageRow() {
  const list = document.getElementById('packages-list');
  if (!list) return;
  const idx = _packageCount++;
  const div = document.createElement('div');
  div.id = 'pkg-row-' + idx;
  div.style.cssText = 'background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;';
  div.innerHTML = '<div style="margin-bottom:8px;"><input type="text" class="pkg-name" placeholder="e.g. 10-Pack, Monthly Plan" style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;font-family:Inter,sans-serif;box-sizing:border-box;" /></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
    + '<input type="number" class="pkg-price" min="0" step="1" placeholder="Price (e.g. 250)" style="padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;font-family:Inter,sans-serif;width:100%;box-sizing:border-box;" />'
    + '<select class="pkg-currency" style="padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;font-family:Inter,sans-serif;">'
    + '<option value="AED">AED</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="EUR">EUR</option>'
    + '</select></div>';
  list.appendChild(div);
}

function collectPackages() {
  return Array.from(document.querySelectorAll('#packages-list .pkg-name'))
    .map(function(nameEl, i) {
      const row = nameEl.closest('div[id^="pkg-row"]') || nameEl.parentElement.parentElement;
      return {
        name: nameEl.value.trim(),
        price: parseFloat(row.querySelector('.pkg-price')?.value) || 0,
        currency: row.querySelector('.pkg-currency')?.value || 'AED'
      };
    })
    .filter(function(p) { return p.name; });
}

async function completeStep3() {
  const errEl = document.getElementById('s3-error');
  if (errEl) errEl.classList.add('hidden');

  if (_step3Submitting) return;
  _step3Submitting = true;

  if (!state.trainer_id) {
    _step3Submitting = false;
    if (errEl) { errEl.textContent = 'Session error — please refresh'; errEl.classList.remove('hidden'); }
    return;
  }

  const btn = document.getElementById('s3-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving...'; }

  try {
    const updates = {};
    const bioVal = document.getElementById('s3-bio')?.value.trim();
    if (bioVal) updates.bio = bioVal;
    const igVal = document.getElementById('s3-instagram')?.value.trim().replace(/^@/, '');
    if (igVal) updates.instagram_handle = igVal;
    const avail = document.getElementById('s3-availability')?.value.trim();
    if (avail) updates.availability = avail;

    // Upload avatar if provided
    if (_avatarBlob) {
      const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
      if (!ALLOWED_TYPES[_avatarBlob.type]) {
        throw new Error('Avatar must be a JPEG, PNG, or WebP image.');
      }
      if (_avatarBlob.size > MAX_AVATAR_BYTES) {
        throw new Error('Avatar file must be under 5 MB.');
      }
      const ext = ALLOWED_TYPES[_avatarBlob.type];
      const path = 'trainers/' + state.trainer_id + '/avatar.' + ext;
      const { error: uploadErr } = await sb.storage.from('avatars').upload(path, _avatarBlob, { upsert: true, contentType: _avatarBlob.type });
      if (uploadErr) {
        if (errEl) { errEl.textContent = 'Photo upload failed: ' + uploadErr.message; errEl.classList.remove('hidden'); }
      } else {
        const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
        updates.avatar_url = urlData.publicUrl;
      }
    }

    if (Object.keys(updates).length) {
      await sb.from('trainers').update(updates).eq('id', state.trainer_id);
    }

    // Save packages
    const packages = collectPackages();
    if (packages.length) {
      await sb.from('session_packages').delete().eq('trainer_id', state.trainer_id);
      await sb.from('session_packages').insert(packages.map(function(p) {
        return Object.assign({}, p, { trainer_id: state.trainer_id });
      }));
    }

    clearDraft();
    // Show success screen
    const profileUrl = window.location.hostname + '/' + state.slug;
    const successUrl = document.getElementById('success-url');
    const viewBtn = document.getElementById('view-profile-btn');
    if (successUrl) successUrl.textContent = profileUrl;
    if (viewBtn) viewBtn.href = '/' + state.slug;
    trackEvent('join_signup_complete', { trainer_id: state.trainer_id });
    showStep('success');

  } catch(e) {
    _step3Submitting = false;
    if (errEl) { errEl.textContent = e.message || 'Something went wrong. Please try again.'; errEl.classList.remove('hidden'); }
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finish — Go Live 🚀'; }
  }
}

// Load any saved draft on page init
loadDraft();
<\/script> `], ["  ", '<div class="join-wrap" data-astro-cid-jtzn4zcc> <!-- Header --> <div class="join-header" data-astro-cid-jtzn4zcc> <a href="/" class="join-logo" data-astro-cid-jtzn4zcc> <svg width="28" height="28" viewBox="0 0 32 32" data-astro-cid-jtzn4zcc><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-jtzn4zcc></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-jtzn4zcc>TB</text></svg> <span data-brand-name data-astro-cid-jtzn4zcc>TrainedBy</span> </a> <a href="/edit" class="join-login-link" data-astro-cid-jtzn4zcc><span data-i18n="join.already" data-astro-cid-jtzn4zcc>Already a member?</span> <span data-i18n="join.login" data-astro-cid-jtzn4zcc>Sign in</span></a> </div> <!-- Progress --> <div class="progress-bar" data-astro-cid-jtzn4zcc> <div class="progress-fill" id="progress-fill" style="width:10%" data-astro-cid-jtzn4zcc></div> </div> <!-- Step indicator --> <div class="step-indicator" id="step-indicator" data-astro-cid-jtzn4zcc> <div class="step-dot active" id="dot-1" data-astro-cid-jtzn4zcc>1</div> <div class="step-line" id="line-1" data-astro-cid-jtzn4zcc></div> <div class="step-dot inactive" id="dot-2" data-astro-cid-jtzn4zcc>2</div> <div class="step-line" id="line-2" data-astro-cid-jtzn4zcc></div> <div class="step-dot inactive" id="dot-3" data-astro-cid-jtzn4zcc>3</div> </div> <!-- ===== STEP 1: Essentials ===== --> <div id="step-1" data-astro-cid-jtzn4zcc> <h1 class="step-title" data-astro-cid-jtzn4zcc>', '</h1> <p class="step-subtitle" data-astro-cid-jtzn4zcc>', '</p> <!-- Auto-Build from Instagram --> <div style="background:linear-gradient(135deg,rgba(255,92,0,0.07),rgba(255,92,0,0.02));border:1px solid rgba(255,92,0,0.2);border-radius:14px;padding:14px 16px;margin-bottom:20px;" data-astro-cid-jtzn4zcc> <div style="font-size:12px;font-weight:700;color:var(--brand);letter-spacing:0.04em;text-transform:uppercase;margin-bottom:6px;" data-astro-cid-jtzn4zcc>', '</div> <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px;line-height:1.5;" data-astro-cid-jtzn4zcc>', `</div> <div style="display:flex;gap:8px;" data-astro-cid-jtzn4zcc> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;overflow:hidden;flex:1;" data-astro-cid-jtzn4zcc> <span style="padding:10px 0 10px 12px;color:var(--text-faint);font-size:14px;" data-astro-cid-jtzn4zcc>@</span> <input type="text" id="ig-autobuild" placeholder="yourhandle" autocomplete="off" style="background:transparent;border:none;outline:none;padding:10px 12px 10px 4px;color:var(--text);font-size:14px;width:100%;font-family:'Inter',sans-serif;" data-astro-cid-jtzn4zcc> </div> <button onclick="autoBuildFromIG()" id="autobuild-btn" style="background:var(--brand);color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:'Inter',sans-serif;" data-astro-cid-jtzn4zcc>`, '</button> </div> <div id="autobuild-status" style="font-size:11px;color:var(--text-faint);margin-top:6px;" data-astro-cid-jtzn4zcc></div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-i18n="join.name_label" data-astro-cid-jtzn4zcc>Full Name <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <input type="text" id="s1-name" placeholder="e.g. Sarah Al Mansoori" autocomplete="name" data-astro-cid-jtzn4zcc> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', ' <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <div class="slug-field" id="slug-field-wrap" data-astro-cid-jtzn4zcc> <span class="slug-prefix" id="slug-prefix" data-astro-cid-jtzn4zcc>loading.../</span> <input type="text" id="s1-slug" placeholder="sarah" autocomplete="off" oninput="checkSlug(this.value)" data-astro-cid-jtzn4zcc> <span class="slug-status" id="slug-status" data-astro-cid-jtzn4zcc></span> </div> <div class="field-hint" data-astro-cid-jtzn4zcc>', '</div> <div class="field-error hidden" id="slug-error" data-astro-cid-jtzn4zcc></div> </div> <div class="field-row" data-astro-cid-jtzn4zcc> <div class="field" style="margin-bottom:0" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Email <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <input type="email" id="s1-email" placeholder="you@email.com" autocomplete="email" data-astro-cid-jtzn4zcc> </div> <div class="field" style="margin-bottom:0" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>WhatsApp <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <div class="phone-field" id="wa-field-wrap" data-astro-cid-jtzn4zcc> <span class="phone-prefix" id="phone-prefix-display" data-astro-cid-jtzn4zcc>', `</span> <input type="tel" id="s1-phone" placeholder="50 123 4567" inputmode="tel" autocomplete="tel" onfocus="document.getElementById('wa-field-wrap').style.borderColor='var(--brand)'" onblur="document.getElementById('wa-field-wrap').style.borderColor='var(--border)'" data-astro-cid-jtzn4zcc> </div> </div> </div> <div class="field-hint" style="margin-bottom:16px;" data-astro-cid-jtzn4zcc>`, '</div> <!-- REPs section --> <div class="reps-card" data-astro-cid-jtzn4zcc> <div class="reps-card-icon" data-astro-cid-jtzn4zcc> <svg width="20" height="20" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-jtzn4zcc><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z" data-astro-cid-jtzn4zcc></path></svg> </div> <div data-astro-cid-jtzn4zcc> <div class="reps-card-title" data-astro-cid-jtzn4zcc>', ' Verified Badge</div> <div class="reps-card-sub" data-astro-cid-jtzn4zcc>', '</div> </div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', ' <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <input type="text" id="s1-reps"', ` autocomplete="off" style="font-family:'Manrope',sans-serif;font-weight:700;font-size:16px;letter-spacing:0.05em;" data-astro-cid-jtzn4zcc> <div class="field-hint" id="cert-hint" data-astro-cid-jtzn4zcc> `, ' </div> </div> <div class="field-error hidden" id="s1-error" data-astro-cid-jtzn4zcc></div> <button class="btn-primary" id="s1-btn" onclick="step1Next()" data-astro-cid-jtzn4zcc>\nContinue →\n</button> <div class="trust-row" data-astro-cid-jtzn4zcc> <div class="trust-item" data-astro-cid-jtzn4zcc> <svg width="13" height="13" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-jtzn4zcc><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z" data-astro-cid-jtzn4zcc></path></svg> ', ' </div> <div class="trust-item" data-astro-cid-jtzn4zcc> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" data-astro-cid-jtzn4zcc><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-jtzn4zcc></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-jtzn4zcc></path></svg> ', ' </div> <div class="trust-item" data-astro-cid-jtzn4zcc> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" data-astro-cid-jtzn4zcc><circle cx="12" cy="12" r="10" data-astro-cid-jtzn4zcc></circle><polyline points="12 6 12 12 16 14" data-astro-cid-jtzn4zcc></polyline></svg> ', ' </div> </div> <p style="text-align:center;margin-top:20px;font-size:12px;color:rgba(255,255,255,0.35)" data-astro-cid-jtzn4zcc>\nWondering what your profile will look like?\n<a', ' style="color:rgba(255,255,255,0.55);text-decoration:underline;text-underline-offset:3px" target="_blank" rel="noopener" data-astro-cid-jtzn4zcc>See an example</a> </p> </div> <!-- ===== STEP 2: Specialties + OTP ===== --> <div id="step-2" class="hidden" data-astro-cid-jtzn4zcc> <h1 class="step-title" data-astro-cid-jtzn4zcc>', '</h1> <p class="step-subtitle" data-astro-cid-jtzn4zcc>', '</p> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', ` <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <div class="toggle-row" id="spec-toggle-row" data-astro-cid-jtzn4zcc> <div class="toggle-pill" onclick="toggleSpec(this,'Strength')" data-astro-cid-jtzn4zcc>Strength</div> <div class="toggle-pill" onclick="toggleSpec(this,'Fat Loss')" data-astro-cid-jtzn4zcc>Fat Loss</div> <div class="toggle-pill" onclick="toggleSpec(this,'Muscle Gain')" data-astro-cid-jtzn4zcc>Muscle Gain</div> <div class="toggle-pill" onclick="toggleSpec(this,'HIIT')" data-astro-cid-jtzn4zcc>HIIT</div> <div class="toggle-pill" onclick="toggleSpec(this,'Cardio')" data-astro-cid-jtzn4zcc>Cardio</div> <div class="toggle-pill" onclick="toggleSpec(this,'Yoga')" data-astro-cid-jtzn4zcc>Yoga</div> <div class="toggle-pill" onclick="toggleSpec(this,'Pilates')" data-astro-cid-jtzn4zcc>Pilates</div> <div class="toggle-pill" onclick="toggleSpec(this,'CrossFit')" data-astro-cid-jtzn4zcc>CrossFit</div> <div class="toggle-pill" onclick="toggleSpec(this,'Boxing')" data-astro-cid-jtzn4zcc>Boxing</div> <div class="toggle-pill" onclick="toggleSpec(this,'Nutrition')" data-astro-cid-jtzn4zcc>Nutrition</div> <div class="toggle-pill" onclick="toggleSpec(this,'Rehabilitation')" data-astro-cid-jtzn4zcc>Rehabilitation</div> <div class="toggle-pill" onclick="toggleSpec(this,'Sport Specific')" data-astro-cid-jtzn4zcc>Sport Specific</div> <div class="toggle-pill" onclick="toggleSpec(this,'Pre/Post Natal')" data-astro-cid-jtzn4zcc>Pre/Post Natal</div> <div class="toggle-pill" onclick="toggleSpec(this,'Seniors')" data-astro-cid-jtzn4zcc>Seniors</div> </div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>`, ' <span class="field-req" data-astro-cid-jtzn4zcc>*</span></label> <input type="text" id="s2-title" placeholder="e.g. Strength & Conditioning Coach" maxlength="60" data-astro-cid-jtzn4zcc> <div class="field-hint" data-astro-cid-jtzn4zcc>', '</div> </div> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>', `</label> <div class="toggle-row" data-astro-cid-jtzn4zcc> <div class="toggle-pill active" id="mode-in-person" onclick="toggleMode(this,'in-person')" data-astro-cid-jtzn4zcc>`, `</div> <div class="toggle-pill" id="mode-online" onclick="toggleMode(this,'online')" data-astro-cid-jtzn4zcc>`, `</div> <div class="toggle-pill" id="mode-hybrid" onclick="toggleMode(this,'hybrid')" data-astro-cid-jtzn4zcc>`, '</div> </div> </div> <div class="divider" data-astro-cid-jtzn4zcc><span class="divider-text" data-astro-cid-jtzn4zcc>', '</span></div> <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.6;" data-astro-cid-jtzn4zcc> ', ' <strong id="email-display" style="color:var(--text);" data-astro-cid-jtzn4zcc></strong> </p> <div class="otp-row" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-0" oninput="otpInput(this,0)" onkeydown="otpKeydown(event,0)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-1" oninput="otpInput(this,1)" onkeydown="otpKeydown(event,1)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-2" oninput="otpInput(this,2)" onkeydown="otpKeydown(event,2)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-3" oninput="otpInput(this,3)" onkeydown="otpKeydown(event,3)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-4" oninput="otpInput(this,4)" onkeydown="otpKeydown(event,4)" data-astro-cid-jtzn4zcc> <input class="otp-input" type="text" maxlength="1" inputmode="numeric" id="otp-5" oninput="otpInput(this,5)" onkeydown="otpKeydown(event,5)" data-astro-cid-jtzn4zcc> </div> <div class="field-error hidden" id="s2-error" style="text-align:center;margin-bottom:12px;" data-astro-cid-jtzn4zcc></div> <!-- Consent checkbox - required before account creation (GDPR / CCPA / PDPL) --> <label id="consent-label" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;cursor:pointer;font-size:13px;color:var(--text-muted);line-height:1.5;" data-astro-cid-jtzn4zcc> <input type="checkbox" id="consent-checkbox" style="margin-top:2px;accent-color:var(--brand);width:16px;height:16px;flex-shrink:0;" data-astro-cid-jtzn4zcc> <span data-astro-cid-jtzn4zcc>I agree to the <a href="/terms" target="_blank" style="color:var(--brand);text-decoration:underline;" data-astro-cid-jtzn4zcc>Terms of Service</a> and <a href="/privacy" target="_blank" style="color:var(--brand);text-decoration:underline;" data-astro-cid-jtzn4zcc>Privacy Policy</a>. I confirm my certification details are genuine and accurate.</span> </label> <button class="btn-primary" id="verify-btn" onclick="verifyAndCreate()" data-astro-cid-jtzn4zcc> ', ' </button> <button class="btn-secondary" onclick="resendCode()" id="resend-btn" data-astro-cid-jtzn4zcc>', '</button> <button class="btn-ghost" onclick="showStep(1)" data-astro-cid-jtzn4zcc>', '</button> <p style="text-align:center;font-size:11px;color:var(--text-faint);margin-top:8px;" data-astro-cid-jtzn4zcc>', `</p> </div> <!-- ===== STEP 3: Profile & Packages ===== --> <div id="step-3" class="hidden" data-astro-cid-jtzn4zcc> <h1 class="step-title" data-astro-cid-jtzn4zcc>Complete your profile</h1> <p class="step-subtitle" data-astro-cid-jtzn4zcc>Add a photo, bio, and your training packages so clients know what to expect.</p> <!-- Profile Photo --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Profile Photo <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <div id="avatar-upload-area" onclick="document.getElementById('avatar-file-input').click()" style="width:96px;height:96px;border-radius:50%;border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;color:var(--text-muted);gap:4px;font-size:11px;transition:border-color 0.15s;" data-astro-cid-jtzn4zcc> <img id="avatar-preview-img" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Avatar preview" data-astro-cid-jtzn4zcc> <span id="avatar-upload-placeholder" data-astro-cid-jtzn4zcc> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-jtzn4zcc><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-astro-cid-jtzn4zcc></path><circle cx="12" cy="7" r="4" data-astro-cid-jtzn4zcc></circle></svg> </span> <span id="avatar-upload-label" style="font-size:10px;color:var(--text-faint);" data-astro-cid-jtzn4zcc>Upload</span> </div> <input type="file" id="avatar-file-input" accept="image/*" style="display:none;" onchange="handleAvatarFileChange(event)" data-astro-cid-jtzn4zcc> </div> <!-- Bio --> <div class="field" data-astro-cid-jtzn4zcc> <label style="display:flex;justify-content:space-between;align-items:center;" data-astro-cid-jtzn4zcc>
Bio <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;font-size:11px;" id="bio-char-count" data-astro-cid-jtzn4zcc>0 / 500</span> </label> <textarea id="s3-bio" rows="4" maxlength="500" placeholder="Tell clients about your training style and what results they can expect..." oninput="updateBioCharCount()" style="width:100%;padding:14px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'Inter',sans-serif;font-size:15px;outline:none;resize:vertical;transition:border-color 0.2s;box-sizing:border-box;" data-astro-cid-jtzn4zcc></textarea> <button id="ai-bio-btn" onclick="generateAIBio()" style="display:flex;align-items:center;gap:6px;padding:7px 14px;background:transparent;border:1px solid var(--brand);color:var(--brand);border-radius:8px;font-size:12px;cursor:pointer;margin-top:8px;transition:background 0.15s;" data-astro-cid-jtzn4zcc> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-jtzn4zcc><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" data-astro-cid-jtzn4zcc></path></svg>
Write bio with AI
</button> <p id="ai-bio-error" class="hidden" style="color:var(--danger,#ef4444);font-size:13px;margin-top:4px;" data-astro-cid-jtzn4zcc></p> </div> <!-- Instagram --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Instagram <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.2s;" onfocusin="this.style.borderColor='var(--brand)'" onfocusout="this.style.borderColor='var(--border)'" data-astro-cid-jtzn4zcc> <span style="padding:14px 0 14px 16px;color:var(--text-faint);font-size:15px;" data-astro-cid-jtzn4zcc>@</span> <input type="text" id="s3-instagram" placeholder="yourhandle" autocomplete="off" style="border:none;background:transparent;padding:14px 16px 14px 4px;font-size:15px;flex:1;min-width:0;color:var(--text);outline:none;font-family:'Inter',sans-serif;" data-astro-cid-jtzn4zcc> </div> </div> <!-- Packages --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Training Packages <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <div id="packages-list" data-astro-cid-jtzn4zcc></div> <button onclick="addPackageRow()" style="width:100%;padding:10px;background:transparent;border:1px dashed var(--border);color:var(--text-muted);border-radius:10px;font-size:13px;cursor:pointer;margin-top:4px;" data-astro-cid-jtzn4zcc>
+ Add package
</button> </div> <!-- Availability --> <div class="field" data-astro-cid-jtzn4zcc> <label data-astro-cid-jtzn4zcc>Availability <span style="color:var(--text-faint);font-weight:400;text-transform:none;letter-spacing:0;" data-astro-cid-jtzn4zcc>(optional)</span></label> <input type="text" id="s3-availability" placeholder="e.g. Weekday mornings, flexible schedule" style="width:100%;padding:14px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'Inter',sans-serif;font-size:15px;outline:none;transition:border-color 0.2s;box-sizing:border-box;" data-astro-cid-jtzn4zcc> </div> <div class="field-error hidden" id="s3-error" data-astro-cid-jtzn4zcc></div> <button class="btn-primary" id="s3-btn" onclick="completeStep3()" data-astro-cid-jtzn4zcc>Finish — Go Live 🚀</button> <button class="btn-ghost" onclick="showStep(2)" data-astro-cid-jtzn4zcc>← Back</button> </div> <!-- ===== SUCCESS ===== --> <div id="step-success" class="hidden" data-astro-cid-jtzn4zcc> <div class="success-screen" data-astro-cid-jtzn4zcc> <div class="success-icon" data-astro-cid-jtzn4zcc> <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--brand)" data-astro-cid-jtzn4zcc><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-jtzn4zcc></path></svg> </div> <h1 class="success-title" data-astro-cid-jtzn4zcc>`, '</h1> <p class="success-sub" data-astro-cid-jtzn4zcc>', '</p> <div class="url-card" data-astro-cid-jtzn4zcc> <span class="url-card-text" id="success-url" data-astro-cid-jtzn4zcc>...</span> <button class="url-copy-btn" onclick="copyProfileUrl()" id="copy-btn" data-astro-cid-jtzn4zcc>', '</button> </div> <a id="view-profile-btn" href="#" class="btn-primary" style="display:flex;text-align:center;text-decoration:none;margin-bottom:12px;" data-astro-cid-jtzn4zcc>', '</a> <a href="/dashboard" class="btn-secondary" style="display:flex;text-align:center;text-decoration:none;justify-content:center;" data-astro-cid-jtzn4zcc>', '</a> <div class="next-steps" data-astro-cid-jtzn4zcc> <div class="next-steps-title" data-astro-cid-jtzn4zcc>', '</div> <div class="next-step-item" data-astro-cid-jtzn4zcc> <div class="next-step-num" data-astro-cid-jtzn4zcc>1</div> <div data-astro-cid-jtzn4zcc>', '</div> </div> <div class="next-step-item" data-astro-cid-jtzn4zcc> <div class="next-step-num" data-astro-cid-jtzn4zcc>2</div> <div data-astro-cid-jtzn4zcc>', '</div> </div> <div class="next-step-item" data-astro-cid-jtzn4zcc> <div class="next-step-num" data-astro-cid-jtzn4zcc>3</div> <div data-astro-cid-jtzn4zcc>', '</div> </div> </div> </div> </div> </div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>(function(){', `
window.__MARKET__ = __MARKET_KEY__;
})();<\/script> <script>
// ===== CONFIG =====
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';

// ── Funnel tracking ───────────────────────────────────────────────────────────────
const SESSION_ID = crypto.randomUUID();
const UTM_SOURCE = new URLSearchParams(location.search).get('utm_source') || '';
const UTM_MEDIUM = new URLSearchParams(location.search).get('utm_medium') || '';
const REFERRER = document.referrer || '';
const REF_SLUG = (new URLSearchParams(location.search).get('ref') || '').slice(0, 80);

function trackEvent(event_name, metadata) {
  fetch(EDGE_BASE + '/growth-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
    body: JSON.stringify(Object.assign({
      action: 'track',
      event: event_name,
      session_id: SESSION_ID,
      utm_source: UTM_SOURCE,
      utm_medium: UTM_MEDIUM,
      referrer: REFERRER
    }, metadata || {}))
  }).catch(function() {}); // Non-fatal
}

// Track landing view immediately
trackEvent('join_landing_view');

// Set domain-aware slug prefix
(function() {
  const el = document.getElementById('slug-prefix');
  if (el) el.textContent = window.location.hostname + '/';
})();

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== STATE =====
const state = {
  name: '', slug: '', email: '', phone: '',
  reps_number: '',
  specialties: [], title: '',
  training_modes: ['in-person'],
  trainer_id: null
};

// ===== DRAFT (localStorage auto-save) =====
const DRAFT_KEY = 'tb_join_draft';
function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      name: state.name, slug: state.slug, email: state.email,
      phone: state.phone, reps_number: state.reps_number,
      specialties: state.specialties, title: state.title,
      training_modes: state.training_modes, trainer_id: state.trainer_id,
      bio: document.getElementById('s3-bio')?.value || '',
      instagram: document.getElementById('s3-instagram')?.value || '',
      availability: document.getElementById('s3-availability')?.value || '',
    }));
  } catch(_) {}
}
async function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.name) { state.name = d.name; const el = document.getElementById('s1-name'); if (el) el.value = d.name; }
    if (d.slug) { state.slug = d.slug; const el = document.getElementById('s1-slug'); if (el) el.value = d.slug; }
    if (d.email) { state.email = d.email; const el = document.getElementById('s1-email'); if (el) el.value = d.email; }
    if (d.phone) { state.phone = d.phone; const el = document.getElementById('s1-phone'); if (el) el.value = d.phone; }
    if (d.reps_number) { state.reps_number = d.reps_number; const el = document.getElementById('s1-reps'); if (el) el.value = d.reps_number; }
    if (d.bio) { const el = document.getElementById('s3-bio'); if (el) { el.value = d.bio; updateBioCharCount(); } }
    if (d.instagram) { const el = document.getElementById('s3-instagram'); if (el) el.value = d.instagram; }
    if (d.availability) { const el = document.getElementById('s3-availability'); if (el) el.value = d.availability; }
    if (Array.isArray(d.specialties)) state.specialties = d.specialties;
    if (d.title) state.title = d.title;
    if (Array.isArray(d.training_modes)) state.training_modes = d.training_modes;
    // If account was already created, resume at step 3
    if (d.trainer_id) {
      const { data: sessionData } = await sb.auth.getSession();
      if (sessionData?.session) {
        state.trainer_id = d.trainer_id;
        showStep(3);
      } else {
        // Stale draft from a different session — clear it
        clearDraft();
      }
    }
  } catch(_) {}
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch(_) {}
}

// ===== PROGRESS =====
function setProgress(pct) {
  document.getElementById('progress-fill').style.width = pct + '%';
}

function showStep(n) {
  ['1','2','3','success'].forEach(s => {
    const el = document.getElementById('step-' + s);
    if (el) el.classList.add('hidden');
  });
  document.getElementById('step-' + n).classList.remove('hidden');
  // Update step indicator dots
  if (n === 1) {
    document.getElementById('dot-1').className = 'step-dot active';
    document.getElementById('dot-2').className = 'step-dot inactive';
    document.getElementById('line-1').className = 'step-line';
    document.getElementById('step-indicator').style.display = 'flex';
    setProgress(10);
  } else if (n === 2) {
    document.getElementById('dot-1').className = 'step-dot done';
    document.getElementById('dot-1').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    document.getElementById('dot-2').className = 'step-dot active';
    document.getElementById('line-1').className = 'step-line done';
    document.getElementById('step-indicator').style.display = 'flex';
    setProgress(60);
  } else if (n === 3) {
    document.getElementById('dot-1').className = 'step-dot done';
    document.getElementById('dot-1').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    document.getElementById('dot-2').className = 'step-dot done';
    document.getElementById('dot-2').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    document.getElementById('dot-3').className = 'step-dot active';
    document.getElementById('dot-3').innerHTML = '3';
    document.getElementById('line-1').className = 'step-line done';
    document.getElementById('line-2').className = 'step-line done';
    document.getElementById('step-indicator').style.display = 'flex';
    setProgress(80);
  } else if (n === 'success') {
    document.getElementById('step-indicator').style.display = 'none';
    setProgress(100);
    trackEvent('join_signup_complete', { trainer_id: state.trainer_id, has_reps: !!state.reps_number });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== AUTO-BUILD FROM INSTAGRAM =====
async function autoBuildFromIG() {
  const handle = document.getElementById('ig-autobuild').value.trim().replace('@','');
  if (!handle) return;
  const btn = document.getElementById('autobuild-btn');
  const status = document.getElementById('autobuild-status');
  btn.disabled = true;
  btn.textContent = '...';
  status.textContent = 'Looking up your profile...';
  status.style.color = 'rgba(255,255,255,0.4)';
  try {
    // Use OpenAI to generate a profile stub from the Instagram handle
    // In production this would call a Supabase edge function that scrapes the public IG bio
    // For now, we pre-fill with smart defaults based on the handle
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9._]/g,'');
    const guessedName = cleanHandle
      .replace(/[._]/g,' ')
      .replace(/\\\\b\\\\w/g, c => c.toUpperCase())
      .trim();
    const guessedSlug = cleanHandle.replace(/[._]/g,'-').replace(/[^a-z0-9-]/g,'');
    // Pre-fill the form
    const nameEl = document.getElementById('s1-name');
    const slugEl = document.getElementById('s1-slug');
    if (!nameEl.value) nameEl.value = guessedName;
    if (!slugEl.value) {
      slugEl.value = guessedSlug.substring(0,30);
      checkSlug(slugEl.value);
    }
    // Store Instagram handle in state for later
    state.instagram = '@' + handle;
    status.textContent = '\\\\u2713 Pre-filled from @' + handle + ' - review and adjust below';
    status.style.color = '#00C853';
  } catch(e) {
    status.textContent = 'Could not fetch profile. Fill in manually below.';
    status.style.color = '#ff5555';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Fill \\\\u2192';
  }
}

// ===== SLUG CHECK =====
let slugCheckTimer = null;
let slugValid = false;
function checkSlug(val) {
  const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
  document.getElementById('s1-slug').value = clean;
  const status = document.getElementById('slug-status');
  const errEl = document.getElementById('slug-error');
  slugValid = false;
  if (!clean || clean.length < 2) { status.innerHTML = ''; errEl.classList.add('hidden'); return; }
  clearTimeout(slugCheckTimer);
  status.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:12px;">...</span>';
  slugCheckTimer = setTimeout(async () => {
    try {
      const { data } = await sb.from('trainers').select('id').eq('slug', clean).maybeSingle();
      if (data) {
        status.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5555"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        errEl.textContent = 'This URL is taken. Try another.';
        errEl.classList.remove('hidden');
        slugValid = false;
      } else {
        status.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#00C853"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z"/></svg>';
        errEl.classList.add('hidden');
        slugValid = true;
      }
    } catch(e) { slugValid = true; status.innerHTML = ''; }
  }, 400);
}

// ===== Client-side sanitization (belt-and-suspenders; server also sanitizes) =====
function sanitizeInput(str) {
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'\\\`]/g, '').trim().slice(0, 500);
}

// ===== STEP 1 =====
async function step1Next() {
  const name = sanitizeInput(document.getElementById('s1-name').value.trim());
  const slug = document.getElementById('s1-slug').value.trim();
  const email = document.getElementById('s1-email').value.trim();
  const phone = document.getElementById('s1-phone').value.trim();
  const reps = document.getElementById('s1-reps').value.trim();
  const errEl = document.getElementById('s1-error');

  if (!name) { showErr(errEl, 'Please enter your full name.'); return; }
  if (!slug || slug.length < 2) { showErr(errEl, 'Please choose a profile URL (min 2 characters).'); return; }
  if (!email || !email.includes('@')) { showErr(errEl, 'Please enter a valid email address.'); return; }
  if (!phone) { showErr(errEl, 'Please enter your WhatsApp number.'); return; }

  errEl.classList.add('hidden');
  const btn = document.getElementById('s1-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending code...';

  try {
    // Send OTP via Supabase Auth
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;

    state.name = name;
    state.slug = slug;
    state.email = email;
    state.phone = phone.replace(/\\\\D/g,'');
    state.reps_number = reps;

    document.getElementById('email-display').textContent = email;
    trackEvent('join_step1_complete', { has_reps: !!reps });
    showStep(2);
  } catch(e) {
    showErr(errEl, e.message || 'Failed to send code. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Continue →';
  }
}

// ===== SPECIALTIES =====
function toggleSpec(el, val) {
  el.classList.toggle('active');
  if (el.classList.contains('active')) {
    if (!state.specialties.includes(val)) state.specialties.push(val);
  } else {
    state.specialties = state.specialties.filter(s => s !== val);
  }
}

// ===== TRAINING MODE =====
function toggleMode(el, val) {
  ['in-person','online','hybrid'].forEach(m => {
    const d = document.getElementById('mode-' + m);
    if (d) d.classList.remove('active');
  });
  el.classList.add('active');
  state.training_modes = [val];
}

// ===== OTP =====
function otpInput(el, idx) {
  const val = el.value.replace(/\\\\D/g,'');
  el.value = val;
  if (val && idx < 5) {
    document.getElementById('otp-' + (idx+1)).focus();
  }
  // Auto-verify when all 6 digits entered
  if (idx === 5 && val) {
    const code = Array.from({length:6}, (_,i) => document.getElementById('otp-'+i).value).join('');
    if (code.length === 6) verifyAndCreate();
  }
}

function otpKeydown(e, idx) {
  if (e.key === 'Backspace' && !e.target.value && idx > 0) {
    document.getElementById('otp-' + (idx-1)).focus();
  }
}

// ===== VERIFY & CREATE =====
async function verifyAndCreate() {
  const title = document.getElementById('s2-title').value.trim();
  const errEl = document.getElementById('s2-error');

  if (state.specialties.length === 0) { showErr(errEl, 'Please select at least one specialty.'); return; }
  if (!title) { showErr(errEl, 'Please enter your title/role.'); return; }

  // Consent validation - required for GDPR / CCPA / PDPL compliance
  const consentBox = document.getElementById('consent-checkbox');
  if (consentBox && !consentBox.checked) {
    showErr(errEl, 'Please agree to the Terms of Service and Privacy Policy to continue.');
    document.getElementById('consent-label')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const code = Array.from({length:6}, (_,i) => document.getElementById('otp-'+i).value).join('');
  if (code.length < 6) { showErr(errEl, 'Please enter the 6-digit code from your email.'); return; }

  errEl.classList.add('hidden');
  const btn = document.getElementById('verify-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating your profile...';

  state.title = title;

  try {
    // Verify OTP
    const { data: authData, error: authErr } = await sb.auth.verifyOtp({
      email: state.email,
      token: code,
      type: 'email'
    });
    if (authErr) throw authErr;

    const userId = authData?.user?.id;

    // Create trainer record
    const trainerPayload = {
      name: state.name,
      slug: state.slug,
      email: state.email,
      whatsapp: (document.getElementById('phone-prefix-display')?.textContent ?? '{market.phonePrefix}') + state.phone,
      reps_number: state.reps_number || null,
      verification_status: state.reps_number ? 'pending' : 'unverified',
      market: window.__MARKET__ || 'ae',
      specialties: state.specialties,
      title: state.title,
      training_modes: state.training_modes,
      plan: 'free',
      accepting_clients: true,
      referred_by_slug: REF_SLUG || null,
    };
    if (userId) trainerPayload.user_id = userId;

    const { data: trainer, error: trainerErr } = await sb
      .from('trainers')
      .insert(trainerPayload)
      .select()
      .single();

    if (trainerErr) {
      // Trainer might already exist - try to fetch
      const { data: existing } = await sb.from('trainers').select('*').eq('email', state.email).maybeSingle();
      if (!existing) throw trainerErr;
      state.trainer_id = existing.id;
    } else {
      state.trainer_id = trainer?.id;
    }

    // Success — proceed to step 3 for profile completion
    saveDraft();
    showStep(3);

  } catch(e) {
    showErr(errEl, e.message || 'Verification failed. Please check your code and try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Verify &amp; Go Live 🚀';
  }
}

// ===== RESEND =====
async function resendCode() {
  const btn = document.getElementById('resend-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  try {
    await sb.auth.signInWithOtp({ email: state.email, options: { shouldCreateUser: true } });
    btn.textContent = 'Code sent!';
    setTimeout(() => { btn.textContent = 'Resend Code'; btn.disabled = false; }, 3000);
  } catch(e) {
    btn.textContent = 'Resend Code';
    btn.disabled = false;
  }
}

// ===== COPY URL =====
function copyProfileUrl() {
  const url = 'https://' + document.getElementById('success-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.querySelector('.url-copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// ===== HELPERS =====
function showErr(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Pre-fill slug from name as user types
document.getElementById('s1-name').addEventListener('input', function() {
  const slugField = document.getElementById('s1-slug');
  if (!slugField.dataset.userEdited) {
    const auto = this.value.toLowerCase().replace(/\\\\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
    slugField.value = auto;
    if (auto.length >= 2) checkSlug(auto);
  }
});
document.getElementById('s1-slug').addEventListener('input', function() {
  this.dataset.userEdited = '1';
});
['s1-email', 's1-slug', 's1-phone', 's1-reps'].forEach(function(id) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', saveDraft);
});

// ===== STEP 3 FUNCTIONS =====
let _avatarBlob = null;

function handleAvatarFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  _avatarBlob = file;
  const url = URL.createObjectURL(file);
  const img = document.getElementById('avatar-preview-img');
  const placeholder = document.getElementById('avatar-upload-placeholder');
  const label = document.getElementById('avatar-upload-label');
  if (img) { img.src = url; img.style.display = 'block'; }
  if (placeholder) placeholder.style.display = 'none';
  if (label) label.style.display = 'none';
}

function updateBioCharCount() {
  const val = document.getElementById('s3-bio')?.value || '';
  const el = document.getElementById('bio-char-count');
  if (el) el.textContent = val.length + ' / 500';
  saveDraft();
}

async function generateAIBio() {
  const btn = document.getElementById('ai-bio-btn');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Generating...';
  const bioErrEl = document.getElementById('ai-bio-error');
  if (bioErrEl) bioErrEl.classList.add('hidden');
  try {
    const { data: sessionData } = await sb.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    const res = await fetch(EDGE_BASE + '/ai-bio-writer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { 'Authorization': 'Bearer ' + jwt } : {})
      },
      body: JSON.stringify({
        name: state.name,
        specialties: state.specialties,
        title: state.title,
        market: window.__MARKET__ || 'ae'
      })
    });
    if (res.ok) {
      const { bio } = await res.json();
      if (bio) {
        const bioEl = document.getElementById('s3-bio');
        if (bioEl) { bioEl.value = bio; updateBioCharCount(); }
      } else {
        if (bioErrEl) { bioErrEl.textContent = 'Could not generate bio — please write your own.'; bioErrEl.classList.remove('hidden'); }
      }
    } else {
      if (bioErrEl) { bioErrEl.textContent = 'Could not generate bio — please write your own.'; bioErrEl.classList.remove('hidden'); }
    }
  } catch(_) {
    if (bioErrEl) { bioErrEl.textContent = 'Could not generate bio — please write your own.'; bioErrEl.classList.remove('hidden'); }
  }
  btn.disabled = false;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Write bio with AI';
}

let _packageCount = 0;
let _step3Submitting = false;
function addPackageRow() {
  const list = document.getElementById('packages-list');
  if (!list) return;
  const idx = _packageCount++;
  const div = document.createElement('div');
  div.id = 'pkg-row-' + idx;
  div.style.cssText = 'background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;';
  div.innerHTML = '<div style="margin-bottom:8px;"><input type="text" class="pkg-name" placeholder="e.g. 10-Pack, Monthly Plan" style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;font-family:Inter,sans-serif;box-sizing:border-box;" /></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
    + '<input type="number" class="pkg-price" min="0" step="1" placeholder="Price (e.g. 250)" style="padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;font-family:Inter,sans-serif;width:100%;box-sizing:border-box;" />'
    + '<select class="pkg-currency" style="padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;font-family:Inter,sans-serif;">'
    + '<option value="AED">AED</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="EUR">EUR</option>'
    + '</select></div>';
  list.appendChild(div);
}

function collectPackages() {
  return Array.from(document.querySelectorAll('#packages-list .pkg-name'))
    .map(function(nameEl, i) {
      const row = nameEl.closest('div[id^="pkg-row"]') || nameEl.parentElement.parentElement;
      return {
        name: nameEl.value.trim(),
        price: parseFloat(row.querySelector('.pkg-price')?.value) || 0,
        currency: row.querySelector('.pkg-currency')?.value || 'AED'
      };
    })
    .filter(function(p) { return p.name; });
}

async function completeStep3() {
  const errEl = document.getElementById('s3-error');
  if (errEl) errEl.classList.add('hidden');

  if (_step3Submitting) return;
  _step3Submitting = true;

  if (!state.trainer_id) {
    _step3Submitting = false;
    if (errEl) { errEl.textContent = 'Session error — please refresh'; errEl.classList.remove('hidden'); }
    return;
  }

  const btn = document.getElementById('s3-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving...'; }

  try {
    const updates = {};
    const bioVal = document.getElementById('s3-bio')?.value.trim();
    if (bioVal) updates.bio = bioVal;
    const igVal = document.getElementById('s3-instagram')?.value.trim().replace(/^@/, '');
    if (igVal) updates.instagram_handle = igVal;
    const avail = document.getElementById('s3-availability')?.value.trim();
    if (avail) updates.availability = avail;

    // Upload avatar if provided
    if (_avatarBlob) {
      const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
      if (!ALLOWED_TYPES[_avatarBlob.type]) {
        throw new Error('Avatar must be a JPEG, PNG, or WebP image.');
      }
      if (_avatarBlob.size > MAX_AVATAR_BYTES) {
        throw new Error('Avatar file must be under 5 MB.');
      }
      const ext = ALLOWED_TYPES[_avatarBlob.type];
      const path = 'trainers/' + state.trainer_id + '/avatar.' + ext;
      const { error: uploadErr } = await sb.storage.from('avatars').upload(path, _avatarBlob, { upsert: true, contentType: _avatarBlob.type });
      if (uploadErr) {
        if (errEl) { errEl.textContent = 'Photo upload failed: ' + uploadErr.message; errEl.classList.remove('hidden'); }
      } else {
        const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
        updates.avatar_url = urlData.publicUrl;
      }
    }

    if (Object.keys(updates).length) {
      await sb.from('trainers').update(updates).eq('id', state.trainer_id);
    }

    // Save packages
    const packages = collectPackages();
    if (packages.length) {
      await sb.from('session_packages').delete().eq('trainer_id', state.trainer_id);
      await sb.from('session_packages').insert(packages.map(function(p) {
        return Object.assign({}, p, { trainer_id: state.trainer_id });
      }));
    }

    clearDraft();
    // Show success screen
    const profileUrl = window.location.hostname + '/' + state.slug;
    const successUrl = document.getElementById('success-url');
    const viewBtn = document.getElementById('view-profile-btn');
    if (successUrl) successUrl.textContent = profileUrl;
    if (viewBtn) viewBtn.href = '/' + state.slug;
    trackEvent('join_signup_complete', { trainer_id: state.trainer_id });
    showStep('success');

  } catch(e) {
    _step3Submitting = false;
    if (errEl) { errEl.textContent = e.message || 'Something went wrong. Please try again.'; errEl.classList.remove('hidden'); }
    if (btn) { btn.disabled = false; btn.innerHTML = 'Finish — Go Live 🚀'; }
  }
}

// Load any saved draft on page init
loadDraft();
<\/script> `])), maybeRenderHead(), t(locale, "join.title_ext").replace("\\n", "<br>"), t(locale, "join.sub_ext").replace("{cert}", market.certificationBody), t(locale, "join.autobuild_label"), t(locale, "join.autobuild_sub"), t(locale, "join.autobuild_btn"), t(locale, "join.url_label"), t(locale, "join.url_hint"), market.phonePrefix, t(locale, "join.email_hint"), market.certificationBody, t(locale, "join.cert_trust"), market.certVerifyLabel, addAttribute(market.certVerifyPlaceholder, "placeholder"), locale === "en-ae" ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-jtzn4zcc": true }, { "default": async ($$result3) => renderTemplate`Find yours at <a href="https://repsuae.com/searcht" target="_blank" rel="noopener" style="color:var(--brand);text-decoration:none;" data-astro-cid-jtzn4zcc>repsuae.com/searcht</a> - leave blank to add later` })}` : locale === "en-uk" ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-jtzn4zcc": true }, { "default": async ($$result3) => renderTemplate`Find yours at <a href="https://www.reps-uk.org/find-a-trainer/" target="_blank" rel="noopener" style="color:var(--brand);text-decoration:none;" data-astro-cid-jtzn4zcc>reps-uk.org</a> - leave blank to add later` })}` : locale === "en-us" ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-jtzn4zcc": true }, { "default": async ($$result3) => renderTemplate`Find yours at <a href="https://www.nasm.org/resources/validate-credentials" target="_blank" rel="noopener" style="color:var(--brand);text-decoration:none;" data-astro-cid-jtzn4zcc>nasm.org/validate</a> - leave blank to add later` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-jtzn4zcc": true }, { "default": async ($$result3) => renderTemplate`Leave blank to add later` })}`, t(locale, "join.trust_cert").replace("{cert}", market.certificationBody), t(locale, "join.trust_free"), t(locale, "join.trust_speed"), addAttribute(`/${demoSlug}`, "href"), t(locale, "join.step2_title"), t(locale, "join.step2_sub"), t(locale, "join.specialties_label"), t(locale, "join.title_role"), t(locale, "join.title_hint"), t(locale, "join.mode_label"), t(locale, "join.mode_in_person"), t(locale, "join.mode_online"), t(locale, "join.mode_hybrid"), t(locale, "join.verify_divider"), t(locale, "join.otp_sent"), t(locale, "join.verify_btn"), t(locale, "join.resend"), t(locale, "join.back"), t(locale, "join.spam_hint"), t(locale, "join.success_title"), t(locale, "join.success_sub"), t(locale, "join.copy_btn"), t(locale, "join.view_profile"), t(locale, "join.go_dashboard"), t(locale, "join.next_steps_title"), t(locale, "join.next1"), t(locale, "join.next2"), t(locale, "join.next3"), defineScriptVars({ __MARKET_KEY__: market.market })) })}`;
}, "/Users/bobanpepic/trainedby/src/pages/join.astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/join.astro";
const $$url = "/join";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Join,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
