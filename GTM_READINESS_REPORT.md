# TrainedBy: GTM & Product Readiness Report
**Target Markets:** USA (`trainedby.com`), UAE (`trainedby.ae`), UK (`trainedby.uk`)
**Date:** April 15, 2026

This report assesses the current state of the TrainedBy platform against the legal, product, and operational requirements for launching a fitness SaaS marketplace in the US, UAE, and UK.

---

## 1. Legal & Compliance Readiness (Critical Blockers)

The platform currently has **no legal pages** (Privacy Policy, Terms of Service, Cookie Policy). The footer links point to `/privacy` and `/terms`, but these pages do not exist. Launching without these, especially in the US and UK, exposes the Delaware LLC to immediate liability.

### USA Requirements (Delaware LLC)
- **CCPA/CPRA Compliance:** As a SaaS platform collecting consumer data (leads) and trainer data, you must have a CCPA-compliant Privacy Policy detailing data collection, sharing, and the "Right to Delete" [1].
- **Marketplace Liability Waiver:** You are connecting consumers with independent fitness trainers. Your Terms of Service must explicitly state that TrainedBy is a software provider, not an employer, and disclaim liability for physical injuries sustained during training sessions booked via the platform [2].
- **Stripe Connect TOS:** To process payments on behalf of trainers, your Terms must incorporate the Stripe Connected Account Agreement.

### UK Requirements
- **GDPR Compliance:** You must have a UK GDPR-compliant Privacy Policy, a cookie consent banner (currently missing), and a Data Processing Agreement (DPA) since you process lead data on behalf of trainers [3].
- **ICO Registration:** As a data controller operating in the UK, the Delaware LLC may need to register with the Information Commissioner's Office (ICO) and pay the data protection fee.

### UAE Requirements
- **PDPL Compliance:** The UAE Personal Data Protection Law (PDPL) requires explicit consent for data processing. The current lead capture forms do not have a consent checkbox [4].

**Action Items:**
1. Draft and publish `/privacy`, `/terms`, and `/cookie` pages.
2. Add a mandatory "I agree to the Terms and Privacy Policy" checkbox to the trainer onboarding flow (`join.astro`).
3. Add a cookie consent banner to the frontend.
4. Add a liability disclaimer to the consumer-facing lead capture forms.

---

## 2. Product & Payment Readiness

The core product architecture (multi-domain routing, edge functions, database) is robust, but there are specific gaps in the payment and onboarding flows.

### Payment Infrastructure
- **Stripe Connect:** The codebase references Stripe, but there is no evidence of a full Stripe Connect OAuth flow for trainers to receive payouts. If trainers are selling digital products or sessions, they need to connect their own Stripe accounts.
- **Currency Handling:** The `market.ts` config correctly maps USD for the US, AED for the UAE, and GBP for the UK. However, the `payment-router` edge function must ensure it passes the correct currency to Stripe based on the trainer's market.

### Onboarding Flow
- **Verification Bottleneck:** The current onboarding flow (`join.astro`) asks for certification numbers (e.g., NASM, REPs UK). However, the verification process appears to be manual or handled by an AI agent (`reverify-agent`). If this process is not instant, trainers may drop off before completing their profiles.
- **Profile Completeness:** The newly added `ProfileCompleteness` widget is excellent for activation, but the "Upgrade to Pro" nudge at 70% completion will fail if the Stripe checkout flow is not fully wired.

**Action Items:**
1. Verify the Stripe Connect onboarding flow for trainers.
2. Test the end-to-end checkout flow for a consumer buying a package in USD, AED, and GBP.
3. Ensure the AI verification agent can handle US certifications (NASM, ACE, NSCA) as accurately as UK/UAE ones.

---

## 3. Go-To-Market (GTM) Strategy

A marketplace launch requires solving the "chicken and egg" problem: you need trainers to attract consumers, and consumers to attract trainers.

### Supply-Side (Trainers) Acquisition
- **The "Link-in-Bio" Play:** Position TrainedBy as a superior alternative to Linktree for fitness professionals. The free profile with the `ProfileCompleteness` widget is a strong hook.
- **Certification Partnerships:** In the US, target newly certified NASM/ACE trainers. In the UK, target CIMSPA/REPs members. The value prop: "Get your first client-ready website in 60 seconds."
- **Affiliate Flywheel:** The dashboard already includes a referral tracking system (4 referrals = free Pro). This should be the primary growth engine.

### Demand-Side (Consumers) Acquisition
- **Programmatic SEO:** The recent addition of `sitemap.xml` and schema.org JSON-LD is a massive advantage. Every trainer profile acts as a landing page for long-tail keywords (e.g., "NASM certified personal trainer in Austin").
- **Trainer-Led Marketing:** Encourage trainers to share their TrainedBy links on Instagram/TikTok. Every consumer who views a trainer's profile is exposed to the TrainedBy brand.

**Action Items:**
1. Seed the platform with 50-100 high-quality "hero" trainers in each launch city (e.g., Austin, Dubai, London) before opening to consumers.
2. Create a dedicated landing page for the referral program to accelerate the affiliate flywheel.

---

## Pre-Launch Checklist

### 🔴 Critical (Do Before Launch)
- [ ] Generate and publish Privacy Policy, Terms of Service, and Cookie Policy.
- [ ] Add Terms/Privacy consent checkboxes to trainer signup and consumer lead forms.
- [ ] Implement a cookie consent banner.
- [ ] Verify Stripe Connect payout flow for trainers.
- [ ] Test end-to-end subscription payments in USD, AED, and GBP.

### 🟡 Important (Do Within 30 Days of Launch)
- [ ] Register with the UK ICO (if required).
- [ ] Seed the platform with 50+ trainers per target city.
- [ ] Set up automated email sequences for the referral program.

### 🟢 Optimization (Post-Launch)
- [ ] Monitor AI verification accuracy for US certifications.
- [ ] Expand programmatic SEO to include city-specific directory pages (e.g., `/find/usa/austin`).

---
### References
[1] California Privacy Protection Agency. "California Finalizes Regulations to Strengthen Consumers' Privacy." Sept 2025.
[2] Pepper Hamilton LLP. "Liability Waiver Forms and Your Legal Position as a Personal Trainer."
[3] The DPO Centre. "GDPR guide for SaaS companies expanding into EU & UK markets."
[4] UAE Government. "Data protection laws | The Official Platform of the UAE Government." Nov 2025.
