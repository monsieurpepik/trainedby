import satori from 'satori';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = "https://mezhtdbfyvkshpuplqqw.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";
let fontData = null;
let initPromise = null;
async function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      const wasmPath = fileURLToPath(
        new URL("../../../node_modules/@resvg/resvg-wasm/index_bg.wasm", import.meta.url)
      );
      await initWasm(readFileSync(wasmPath));
      const fontRes = await fetch(
        "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZJhiI2B.woff"
      );
      if (!fontRes.ok) throw new Error(`Font fetch failed: ${fontRes.status}`);
      fontData = await fontRes.arrayBuffer();
    })();
  }
  await initPromise;
}
function buildLayout(name, specialty, rating, reviewCount, avatar) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "1200px",
        height: "630px",
        background: "#0a0a0a",
        padding: "60px",
        fontFamily: "Inter"
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "16px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    background: "#FF5C00",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    width: "fit-content",
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: 800
                  },
                  children: "TrainedBy"
                }
              },
              {
                type: "div",
                props: {
                  style: { color: "#ffffff", fontSize: "56px", fontWeight: 800, lineHeight: 1.1 },
                  children: name
                }
              },
              {
                type: "div",
                props: {
                  style: { color: "rgba(255,255,255,0.6)", fontSize: "26px", fontWeight: 400 },
                  children: specialty
                }
              },
              ...rating && reviewCount > 0 ? [{
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" },
                  children: [
                    {
                      type: "div",
                      props: { style: { color: "#FF5C00", fontSize: "22px", fontWeight: 700 }, children: `★ ${rating}` }
                    },
                    {
                      type: "div",
                      props: { style: { color: "rgba(255,255,255,0.4)", fontSize: "18px" }, children: `(${reviewCount} reviews)` }
                    }
                  ]
                }
              }] : [],
              {
                type: "div",
                props: {
                  style: { color: "rgba(255,255,255,0.35)", fontSize: "16px", marginTop: "16px" },
                  children: "✓ Verified Trainer"
                }
              }
            ]
          }
        },
        ...avatar ? [{
          type: "img",
          props: {
            src: avatar,
            style: {
              width: "260px",
              height: "260px",
              borderRadius: "130px",
              objectFit: "cover",
              alignSelf: "center"
            }
          }
        }] : []
      ]
    }
  };
}
const GET = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response("Not found", { status: 404 });
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/trainers?slug=eq.${encodeURIComponent(slug)}&select=name,specialties,avatar_url,avg_rating,review_count&limit=1`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
  );
  if (!res.ok) return new Response("Not found", { status: 404 });
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return new Response("Not found", { status: 404 });
  const trainer = data[0];
  const name = trainer.name || "Trainer";
  const specialty = Array.isArray(trainer.specialties) ? trainer.specialties[0] : trainer.specialties || "Personal Trainer";
  const avatar = trainer.avatar_url || null;
  const rating = trainer.avg_rating != null ? Number(trainer.avg_rating).toFixed(1) : null;
  const reviewCount = trainer.review_count ?? 0;
  await ensureInit();
  async function renderPng(withAvatar) {
    const avatarSrc = withAvatar ? avatar : null;
    const svg = await satori(
      buildLayout(name, specialty, rating, reviewCount, avatarSrc),
      {
        width: 1200,
        height: 630,
        fonts: [{ name: "Inter", data: fontData, weight: 800, style: "normal" }]
      }
    );
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
    return resvg.render().asPng();
  }
  let png;
  try {
    png = await renderPng(true);
  } catch {
    try {
      png = await renderPng(false);
    } catch {
      return new Response("Image generation failed", { status: 500 });
    }
  }
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
