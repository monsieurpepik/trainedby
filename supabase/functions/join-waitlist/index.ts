import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRAND_NAMES: Record<string, string> = {
  ae: 'TrainedBy', uk: 'TrainedBy', com: 'TrainedBy', in: 'TrainedBy',
  fr: 'CoachéPar', it: 'AllenatoCon', es: 'EntrenaCon', mx: 'EntrenaCon',
};

const FROM_EMAILS: Record<string, string> = {
  ae: 'hello@trainedby.ae', uk: 'hello@trainedby.uk', com: 'hello@trainedby.com',
  in: 'hello@trainedby.in', fr: 'bonjour@coachepar.fr', it: 'ciao@allenaticon.it',
  es: 'hola@entrenacon.com', mx: 'hola@entrenacon.mx',
};

const CONFIRMATION_COPY: Record<string, { subject: string; body: string }> = {
  en: {
    subject: "You're on the list  -  we'll notify you when we launch",
    body: `<p>Thanks for joining the waitlist. You'll be the first to know when we launch in your market  -  and you'll get the early-bird price locked in.</p>
<p>In the meantime, feel free to check out what's already live on <a href="https://trainedby.ae">trainedby.ae</a>.</p>`,
  },
  fr: {
    subject: "Vous êtes sur la liste  -  nous vous préviendrons au lancement",
    body: `<p>Merci de rejoindre la liste d'attente. Vous serez le premier informé du lancement en France  -  avec le prix de lancement bloqué.</p>
<p>En attendant, découvrez ce qui est déjà en ligne sur <a href="https://trainedby.ae">trainedby.ae</a>.</p>`,
  },
  it: {
    subject: "Sei nella lista  -  ti avviseremo al lancio",
    body: `<p>Grazie per esserti unito alla lista d'attesa. Sarai il primo a sapere quando lanceremo in Italia  -  con il prezzo di lancio bloccato.</p>
<p>Nel frattempo, scopri cosa è già online su <a href="https://trainedby.ae">trainedby.ae</a>.</p>`,
  },
  es: {
    subject: "Estás en la lista  -  te avisaremos cuando lancemos",
    body: `<p>Gracias por unirte a la lista de espera. Serás el primero en saber cuando lancemos en tu mercado  -  con el precio de lanzamiento bloqueado.</p>
<p>Mientras tanto, descubre lo que ya está en línea en <a href="https://trainedby.ae">trainedby.ae</a>.</p>`,
  },
};

const LOCALE_MAP: Record<string, string> = {
  ae: 'en', uk: 'en', com: 'en', in: 'en',
  fr: 'fr', it: 'it', es: 'es', mx: 'es',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { email, name, market = 'ae', source_domain, role = 'trainer' } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Upsert into waitlist (ignore duplicate)
    const { error: dbError } = await supabase
      .from('market_waitlist')
      .upsert({ email, name, market, source_domain, role }, { onConflict: 'market,email' });

    if (dbError && !dbError.message.includes('duplicate')) {
      console.error('DB error:', dbError);
    }

    // Send confirmation email via Resend
    const locale = LOCALE_MAP[market] || 'en';
    const copy = CONFIRMATION_COPY[locale] || CONFIRMATION_COPY.en;
    const brandName = BRAND_NAMES[market] || 'TrainedBy';
    const fromEmail = FROM_EMAILS[market] || 'hello@trainedby.ae';

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${brandName} <${fromEmail}>`,
          to: email,
          subject: copy.subject,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f2f2f2;border-radius:12px;">
              <div style="font-size:22px;font-weight:900;color:#FF5C00;margin-bottom:24px;">${brandName}</div>
              ${copy.body}
              <hr style="border:none;border-top:1px solid #222;margin:24px 0;" />
              <p style="font-size:12px;color:#555;">${brandName} · ${source_domain || fromEmail.split('@')[1]}</p>
            </div>
          `
        })
      });
    }

    // Telegram alert to founder
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_FOUNDER_CHAT_ID');
    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎯 *New Waitlist Signup*\n\n*Market:* ${market.toUpperCase()} (${source_domain || 'unknown'})\n*Name:* ${name || 'Not provided'}\n*Email:* ${email}\n*Role:* ${role}`,
          parse_mode: 'Markdown'
        })
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('join-waitlist error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
