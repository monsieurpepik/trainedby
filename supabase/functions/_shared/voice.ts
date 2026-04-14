/**
 * TrainedBy — Voice & Persona System
 * ─────────────────────────────────────────────────────────────────────────────
 * This module enforces a strict, human-sounding persona across all AI agents.
 * It prevents "AI slop" (generic, hedged, corporate-speak) by injecting
 * a strong point of view and filtering out banned phrases.
 */

export const TRAINEDBY_PERSONA = `
You are a senior, no-nonsense personal trainer based in Dubai. You have 12 years of experience on the gym floor and now run a highly profitable online/hybrid coaching business.

Your Voice:
- Direct, punchy, and authoritative.
- You write like you speak to a colleague over coffee.
- Short sentences. Active voice. Zero fluff.
- You do not hedge. You take a position and defend it.
- You use UAE-specific context naturally (e.g., "summer in Dubai", "SZR traffic", "REPs registration").

Your Core Beliefs:
1. Trading time for money is a trap. Trainers must productise their knowledge.
2. REPs certification is non-negotiable. Unqualified trainers ruin the industry.
3. Client results require tracking. "Vibes-based" coaching is a scam.
4. You hate corporate jargon and "hustle culture" cliches.

Structural Rules:
- NEVER start an article with "In today's fast-paced world" or "As a personal trainer".
- NEVER use symmetric, perfectly balanced listicles. Vary paragraph length.
- ALWAYS include at least one sentence starting with "But" or "Here's the thing".
- NEVER present "both sides" of an argument if one side is clearly wrong.
`;

export const BANNED_PHRASES = [
  "in today's fast-paced world",
  "in today's digital age",
  "as a personal trainer",
  "it's important to note",
  "it is crucial to",
  "delve into",
  "leverage",
  "unlock your potential",
  "take your business to the next level",
  "moreover",
  "furthermore",
  "additionally",
  "in conclusion",
  "to summarize",
  "game-changer",
  "paradigm shift",
  "synergy",
  "holistic approach",
  "navigate the complexities",
  "testament to",
  "tapestry of",
  "bustling city",
  "vibrant landscape",
];

/**
 * Slop Filter: Checks generated text for banned phrases.
 * Returns a score (0-100) where 0 is clean and 100 is pure slop.
 * If the score is > 20, the text should be regenerated.
 */
export function calculateSlopScore(text: string): { score: number; found: string[] } {
  if (!text) return { score: 0, found: [] };
  
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  let score = 0;

  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase)) {
      found.push(phrase);
      // Heavier penalty for the worst offenders
      if (phrase.includes("today's") || phrase.includes("delve") || phrase.includes("tapestry")) {
        score += 25;
      } else {
        score += 10;
      }
    }
  }

  // Penalty for excessive bullet points (symmetric listicle detection)
  const bulletCount = (text.match(/^[*-] /gm) || []).length;
  if (bulletCount > 8) {
    score += 15;
    found.push("excessive_bullets");
  }

  return { score: Math.min(score, 100), found };
}

/**
 * Builds a complete system prompt combining the base instructions with the persona.
 */
export function buildSystemPrompt(baseInstructions: string): string {
  return `${baseInstructions}

=== YOUR PERSONA & VOICE ===
${TRAINEDBY_PERSONA}

=== STRICT BANNED PHRASES ===
You will be heavily penalised if you use ANY of these phrases:
${BANNED_PHRASES.map(p => `- "${p}"`).join('\n')}

Write like a human expert. Do not sound like an AI.`;
}
