// tests/edge-functions-payment.test.js
// Run with: SUPABASE_FUNCTIONS_URL=... SUPABASE_ANON_KEY=... pnpm test -- tests/edge-functions-payment.test.js

const BASE_URL = process.env.SUPABASE_FUNCTIONS_URL || 'http://localhost:54321/functions/v1';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

test('payment-router returns 401 for unauthenticated com market request', async () => {
  const res = await fetch(`${BASE_URL}/payment-router`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer INVALID_TOKEN`,
    },
    body: JSON.stringify({ trainer_id: 'test', plan: 'pro', billing: 'monthly', market: 'com' }),
  });
  // Without a valid trainer session, expect auth rejection (401), not a server error (500)
  expect(res.status).toBe(401);
});
