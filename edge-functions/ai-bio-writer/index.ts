import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { name, specialties, certifications, years_experience, training_modes, gym_name, city } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'name is required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 503, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    const prompt = `Write a compelling, professional personal trainer bio for the following trainer. 
The bio should be 3-4 sentences, written in first person, confident but not arrogant, and focused on results and transformation. 
Do not use generic phrases like "passionate about fitness". Make it specific and authentic.

Trainer details:
- Name: ${name}
- Specialties: ${(specialties || []).join(', ') || 'General fitness'}
- Certifications: ${(certifications || []).join(', ') || 'Certified Personal Trainer'}
- Years of experience: ${years_experience || 'Several years'}
- Training modes: ${(training_modes || ['in-person']).join(' and ')}
- Location: ${gym_name ? `${gym_name}, ` : ''}${city || 'Dubai'}

Write only the bio text, no labels or formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const result = await response.json();
    const bio = result.choices?.[0]?.message?.content?.trim();

    if (!bio) throw new Error('AI did not return a bio');

    return new Response(JSON.stringify({ bio }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
