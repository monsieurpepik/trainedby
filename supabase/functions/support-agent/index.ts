/**
 * TrainedBy — Support Agent v3 (Claude)
 * ─────────────────────────────────────────────────────────────────────────────
 * RAG chatbot powered by Claude 3.5 Haiku.
 * Answers trainer questions like a knowledgeable colleague, not a corporate bot.
 *
 * POST /functions/v1/support-agent   — answer a trainer question
 * GET  /functions/v1/support-agent   — health check
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { calculateSlopScore } from '../_shared/voice.ts';
import { callClaude } from '../_shared/claude.ts';
import { getLocale, getMarket, getEmailCopy } from '../_shared/locale.ts';

const log = createLogger('support-agent');

// FALLBACK_KB is now built per-locale at request time — see buildFallbackKB()
function buildFallbackKB(market: { brandName: string; domain: string; pricingTier: string; certBody: string; language: string; languageCode: string; country: string }): Record<string, string> {
  const supportEmail = `support@${market.domain}`;
  const profileDomain = market.domain;
  const isEs = market.languageCode === 'es';
  const isFr = market.languageCode === 'fr';
  const isIt = market.languageCode === 'it';
  return {
    pricing: isEs
      ? `${market.brandName} tiene dos planes: Gratis (perfil verificado, listado público, analíticas básicas) y Pro (${market.pricingTier} — asistente de IA personal, paquetes ilimitados, posicionamiento prioritario, analíticas avanzadas). Cambia de plan cuando quieras desde tu panel.`
      : isFr
      ? `${market.brandName} propose deux offres : Gratuit (profil vérifié, liste publique, analytics de base) et Pro (${market.pricingTier} — assistant IA personnel, forfaits illimités, placement prioritaire, analytics avancés). Changez d'offre à tout moment depuis votre tableau de bord.`
      : isIt
      ? `${market.brandName} ha due piani: Gratuito (profilo verificato, lista pubblica, analisi di base) e Pro (${market.pricingTier} — assistente AI personale, pacchetti illimitati, posizionamento prioritario, analisi avanzate). Cambia piano quando vuoi dalla tua dashboard.`
      : `${market.brandName} has two tiers: Free (verified profile, public listing, basic analytics — no card needed) and Pro (${market.pricingTier} — AI personal assistant, unlimited packages, priority listing, advanced analytics). Upgrade or downgrade any time from your dashboard.`,
    certification: isEs
      ? `${market.certBody} es el registro oficial de entrenadores en ${market.country}. ${market.brandName} verifica tu estado automáticamente al registrarte. Tu insignia aparece en tu perfil público y se actualiza en 24 horas.`
      : isFr
      ? `${market.certBody} est le registre officiel des coachs en ${market.country}. ${market.brandName} vérifie votre statut automatiquement à l'inscription. Votre badge apparaît sur votre profil public et se met à jour sous 24 heures.`
      : isIt
      ? `${market.certBody} è il registro ufficiale degli allenatori in ${market.country}. ${market.brandName} verifica il tuo stato automaticamente all'iscrizione. Il tuo badge appare sul tuo profilo pubblico e si aggiorna entro 24 ore.`
      : `${market.certBody} is the official fitness register in ${market.country}. ${market.brandName} verifies your status automatically at signup. Your badge appears on your public profile and updates within 24 hours.`,
    magic_link: isEs
      ? `${market.brandName} usa inicio de sesión sin contraseña. Introduce tu email, recibe un enlace único, haz clic. Los enlaces caducan en 15 minutos. ¿No está en tu bandeja de entrada? Revisa el spam.`
      : isFr
      ? `${market.brandName} utilise une connexion sans mot de passe. Entrez votre email, recevez un lien unique, cliquez dessus. Les liens expirent en 15 minutes. Pas dans votre boîte de réception ? Vérifiez les spams.`
      : isIt
      ? `${market.brandName} usa l'accesso senza password. Inserisci la tua email, ricevi un link unico, cliccaci sopra. I link scadono in 15 minuti. Non è nella tua casella di posta? Controlla lo spam.`
      : `${market.brandName} uses passwordless login. Enter your email, get a one-time link, click it. Links expire in 15 minutes. Not in your inbox? Check spam.`,
    profile: isEs
      ? `Tu URL de perfil es ${profileDomain}/tunombre. Personaliza el slug, bio, especialidades, certificaciones y redes sociales desde Editar Perfil. La insignia de ${market.certBody} se añade automáticamente tras la verificación.`
      : isFr
      ? `Votre URL de profil est ${profileDomain}/votrenom. Personnalisez le slug, la bio, les spécialités, les certifications et les réseaux sociaux depuis Modifier le profil. Le badge ${market.certBody} s'ajoute automatiquement après vérification.`
      : isIt
      ? `Il tuo URL del profilo è ${profileDomain}/tuonome. Personalizza slug, bio, specialità, certificazioni e social da Modifica Profilo. Il badge ${market.certBody} viene aggiunto automaticamente dopo la verifica.`
      : `Your profile URL is ${profileDomain}/yourname. Customise slug, bio, specialities, certifications, and social links from Edit Profile. ${market.certBody} badge adds automatically after verification.`,
    cancel: isEs
      ? `Cancela Pro en cualquier momento desde Configuración → Suscripción. El perfil vuelve al plan Gratis al final del período de facturación. Tus datos se conservan.`
      : isFr
      ? `Annulez Pro à tout moment depuis Paramètres → Abonnement. Le profil revient au niveau Gratuit à la fin de la période de facturation. Vos données sont conservées.`
      : isIt
      ? `Annulla Pro in qualsiasi momento da Impostazioni → Abbonamento. Il profilo torna al livello Gratuito alla fine del periodo di fatturazione. I tuoi dati vengono conservati.`
      : `Cancel Pro any time from Settings → Subscription. Profile reverts to Free at end of billing period. Your data is preserved.`,
    support: isEs
      ? `Problemas urgentes: ${supportEmail}. Respuesta en 4 horas, lun-vie 9:00-18:00.`
      : isFr
      ? `Problèmes urgents : ${supportEmail}. Réponse sous 4 heures, lun-ven 9h-18h.`
      : isIt
      ? `Problemi urgenti: ${supportEmail}. Risposta entro 4 ore, lun-ven 9:00-18:00.`
      : `Urgent issues: ${supportEmail}. Response within 4 hours, Mon-Fri 9am-6pm.`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });
  if (req.method === 'GET') return jsonResponse({ status: 'ok', agent: 'support-agent', version: '3.0.0', model: 'claude-3-5-haiku' });
  if (req.method === 'POST') return handleQuestion(req);
  return errorResponse('Method not allowed', 405);
});

async function handleQuestion(req: Request): Promise<Response> {
  const start = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { question, trainer_id, conversation_id, locale: bodyLocale, domain } = body as {
      question: string;
      trainer_id?: string;
      conversation_id?: string;
      locale?: string;
      domain?: string;
    };

    // Detect locale from body, domain, or request origin
    const locale = getLocale(bodyLocale || domain || req.headers.get('origin'));
    const market = getMarket(locale);
    const isEnglish = market.languageCode === 'en';

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return errorResponse('Missing or invalid question', 400, 'VALIDATION_ERROR');
    }

    const trimmedQuestion = question.trim().substring(0, 500);

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) return errorResponse('Support agent not configured', 500);

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── 1. Retrieve knowledge chunks ──────────────────────────────────────────
    let context = '';

    try {
      const searchWords = trimmedQuestion
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 3);

      let docs: Array<{ title: string; content: string }> | null = null;

      for (const word of searchWords) {
        const { data } = await sb
          .from('support_docs')
          .select('title, content')
          .or(`title.ilike.%${word}%,content.ilike.%${word}%`)
          .limit(3);
        if (data && data.length > 0) { docs = data; break; }
      }

      if (!docs || docs.length === 0) {
        const { data } = await sb.from('support_docs').select('title, content').limit(3);
        docs = data;
      }

      if (docs && docs.length > 0) {
        context = docs.map((d: { title: string; content: string }) =>
          `${d.title}: ${d.content}`
        ).join('\n\n');
      }
    } catch (_dbErr) {
      // Fall through to fallback KB
    }

    // Fallback KB — built per-locale
    if (!context) {
      const fallbackKB = buildFallbackKB(market);
      const q = trimmedQuestion.toLowerCase();
      const matched = Object.entries(fallbackKB)
        .filter(([key]) => q.includes(key.replace(/_/g, ' ')) || q.includes(key))
        .map(([, val]) => val);

      if (matched.length === 0) {
        const qWords = new Set(q.split(/\s+/));
        const scored = Object.entries(fallbackKB).map(([key, val]) => {
          const overlap = val.toLowerCase().split(/\s+/).filter(w => qWords.has(w)).length;
          return { key, val, overlap };
        });
        scored.sort((a, b) => b.overlap - a.overlap);
        matched.push(...scored.slice(0, 3).map(s => s.val));
      }

      context = matched.slice(0, 3).join('\n\n');
    }
    // ── 2. Build system prompt (locale-aware) ─────────────────────────────────────────
    const supportEmail = `support@${market.domain}`;
    const platformName = market.brandName;
    const languageInstruction = isEnglish
      ? ''
      : `IMPORTANT: You MUST respond entirely in ${market.language}. Do not use English.`;

    const systemPrompt = `You are the ${platformName} support assistant. You know this platform inside out — you've helped hundreds of personal trainers in ${market.country} get set up.

Your tone: Direct, warm, no-nonsense. Answer like a knowledgeable colleague, not a customer service bot.
${languageInstruction}

Hard rules:
- Answer in 2-4 sentences MAX unless a short list genuinely helps clarity
- Never start with "Great question!", "Certainly!", "I'd be happy to help", or any filler
- Never hedge with "it might be worth considering" or "you may want to"
- If the answer isn't in the context, say exactly: "I don't have that info — email ${supportEmail} and they'll sort you out."
- Use bold only for key prices or numbers (e.g. **${market.pricingTier}**)
- Never invent features or prices

Context (answer ONLY from this):
${context}`;
    // ── 3. Call Claude ────────────────────────────────────────────────────────
    let answer = '';
    try {
      const response = await callClaude(anthropicKey, {
        model: 'claude-haiku-4-5',
        system: systemPrompt,
        messages: [{ role: 'user', content: trimmedQuestion }],
        max_tokens: 300,
        temperature: 0.3,
      });
      answer = response.text;
      log.info('Claude response', { input_tokens: response.input_tokens, output_tokens: response.output_tokens });
    } catch (llmErr) {
      log.warn('Claude call failed — using KB fallback', { error: String(llmErr) });
    }

    // KB-only fallback
    if (!answer) {
      if (context) {
        const firstChunk = context.split('\n\n')[0].replace(/^[^:]+:\s*/, '').trim();
        answer = firstChunk.length > 20
          ? firstChunk
          : "I don't have that info — email support@trainedby.ae and they'll sort you out.";
      } else {
        answer = "I don't have that info — email support@trainedby.ae and they'll sort you out.";
      }
    }

    // ── 4. Slop check ─────────────────────────────────────────────────────────
    const { score: slopScore, found: slopFound } = calculateSlopScore(answer);
    if (slopScore > 20) {
      log.warn('High slop score in support response', { score: slopScore, found: slopFound });
    }

    // ── 5. Log conversation ───────────────────────────────────────────────────
    const convId = conversation_id ?? crypto.randomUUID();
    try {
      await sb.from('support_conversations').insert({
        conversation_id: convId,
        trainer_id: trainer_id ?? null,
        question: trimmedQuestion,
        answer,
        context_used: context.substring(0, 500),
        duration_ms: Date.now() - start,
        created_at: new Date().toISOString(),
      });
    } catch (convErr) {
      log.warn('Failed to log conversation', { error: String(convErr) });
    }

    log.info('Support question answered', {
      duration_ms: Date.now() - start,
      slop_score: slopScore,
    });

    return jsonResponse({
      answer,
      conversation_id: convId,
      sources: context ? ['TrainedBy Knowledge Base'] : [],
    });
  } catch (err) {
    log.exception(err);
    return errorResponse('Internal error', 500);
  }
}
