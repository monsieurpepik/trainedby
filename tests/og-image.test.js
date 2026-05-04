// tests/og-image.test.js
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test('OG image endpoint returns a PNG for a known trainer slug', async () => {
  const res = await fetch(`${BASE_URL}/og/sarah-al-mansoori.png`);
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('image/png');
  const buf = await res.arrayBuffer();
  // PNG magic bytes: 89 50 4E 47
  const bytes = new Uint8Array(buf.slice(0, 4));
  expect(bytes[0]).toBe(0x89);
  expect(bytes[1]).toBe(0x50);
  expect(bytes[2]).toBe(0x4E);
  expect(bytes[3]).toBe(0x47);
});

test('OG image endpoint returns 200 for unknown slug (fallback image)', async () => {
  const res = await fetch(`${BASE_URL}/og/this-trainer-does-not-exist.png`);
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('image/png');
});
