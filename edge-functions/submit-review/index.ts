import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { trainer_id, client_name, client_phone, rating, review_text, goal_achieved, months_trained } = body;

    if (!trainer_id || !client_name || !rating) {
      return new Response(JSON.stringify({ error: 'trainer_id, client_name, rating are required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'rating must be 1-5' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicate review from same phone
    if (client_phone) {
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('trainer_id', trainer_id)
        .eq('client_phone', client_phone)
        .single();

      if (existing) {
        return new Response(JSON.stringify({ error: 'You have already submitted a review for this trainer.' }), {
          status: 409, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
    }

    // Insert review (unverified by default — admin verifies)
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        trainer_id,
        client_name,
        client_phone: client_phone || null,
        rating,
        review_text: review_text || null,
        goal_achieved: goal_achieved || null,
        months_trained: months_trained || null,
        verified: false // Admin must verify
      })
      .select()
      .single();

    if (error) throw error;

    // Update trainer avg_rating and review_count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('trainer_id', trainer_id)
      .eq('verified', true);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((a, b) => a + b.rating, 0) / allReviews.length;
      await supabase
        .from('trainers')
        .update({ avg_rating: avg, review_count: allReviews.length })
        .eq('id', trainer_id);
    }

    return new Response(JSON.stringify({ success: true, review_id: review.id, message: 'Review submitted and pending verification.' }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
