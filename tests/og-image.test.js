// tests/og-image.test.js
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test('OG image endpoint returns a PNG for a known trainer slug', async () => {
  const res = await fetch(`${BASE_URL}/og/sarah-al-mansoori.png`);
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('image/png');
  // Cache-Control must be present and well-formed
  expect(res.headers.get('cache-control')).toMatch(/public.*max-age/);
  const buf = await res.arrayBuffer();
  // PNG magic bytes: 89 50 4E 47
  const bytes = new Uint8Array(buf.slice(0, 4));
  expect(bytes[0]).toBe(0x89);
  expect(bytes[1]).toBe(0x50);
  expect(bytes[2]).toBe(0x4E);
  expect(bytes[3]).toBe(0x47);
  // Must be a real PNG, not an empty/trivial response
  expect(buf.byteLength).toBeGreaterThan(1000);
  // Note: we cannot assert trainer-specific content differs from the fallback in CI
  // because both paths hit Supabase — without DB access the fallback values are used
  // and both images render identically. The test above (byteLength > 1000) is
  // sufficient to confirm a valid image was generated.
});

test('OG image endpoint returns 200 for unknown slug (fallback image)', async () => {
  const res = await fetch(`${BASE_URL}/og/this-trainer-does-not-exist.png`);
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('image/png');
  expect(res.headers.get('cache-control')).toMatch(/public.*max-age/);
});
