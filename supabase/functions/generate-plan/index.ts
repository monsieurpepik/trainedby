import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlanRequest {
  type: "diet" | "workout" | "both";
  // Client profile
  name: string;
  age: number;
  gender: "male" | "female";
  weight_kg: number;
  height_cm: number;
  goal: "fat_loss" | "muscle_gain" | "endurance" | "general_fitness" | "sport_performance";
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  training_days_per_week: number;
  // Diet specifics
  dietary_restrictions?: string[]; // e.g. ["halal", "lactose_free", "vegetarian"]
  food_allergies?: string[];
  // Workout specifics
  equipment?: "gym_full" | "gym_basic" | "home" | "outdoor";
  fitness_level?: "beginner" | "intermediate" | "advanced";
  injuries?: string[];
  // Trainer branding
  trainer_name?: string;
  trainer_slug?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PlanRequest = await req.json();
    const {
      type, name, age, gender, weight_kg, height_cm,
      goal, activity_level, training_days_per_week,
      dietary_restrictions = [], food_allergies = [],
      equipment = "gym_full", fitness_level = "intermediate",
      injuries = [], trainer_name, trainer_slug,
    } = body;

    // ── 1. PERPLEXITY SONAR: Source credible, up-to-date science ──
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // Build BMR and TDEE for context
    const bmr = gender === "male"
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2, lightly_active: 1.375,
      moderately_active: 1.55, very_active: 1.725,
    };
    const tdee = Math.round(bmr * activityMultipliers[activity_level]);

    let perplexityContext = "";

    if (PERPLEXITY_API_KEY) {
      // Use Perplexity Sonar to pull current evidence-based recommendations
      const sonarQuery = type === "diet"
        ? `Evidence-based ${goal.replace("_", " ")} diet recommendations for a ${age}-year-old ${gender}, ${weight_kg}kg, TDEE ${tdee} kcal. Include macronutrient ratios, meal timing, and UAE/MENA food sources. Cite sports nutrition journals.`
        : type === "workout"
        ? `Evidence-based ${fitness_level} ${goal.replace("_", " ")} training programme for ${training_days_per_week} days/week with ${equipment.replace("_", " ")} equipment. Include progressive overload principles and recovery. Cite exercise science research.`
        : `Evidence-based ${goal.replace("_", " ")} training and nutrition programme for ${age}-year-old ${gender}, ${weight_kg}kg. ${training_days_per_week} training days, TDEE ${tdee} kcal. Cite sports science journals.`;

      const sonarRes = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: "You are a sports science researcher. Provide concise, evidence-based summaries with citations from peer-reviewed journals (NSCA, ACSM, ISSN guidelines). Focus on practical, actionable recommendations.",
            },
            { role: "user", content: sonarQuery },
          ],
          max_tokens: 800,
          return_citations: true,
        }),
      });

      if (sonarRes.ok) {
        const sonarData = await sonarRes.json();
        perplexityContext = sonarData.choices?.[0]?.message?.content || "";
        // Extract citations if available
        const citations = sonarData.citations || [];
        if (citations.length > 0) {
          perplexityContext += `\n\nSources: ${citations.slice(0, 5).join(", ")}`;
        }
      }
    }

    // ── 2. OPENAI GPT-4.1: Generate the structured plan ──
    const goalCalories: Record<string, number> = {
      fat_loss: tdee - 500,
      muscle_gain: tdee + 300,
      endurance: tdee + 100,
      general_fitness: tdee,
      sport_performance: tdee + 200,
    };
    const targetCalories = goalCalories[goal];

    const systemPrompt = `You are an elite personal trainer and registered sports dietitian creating professional, personalised plans for clients in the UAE. 
You produce structured, actionable plans that trainers can deliver to their clients with their own branding.
Always include specific foods common in the UAE/MENA region (dates, labneh, grilled chicken shawarma, hummus, etc.) when relevant.
Format your response as valid JSON only — no markdown, no explanation outside the JSON.`;

    const userPrompt = `Create a ${type === "both" ? "combined diet and workout" : type} plan for:
- Name: ${name}
- Age: ${age}, Gender: ${gender}
- Weight: ${weight_kg}kg, Height: ${height_cm}cm
- Goal: ${goal.replace("_", " ")}
- TDEE: ${tdee} kcal/day, Target: ${targetCalories} kcal/day
- Activity level: ${activity_level.replace("_", " ")}
- Training days/week: ${training_days_per_week}
- Equipment: ${equipment.replace("_", " ")}
- Fitness level: ${fitness_level}
- Dietary restrictions: ${dietary_restrictions.join(", ") || "none"}
- Food allergies: ${food_allergies.join(", ") || "none"}
- Injuries/limitations: ${injuries.join(", ") || "none"}
- Trainer: ${trainer_name || "TrainedBy Coach"}

${perplexityContext ? `Evidence-based context to incorporate:\n${perplexityContext}\n` : ""}

Return a JSON object with this exact structure:
{
  "client_name": string,
  "trainer_name": string,
  "generated_date": string (today's date),
  "goal_summary": string (2-3 sentences explaining the approach),
  "science_note": string (1-2 sentences citing the evidence base, e.g. ACSM/ISSN guidelines),
  "citations": string[] (up to 3 credible sources),
  ${type !== "workout" ? `"diet_plan": {
    "daily_calories": number,
    "macros": { "protein_g": number, "carbs_g": number, "fat_g": number },
    "hydration_ml": number,
    "meal_timing_note": string,
    "days": [
      {
        "day": string,
        "meals": [
          { "meal": string, "time": string, "foods": string[], "calories": number, "protein_g": number }
        ]
      }
    ]
  },` : ""}
  ${type !== "diet" ? `"workout_plan": {
    "programme_name": string,
    "duration_weeks": number,
    "sessions_per_week": number,
    "progressive_overload_note": string,
    "weeks": [
      {
        "week": number,
        "sessions": [
          {
            "day": string,
            "focus": string,
            "duration_min": number,
            "exercises": [
              { "name": string, "sets": number, "reps": string, "rest_sec": number, "notes": string }
            ]
          }
        ]
      }
    ]
  },` : ""}
  "supplement_recommendations": [
    { "supplement": string, "dose": string, "timing": string, "evidence_level": "A" | "B" | "C" }
  ],
  "weekly_check_in_questions": string[]
}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiRes.json();
    const planJson = JSON.parse(openaiData.choices[0].message.content);

    // ── 3. Attach metadata ──
    const response = {
      success: true,
      plan: planJson,
      meta: {
        model_used: "gpt-4.1-mini",
        research_grounded: !!perplexityContext,
        tdee_calculated: tdee,
        target_calories: targetCalories,
        trainer_profile_url: trainer_slug ? `https://trainedby.ae/${trainer_slug}` : null,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
