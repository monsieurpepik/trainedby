// supabase/functions/join-club/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { club_id, user_id, return_url } = await req.json();
  if (!club_id || !user_id) {
    return new Response(JSON.stringify({ error: "club_id and user_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { data: club } = await sb
    .from("clubs")
    .select("id, is_free, price_cents, max_members, status, name, slug")
    .eq("id", club_id)
    .single();

  if (!club || club.status !== 'active') {
    return new Response(JSON.stringify({ error: "Club not available" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Check max_members
  if (club.max_members) {
    const { count } = await sb
      .from("club_members")
      .select("id", { count: "exact", head: true })
      .eq("club_id", club_id)
      .eq("status", "active");
    if ((count ?? 0) >= club.max_members) {
      return new Response(JSON.stringify({ error: "Club is full" }), {
        status: 409, headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
  }

  // Check already a member
  const { data: existing } = await sb
    .from("club_members")
    .select("id")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ ok: true, already_member: true, checkout_url: null }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Free club: join immediately via service role
  if (club.is_free) {
    const { error: insertErr } = await sb
      .from("club_members")
      .insert({ club_id, user_id, status: "active" });
    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ ok: true, checkout_url: null }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Paid club: create Stripe Checkout session (one-time payment)
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://trainedby.com";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: club.price_cents!,
        product_data: { name: club.name },
      },
      quantity: 1,
    }],
    success_url: return_url
      ? `${return_url}?success=1&session_id={CHECKOUT_SESSION_ID}`
      : `${siteUrl}/clubs/${club.slug}?success=1`,
    cancel_url: return_url ?? `${siteUrl}/clubs/join/${club.slug}`,
    metadata: { club_id, user_id },
  });

  return new Response(JSON.stringify({ ok: true, checkout_url: session.url }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
