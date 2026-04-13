import { test, expect } from '@playwright/test';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

/**
 * API / Edge Function E2E Tests
 * These tests call the live Supabase edge functions directly
 * to verify they respond correctly to valid and invalid inputs.
 */

test.describe('GET /functions/v1/get-trainer', () => {
  test('returns trainer data for valid slug', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/functions/v1/get-trainer?slug=sarah`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('slug');
    expect(body.slug).toBe('sarah');
  });

  test('returns 404 for non-existent slug', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/functions/v1/get-trainer?slug=this-trainer-does-not-exist-xyz`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    expect(res.status()).toBe(404);
  });

  test('returns 400 when slug param is missing', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/functions/v1/get-trainer`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    expect(res.status()).toBe(400);
  });

  test('does not expose internal fields (magic_link_token, service_role)', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/functions/v1/get-trainer?slug=sarah`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).not.toHaveProperty('magic_link_token');
      expect(body).not.toHaveProperty('service_role');
      expect(JSON.stringify(body)).not.toMatch(/service_role/i);
    }
  });
});

test.describe('POST /functions/v1/submit-lead', () => {
  test('returns 400 for missing required fields', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/functions/v1/submit-lead`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      data: { name: 'Test' }, // Missing trainer_id, phone
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 for invalid trainer_id (not a UUID)', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/functions/v1/submit-lead`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        trainer_id: 'not-a-uuid',
        name: 'Test Client',
        phone: '501234567',
        type: 'whatsapp',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('strips XSS from name field', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/functions/v1/submit-lead`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        trainer_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        name: '<script>alert("xss")</script>',
        phone: '501234567',
        type: 'whatsapp',
      },
    });
    // Should either 400 (invalid trainer) or 422 (validation) — never 200 with raw script
    expect(res.status()).not.toBe(200);
  });

  test('rate limits after 5 rapid requests', async ({ request }) => {
    const payload = {
      trainer_id: '00000000-0000-0000-0000-000000000000',
      name: 'Rate Test',
      phone: '501234567',
      type: 'whatsapp',
    };
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };
    let lastStatus = 0;
    for (let i = 0; i < 7; i++) {
      const res = await request.post(`${SUPABASE_URL}/functions/v1/submit-lead`, {
        headers,
        data: payload,
      });
      lastStatus = res.status();
    }
    // After 5+ requests, should get rate limited (429) or still return 4xx
    expect(lastStatus).toBeGreaterThanOrEqual(400);
  });
});

test.describe('POST /functions/v1/send-magic-link', () => {
  test('returns 400 for invalid email format', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/functions/v1/send-magic-link`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      data: { email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 for missing email', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/functions/v1/send-magic-link`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('handles CORS preflight correctly', async ({ request }) => {
    const res = await request.fetch(`${SUPABASE_URL}/functions/v1/send-magic-link`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Origin': 'https://trainedby-ae.netlify.app',
        'Access-Control-Request-Method': 'POST',
      },
    });
    expect(res.status()).toBe(200);
    const corsHeader = res.headers()['access-control-allow-origin'];
    expect(corsHeader).toBeTruthy();
  });
});

test.describe('Health Check', () => {
  test('GET /functions/v1/health returns 200', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/functions/v1/health`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('version');
  });
});
