import type { APIRoute } from 'astro';
import satori from 'satori';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

let fontData: ArrayBuffer | null = null;
let wasmInitialized = false;

async function ensureInit() {
  if (!wasmInitialized) {
    const wasmPath = fileURLToPath(
      new URL('../../../node_modules/@resvg/resvg-wasm/index_bg.wasm', import.meta.url)
    );
    const wasmBuffer = readFileSync(wasmPath);
    await initWasm(wasmBuffer);
    wasmInitialized = true;
  }
  if (!fontData) {
    const res = await fetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZJhiI2B.woff'
    );
    fontData = await res.arrayBuffer();
  }
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response('Not found', { status: 404 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/trainers?slug=eq.${encodeURIComponent(slug)}&select=name,specialties,avatar_url,avg_rating,review_count&limit=1`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
  );
  if (!res.ok) return new Response('Not found', { status: 404 });
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return new Response('Not found', { status: 404 });

  const trainer = data[0];
  const name: string = trainer.name || 'Trainer';
  const specialty: string = Array.isArray(trainer.specialties)
    ? trainer.specialties[0]
    : (trainer.specialties || 'Personal Trainer');
  const avatar: string | null = trainer.avatar_url || null;
  const rating: string | null = trainer.avg_rating != null ? Number(trainer.avg_rating).toFixed(1) : null;
  const reviewCount: number = trainer.review_count ?? 0;

  await ensureInit();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          padding: '60px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex', alignItems: 'center',
                      background: '#FF5C00', borderRadius: '8px',
                      padding: '6px 14px', width: 'fit-content',
                      color: '#fff', fontSize: '18px', fontWeight: 800,
                    },
                    children: 'TrainedBy',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#ffffff', fontSize: '56px', fontWeight: 800, lineHeight: 1.1 },
                    children: name,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: 'rgba(255,255,255,0.6)', fontSize: '26px', fontWeight: 400 },
                    children: specialty,
                  },
                },
                ...(rating && reviewCount > 0 ? [{
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },
                    children: [
                      {
                        type: 'div',
                        props: { style: { color: '#FF5C00', fontSize: '22px', fontWeight: 700 }, children: `★ ${rating}` },
                      },
                      {
                        type: 'div',
                        props: { style: { color: 'rgba(255,255,255,0.4)', fontSize: '18px' }, children: `(${reviewCount} reviews)` },
                      },
                    ],
                  },
                }] : []),
                {
                  type: 'div',
                  props: {
                    style: { color: 'rgba(255,255,255,0.35)', fontSize: '16px', marginTop: '16px' },
                    children: '✓ Verified Trainer',
                  },
                },
              ],
            },
          },
          ...(avatar ? [{
            type: 'img',
            props: {
              src: avatar,
              style: {
                width: '260px',
                height: '260px',
                borderRadius: '130px',
                objectFit: 'cover',
                alignSelf: 'center',
              },
            },
          }] : []),
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: fontData!, weight: 800, style: 'normal' }],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
