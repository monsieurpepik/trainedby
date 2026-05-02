/* empty css               */
import { c as createComponent } from './astro-component_DiJ9uz96.mjs';
import { h as renderComponent, r as renderTemplate, u as unescapeHTML } from './ssr-function_D_8GPgmW.mjs';
import { $ as $$Base } from './Base_X9W0huPu.mjs';
import { g as getMarket } from './market_CY7-kFE1.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useCallback } from 'react';
import { S as SUPABASE_URL, a as SUPABASE_ANON_KEY, E as EDGE_BASE } from './config_D-F8zC9_.mjs';

function formatPrice(pkg, currencySymbol) {
  if (!pkg.price) return "";
  const sym = currencySymbol || pkg.currency || "";
  return sym ? `${sym} ${pkg.price}` : String(pkg.price);
}
function buildStats(t) {
  const items = [];
  const rating = t.avg_rating != null ? parseFloat(String(t.avg_rating)) : null;
  const reviewCount = t.review_count ?? 0;
  if (rating !== null && reviewCount > 0) {
    items.push({ num: rating.toFixed(1), label: "Rating" });
    items.push({ num: String(reviewCount), label: reviewCount === 1 ? "Review" : "Reviews" });
  }
  const experience = t.experience_years || t.years_experience || null;
  if (experience) items.push({ num: `${experience}y`, label: "Experience" });
  const goalRate = t.goal_achievement_rate ?? null;
  if (goalRate) items.push({ num: `${goalRate}%`, label: "Goal Rate" });
  const clients = t.total_clients || t.client_count || null;
  if (clients) items.push({ num: `${clients}+`, label: "Clients" });
  return items;
}
function buildTags(specialties, isVerified, certifications) {
  const maxSpecialties = isVerified ? 3 : 4;
  const raw = [...specialties.slice(0, maxSpecialties)];
  if (isVerified) raw.unshift("Verified");
  if (certifications.length > 0 && raw.length < 4) raw.push(certifications[0]);
  return [...new Set(raw)].slice(0, 4);
}
function normaliseSpecialties(raw) {
  if (!raw) return ["Personal Trainer"];
  if (Array.isArray(raw)) return raw.length > 0 ? raw : ["Personal Trainer"];
  return [raw];
}
function getDisplayName(t) {
  return t.name || t.full_name || "";
}
function getPhotoUrl(t) {
  return t.avatar_url || t.profile_photo_url || "";
}
function getLocation(t) {
  return [t.city, t.country].filter(Boolean).join(", ");
}
function getContactNumber(t) {
  return (t.whatsapp || t.phone || "").replace(/\D/g, "");
}
function isVerifiedTrainer(t) {
  return !!(t.reps_verified || t.is_verified || t.verification_status === "verified");
}
function dedupePackages(packages) {
  const seen = /* @__PURE__ */ new Set();
  return packages.filter((p) => {
    const key = p.name || p.title || "";
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Hero({ trainer, onBack, onShare }) {
  const displayName = getDisplayName(trainer);
  const photoUrl = getPhotoUrl(trainer);
  const specialties = normaliseSpecialties(trainer.specialties);
  const location = getLocation(trainer);
  return /* @__PURE__ */ jsxs("div", { className: "tb-hero", children: [
    photoUrl && /* @__PURE__ */ jsx(
      "img",
      {
        className: "tb-hero-img",
        src: photoUrl,
        alt: displayName,
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "tb-hero-fade" }),
    /* @__PURE__ */ jsxs("div", { className: "tb-hero-controls", children: [
      /* @__PURE__ */ jsx("button", { className: "tb-hero-btn", onClick: onBack, "aria-label": "Back", children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "15 18 9 12 15 6" }) }) }),
      "share" in navigator ? /* @__PURE__ */ jsx("button", { className: "tb-hero-btn", onClick: onShare, "aria-label": "Share", children: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("circle", { cx: "18", cy: "5", r: "3" }),
        /* @__PURE__ */ jsx("circle", { cx: "6", cy: "12", r: "3" }),
        /* @__PURE__ */ jsx("circle", { cx: "18", cy: "19", r: "3" }),
        /* @__PURE__ */ jsx("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
        /* @__PURE__ */ jsx("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" })
      ] }) }) : /* @__PURE__ */ jsx("span", {})
    ] }),
    photoUrl && /* @__PURE__ */ jsxs("div", { className: "tb-hero-name-block", children: [
      /* @__PURE__ */ jsx("div", { className: "tb-hero-name", children: displayName }),
      specialties[0] && /* @__PURE__ */ jsxs("div", { className: "tb-hero-tagline", children: [
        specialties[0],
        location ? ` · ${location}` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "hero-sentinel" })
  ] });
}

function IdentityStrip({ tags, location }) {
  return /* @__PURE__ */ jsxs("div", { className: "tb-identity", children: [
    tags.map((tag) => /* @__PURE__ */ jsx("span", { className: "tb-tag", children: tag }, tag)),
    location && /* @__PURE__ */ jsxs("span", { className: "tb-location", children: [
      /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
      ] }),
      location
    ] })
  ] });
}

function StatsRow({ stats }) {
  if (stats.length === 0) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "tb-stats",
      style: { gridTemplateColumns: `repeat(${stats.length}, 1fr)` },
      children: stats.map((s) => /* @__PURE__ */ jsxs("div", { className: "tb-stat-item", children: [
        /* @__PURE__ */ jsx("div", { className: "tb-stat-num", children: s.num }),
        /* @__PURE__ */ jsx("div", { className: "tb-stat-label", children: s.label })
      ] }, s.label))
    }
  );
}

function CTABlock({ paymentEnabled, whatsappNumber, displayName }) {
  const ctaLabel = paymentEnabled ? "Book a Session" : "Request a Session";
  const bookingUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi ${displayName}, I found your profile on TrainedBy and I'd like to book a session.`
  )}` : null;
  const messageUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to get in touch.")}` : null;
  function handleBookClick() {
    if (bookingUrl) {
      window.open(bookingUrl, "_blank", "noopener");
    } else {
      alert("Booking coming soon!");
    }
  }
  function handleMessageClick() {
    if (messageUrl) {
      window.open(messageUrl, "_blank", "noopener");
    } else {
      alert("Contact coming soon!");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "tb-cta", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "tb-btn-primary",
        onClick: handleBookClick,
        style: whatsappNumber ? { animation: "wa-pulse 2s ease infinite" } : void 0,
        children: [
          /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "rgba(255,255,255,0.65)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
            /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
            /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
          ] }),
          ctaLabel
        ]
      }
    ),
    /* @__PURE__ */ jsx("button", { className: "tb-btn-secondary", onClick: handleMessageClick, children: "Send a message" })
  ] });
}

function PackagesCarousel({
  packages,
  currencySymbol,
  displayName,
  whatsappNumber
}) {
  if (packages.length === 0) return null;
  function handleBook(pkg) {
    if (!whatsappNumber) return;
    const pkgName = pkg.name || pkg.title || "package";
    const msg = `Hi ${displayName}, I'm interested in the ${pkgName}.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }
  return /* @__PURE__ */ jsxs("div", { className: "tb-sessions", children: [
    /* @__PURE__ */ jsxs("div", { className: "tb-sessions-header", children: [
      /* @__PURE__ */ jsx("span", { className: "tb-section-label", children: "Sessions" }),
      /* @__PURE__ */ jsx("a", { href: "javascript:void(0)", className: "tb-see-all", children: "See all →" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tb-sessions-scroll", children: packages.map((pkg, i) => {
      const pkgName = pkg.name || pkg.title || "Package";
      const price = formatPrice(pkg, currencySymbol);
      return /* @__PURE__ */ jsxs("div", { className: "tb-pkg-card", children: [
        /* @__PURE__ */ jsx("div", { className: "tb-pkg-name", children: pkgName }),
        pkg.sessions != null && /* @__PURE__ */ jsxs("div", { className: "tb-pkg-detail", children: [
          pkg.sessions,
          " session",
          pkg.sessions !== 1 ? "s" : ""
        ] }),
        pkg.description && /* @__PURE__ */ jsx("div", { className: "tb-pkg-detail", children: pkg.description }),
        price && /* @__PURE__ */ jsx("div", { className: "tb-pkg-price", children: price }),
        whatsappNumber && /* @__PURE__ */ jsx("button", { className: "tb-pkg-book", onClick: () => handleBook(pkg), children: "Book" })
      ] }, pkg.id ?? i);
    }) })
  ] });
}

function About({ bio }) {
  const [expanded, setExpanded] = useState(false);
  if (!bio) return null;
  return /* @__PURE__ */ jsxs("div", { className: "tb-about", children: [
    /* @__PURE__ */ jsx("div", { className: "tb-section-label", style: { marginBottom: "12px" }, children: "About" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `tb-about-text${expanded ? " expanded" : ""}`,
        id: "tb-about-text",
        children: bio
      }
    ),
    !expanded && /* @__PURE__ */ jsx(
      "button",
      {
        className: "tb-read-more",
        style: { color: "#9A9290", fontWeight: 400 },
        onClick: () => setExpanded(true),
        children: "Read more →"
      }
    )
  ] });
}

const STAR_FILLED = "#1A1411";
const STAR_EMPTY = "rgba(0,0,0,0.12)";
function Stars({ rating, size = 14 }) {
  return /* @__PURE__ */ jsx("span", { children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx("span", { style: { color: i <= Math.round(rating) ? STAR_FILLED : STAR_EMPTY, fontSize: size }, children: "★" }, i)) });
}
function ReviewCard({ review }) {
  const name = review.client_name || "Client";
  const initials = name.substring(0, 2).toUpperCase();
  const dateStr = review.created_at ? new Date(review.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";
  return /* @__PURE__ */ jsxs("div", { style: { background: "#F8F7F5", borderRadius: "12px", padding: "16px 18px", marginBottom: "10px" }, children: [
    /* @__PURE__ */ jsx("div", { style: { marginBottom: "10px" }, children: /* @__PURE__ */ jsx(Stars, { rating: review.rating ?? 0, size: 12 }) }),
    review.review_text && /* @__PURE__ */ jsx("div", { style: { fontSize: "13px", fontWeight: 300, color: "#4A4440", lineHeight: 1.6, marginBottom: "12px" }, children: review.review_text }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--text-secondary)",
        flexShrink: 0
      }, children: initials }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: "13px", fontWeight: 400, color: "#111111" }, children: name }),
      dateStr && /* @__PURE__ */ jsx("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }, children: dateStr })
    ] })
  ] });
}
function Reviews({ trainerId, averageRating, reviewCount }) {
  const [state, setState] = useState({
    loading: true,
    reviews: [],
    total: 0,
    error: false
  });
  useEffect(() => {
    if (!trainerId) return;
    const controller = new AbortController();
    async function fetchReviews() {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.${trainerId}&booking_id=not.is.null&order=created_at.desc&limit=2`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              Prefer: "count=exact"
            },
            signal: controller.signal
          }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const rawTotal = parseInt(r.headers.get("content-range")?.split("/")[1] ?? "0", 10);
        const total = isNaN(rawTotal) ? 0 : rawTotal;
        const reviews = await r.json();
        setState({ loading: false, reviews, total, error: false });
      } catch (e) {
        if (e.name === "AbortError") return;
        setState({ loading: false, reviews: [], total: 0, error: true });
      }
    }
    fetchReviews();
    return () => controller.abort();
  }, [trainerId]);
  if (state.loading) {
    return /* @__PURE__ */ jsxs("div", { className: "tb-reviews", children: [
      /* @__PURE__ */ jsx("div", { className: "tb-section-label", style: { marginBottom: "12px" }, children: "Reviews" }),
      /* @__PURE__ */ jsx("div", { className: "tb-reviews-loading", children: "Loading reviews..." })
    ] });
  }
  if (state.total === 0) return null;
  const displayRating = averageRating ?? 0;
  return /* @__PURE__ */ jsxs("div", { className: "tb-reviews", children: [
    /* @__PURE__ */ jsx("div", { className: "tb-section-label", style: { marginBottom: "12px" }, children: "Reviews" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "32px", fontWeight: 200, letterSpacing: "-0.02em", color: "#111111", lineHeight: 1 }, children: displayRating.toFixed(1) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "2px", marginBottom: "3px" }, children: /* @__PURE__ */ jsx(Stars, { rating: displayRating }) }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: [
          "from ",
          reviewCount,
          " verified client",
          reviewCount !== 1 ? "s" : ""
        ] })
      ] })
    ] }),
    state.reviews.map((rv, i) => /* @__PURE__ */ jsx(ReviewCard, { review: rv }, rv.id ?? i))
  ] });
}

function CompactHeader({ trainerName, onBack, onShare }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs("div", { id: "tb-compact-header", className: visible ? "visible" : "", children: [
    /* @__PURE__ */ jsx("button", { className: "ch-btn", onClick: onBack, "aria-label": "Back", children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "15 18 9 12 15 6" }) }) }),
    /* @__PURE__ */ jsx("span", { className: "ch-name", children: trainerName }),
    /* @__PURE__ */ jsx("button", { className: "ch-btn", onClick: onShare, "aria-label": "Share", children: /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("circle", { cx: "18", cy: "5", r: "3" }),
      /* @__PURE__ */ jsx("circle", { cx: "6", cy: "12", r: "3" }),
      /* @__PURE__ */ jsx("circle", { cx: "18", cy: "19", r: "3" }),
      /* @__PURE__ */ jsx("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
      /* @__PURE__ */ jsx("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" })
    ] }) })
  ] });
}

function BottomNav() {
  return /* @__PURE__ */ jsxs("nav", { id: "tb-bottom-nav", "aria-label": "Main navigation", children: [
    /* @__PURE__ */ jsxs("a", { href: "/", className: "nav-item", children: [
      /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
        /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
      ] }),
      "Discover"
    ] }),
    /* @__PURE__ */ jsxs("a", { href: "/find", className: "nav-item", children: [
      /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
      ] }),
      "Search"
    ] }),
    /* @__PURE__ */ jsxs("a", { href: "/dashboard", className: "nav-item", children: [
      /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
        /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
        /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
      ] }),
      "Bookings"
    ] }),
    /* @__PURE__ */ jsxs("a", { href: "/dashboard/messages", className: "nav-item", children: [
      /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }),
      "Messages"
    ] }),
    /* @__PURE__ */ jsxs("a", { href: "/dashboard", className: "nav-item", children: [
      /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
      ] }),
      "Profile"
    ] })
  ] });
}

function LoadingSpinner() {
  return /* @__PURE__ */ jsx("div", { className: "tb-loading", children: /* @__PURE__ */ jsx("div", { className: "tb-spinner" }) });
}
function ErrorState() {
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: "24px",
    padding: "32px",
    textAlign: "center",
    fontFamily: "'DM Sans', system-ui, sans-serif"
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: "64px", fontWeight: 200, letterSpacing: "-0.02em", color: "#111111", lineHeight: 1 }, children: "404" }),
    /* @__PURE__ */ jsx("h1", { style: { fontSize: "22px", fontWeight: 300, color: "#111111" }, children: "Trainer not found" }),
    /* @__PURE__ */ jsx("p", { style: { color: "#6B6460", maxWidth: "360px", lineHeight: 1.6, fontSize: "13.5px", fontWeight: 300 }, children: "This trainer profile doesn't exist or may have been removed." }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }, children: [
      /* @__PURE__ */ jsx("a", { href: "/find", style: { background: "#1A1411", color: "#fff", padding: "12px 28px", borderRadius: "13px", textDecoration: "none", fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em" }, children: "Find a Trainer" }),
      /* @__PURE__ */ jsx("a", { href: "/", style: { background: "transparent", border: "1px solid rgba(0,0,0,0.10)", color: "#7A7068", padding: "12px 28px", borderRadius: "13px", textDecoration: "none", fontWeight: 300, fontSize: "14px" }, children: "Go Home" })
    ] })
  ] });
}
function TrainerProfile({ slug, paymentEnabled, currencySymbol }) {
  const [loadState, setLoadState] = useState("loading");
  const [trainer, setTrainer] = useState(null);
  const [packages, setPackages] = useState([]);
  useEffect(() => {
    if (!slug) {
      setLoadState("error");
      return;
    }
    const controller = new AbortController();
    async function fetchTrainer() {
      try {
        const r = await fetch(
          `${EDGE_BASE}/get-trainer?slug=${encodeURIComponent(slug)}`,
          {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
            signal: controller.signal
          }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const resp = await r.json();
        if (!resp || resp.error) throw new Error("Trainer not found");
        const trainerData = resp.trainer || resp;
        const pkgData = resp.packages || [];
        setTrainer(trainerData);
        setPackages(dedupePackages(pkgData));
        setLoadState("loaded");
      } catch (e) {
        if (e.name === "AbortError") return;
        setLoadState("error");
      }
    }
    fetchTrainer();
    return () => controller.abort();
  }, [slug]);
  const displayName = trainer ? getDisplayName(trainer) : "";
  const handleBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/find";
  }, []);
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${displayName} - Verified Personal Trainer`,
        text: `Check out ${displayName}'s verified trainer profile`,
        url: window.location.href
      }).catch(() => {
      });
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {
      });
    }
  }, [displayName]);
  const specialties = trainer ? normaliseSpecialties(trainer.specialties) : [];
  const tags = trainer ? buildTags(
    specialties,
    isVerifiedTrainer(trainer),
    Array.isArray(trainer.certifications) ? trainer.certifications : []
  ) : [];
  const stats = trainer ? buildStats(trainer) : [];
  const trainerLocation = trainer ? getLocation(trainer) : "";
  const whatsappNumber = trainer ? getContactNumber(trainer) : "";
  const bio = trainer?.bio ?? "";
  const averageRating = trainer?.avg_rating != null ? parseFloat(String(trainer.avg_rating)) : null;
  const reviewCount = trainer?.review_count ?? 0;
  return /* @__PURE__ */ jsxs("div", { id: "tb-page", children: [
    /* @__PURE__ */ jsx(
      CompactHeader,
      {
        trainerName: displayName,
        onBack: handleBack,
        onShare: handleShare
      }
    ),
    /* @__PURE__ */ jsxs("div", { id: "tb-root", children: [
      loadState === "loading" && /* @__PURE__ */ jsx(LoadingSpinner, {}),
      loadState === "error" && /* @__PURE__ */ jsx(ErrorState, {}),
      loadState === "loaded" && trainer && /* @__PURE__ */ jsxs("div", { id: "profile-mount", children: [
        /* @__PURE__ */ jsx(Hero, { trainer, onBack: handleBack, onShare: handleShare }),
        /* @__PURE__ */ jsx(IdentityStrip, { tags, location: trainerLocation }),
        /* @__PURE__ */ jsx(StatsRow, { stats }),
        /* @__PURE__ */ jsx(
          CTABlock,
          {
            paymentEnabled,
            whatsappNumber,
            displayName
          }
        ),
        /* @__PURE__ */ jsx(
          PackagesCarousel,
          {
            packages,
            currencySymbol,
            displayName,
            whatsappNumber
          }
        ),
        /* @__PURE__ */ jsx(About, { bio }),
        /* @__PURE__ */ jsx(
          Reviews,
          {
            trainerId: trainer.id,
            averageRating,
            reviewCount
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName ?? "TrainedBy";
  const paymentEnabled = market.paymentEnabled;
  const currencySymbol = market.currencySymbol;
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return Astro2.redirect("/find", 302);
  }
  const RESERVED = /* @__PURE__ */ new Set([
    "find",
    "join",
    "pricing",
    "blog",
    "dashboard",
    "edit",
    "admin",
    "superadmin",
    "for-trainers",
    "privacy",
    "terms",
    "cookie-policy",
    "landing",
    "index",
    "profile",
    "sitemap.xml",
    "robots.txt",
    "favicon.ico",
    "manifest.webmanifest"
  ]);
  if (RESERVED.has(slug.toLowerCase())) {
    return Astro2.redirect("/find", 302);
  }
  const SUPABASE_URL = "https://mezhtdbfyvkshpuplqqw.supabase.co";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";
  let trainerName = "";
  let trainerSpecialty = "";
  let trainerPhoto = "";
  let trainerExists = false;
  let avgRating = null;
  let reviewCount = 0;
  let certifications = [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/trainers?slug=eq.${encodeURIComponent(slug)}&select=name,specialties,avatar_url,avg_rating,review_count,certifications&limit=1`,
      { headers: { "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        trainerExists = true;
        trainerName = data[0].name || "";
        trainerSpecialty = Array.isArray(data[0].specialties) ? data[0].specialties[0] : data[0].specialties || "Personal Trainer";
        trainerPhoto = data[0].avatar_url || "";
        avgRating = data[0].avg_rating ?? null;
        reviewCount = data[0].review_count ?? 0;
        certifications = Array.isArray(data[0].certifications) ? data[0].certifications : [];
      }
    }
  } catch (e) {
    trainerExists = true;
  }
  if (!trainerExists) {
    return new Response(null, { status: 404 });
  }
  const pageTitle = trainerName ? `${trainerName} - Verified Trainer on ${brandName}` : `Trainer Profile - ${brandName}`;
  const pageDesc = trainerName ? `Book sessions with ${trainerName}, a verified ${trainerSpecialty} on ${brandName}.` : `Verified personal trainer profile on ${brandName}`;
  const profileUrl = `${Astro2.url.origin}/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": trainerName,
    "url": profileUrl,
    ...trainerPhoto ? { "image": trainerPhoto } : {},
    "jobTitle": trainerSpecialty,
    "description": pageDesc,
    ...certifications.length > 0 ? {
      "hasCredential": certifications.map((c) => ({ "@type": "EducationalOccupationalCredential", "name": c }))
    } : {},
    ...avgRating !== null && reviewCount > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating.toFixed(1),
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}
  };
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": pageTitle, "description": pageDesc, "ogImage": "/og/" + slug + ".png" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([' <script type="application/ld+json">', "<\/script>   ", " "])), unescapeHTML(JSON.stringify(jsonLd)), renderComponent($$result2, "TrainerProfile", TrainerProfile, { "client:load": true, "slug": slug, "paymentEnabled": paymentEnabled, "currencySymbol": currencySymbol, "client:component-hydration": "load", "client:component-path": "/Users/bobanpepic/trainedby/src/components/TrainerProfile", "client:component-export": "default" })) })}`;
}, "/Users/bobanpepic/trainedby/src/pages/[slug].astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/[slug].astro";
const $$url = "/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
