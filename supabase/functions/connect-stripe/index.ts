import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS_HEADERS, jsonResponse, errorResponse, unauthorizedError, notFoundError, serverError } from '../_shared/errors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Auth: validate magic link Bearer token
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return unauthorizedError();

    const { data: link } = await sb
      .from('magic_links')
      .select('trainer_id, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!link?.trainer_id) return unauthorizedError();

    const { trainer_id } = await req.json();
    if (!trainer_id) return errorResponse('trainer_id is required', 400, 'VALIDATION_ERROR');
    if (link.trainer_id !== trainer_id) return errorResponse('Forbidden', 403, 'FORBIDDEN');

    // Load trainer
    const { data: trainer } = await sb
      .from('trainers')
      .select('id, name, email, stripe_connect_account_id')
      .eq('id', trainer_id)
      .single();

    if (!trainer) return notFoundError('Trainer');

    // Get or create Stripe Connect Express account
    let accountId = trainer.stripe_connect_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: trainer.email,
        capabilities: { transfers: { requested: true } },
        metadata: { trainer_id },
      });
      accountId = account.id;
      await sb.from('trainers').update({ stripe_connect_account_id: accountId }).eq('id', trainer_id);
    }

    // Generate onboarding URL
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${Deno.env.get('APP_URL')}/dashboard?stripe=start`,
      return_url: `${Deno.env.get('APP_URL')}/dashboard?stripe=return`,
      type: 'account_onboarding',
    });

    return jsonResponse({ url: accountLink.url });
  } catch (err) {
    console.error('[connect-stripe] error:', err);
    return serverError('Failed to create Stripe Connect account');
  }
});
