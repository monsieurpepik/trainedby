// supabase/functions/generate-missions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callClaudeJSON } from "../_shared/claude.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MissionDraft {
  day: number;
  title: string;
  description: string;
  type: 'run' | 'workout' | 'nutrition' | 'recovery' | 'mindset' | 'other';
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { club_id } = await req.json();
  if (!club_id) {
    return new Response(JSON.stringify({ error: "club_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { data: club, error: clubErr } = await sb
    .from("clubs")
    .select("id, goal, duration_days")
    .eq("id", club_id)
    .single();

  if (clubErr || !club) {
    return new Response(JSON.stringify({ error: "Club not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

  const missions = await callClaudeJSON<MissionDraft[]>(apiKey, {
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: `You are a certified fitness coach with 10 years of programming experience.
You write precise, progressive, behavior-focused daily missions.
Each mission must be:
- Simple: one clear action, no ambiguity
- Binary: done or not done — no partial credit
- Behavior-focused: the action itself, not educational content
- Realistic: achievable by a motivated beginner

Return ONLY a valid JSON array. No markdown, no explanation.`,
    messages: [{
      role: 'user',
      content: `Goal: ${club.goal}
Duration: ${club.duration_days} days

Create exactly ${club.duration_days} daily missions. Return a JSON array:
[{"day": 1, "title": "...", "description": "...", "type": "run|workout|nutrition|recovery|mindset|other"}, ...]

Rules:
- Week 1 (days 1-7): foundation — light, accessible, build the habit
- Week 2 (days 8-14): build — moderate intensity, establish consistency
- Week 3 (days 15-21): peak — highest challenge of the program
- Week 4 (days 22-30): consolidate — sustainable habits, reflect on progress
- Never repeat the same mission on consecutive days
- Mix types across the week — no more than 3 consecutive days of same type
- Descriptions are 1 sentence max, plain language, no jargon
- Titles are 5 words max`
    }]
  });

  if (!Array.isArray(missions) || missions.length !== club.duration_days) {
    return new Response(JSON.stringify({ error: "AI returned invalid mission count", got: Array.isArray(missions) ? missions.length : typeof missions }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const rows = missions.map((m) => ({
    club_id,
    day_number: m.day,
    title: m.title,
    description: m.description,
    type: m.type,
    ai_draft: true,
    edited_by_trainer: false,
  }));

  const { error: insertErr } = await sb.from("missions").insert(rows);
  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, count: rows.length }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
