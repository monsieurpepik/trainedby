/**
 * TrainedBy  -  Calendar Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates calendar events and scheduling links for trainer sessions.
 *
 * Strategy:
 *   - If trainer has connected Google Calendar (google_calendar_token set):
 *     → Create a Google Calendar event and return the event link
 *   - If trainer has a Calendly URL set:
 *     → Return their Calendly link with pre-filled client name/email
 *   - Fallback:
 *     → Generate a Google Calendar "quick add" URL the trainer can tap to create
 *       the event themselves (no OAuth required)
 *
 * The Booking Prep agent uses this to attach a scheduling link to its message.
 * The Lead Responder uses this to offer a "book a call" link in the draft reply.
 */

export interface SessionDetails {
  trainerName: string;
  clientName: string;
  clientEmail?: string;
  title?: string;           // e.g. "Initial Consultation  -  Ahmed & Sarah"
  durationMinutes?: number; // default 60
  proposedDate?: Date;      // if known; otherwise omit for open scheduling
  location?: string;        // e.g. "JLT Gym" or "Online (Zoom)"
  notes?: string;
}

export interface CalendarResult {
  type: 'google_event' | 'calendly' | 'quick_add';
  url: string;
  label: string;            // Human-readable label for the message
}

// ── Google Calendar Quick Add URL (no OAuth) ──────────────────────────────────
// Creates a URL that opens Google Calendar with the event pre-filled.
// The trainer taps it, reviews, and saves. Zero setup required.

export function buildGoogleQuickAddUrl(details: SessionDetails): CalendarResult {
  const {
    trainerName,
    clientName,
    title,
    durationMinutes = 60,
    proposedDate,
    location,
    notes,
  } = details;

  const eventTitle = title || `Session: ${clientName} with ${trainerName}`;
  const start = proposedDate ?? new Date(Date.now() + 24 * 3600000); // default: tomorrow
  const end = new Date(start.getTime() + durationMinutes * 60000);

  // Format: YYYYMMDDTHHmmssZ
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: notes || `Booked via TrainedBy`,
    location: location || '',
    sf: 'true',
    output: 'xml',
  });

  return {
    type: 'quick_add',
    url: `https://calendar.google.com/calendar/render?${params.toString()}`,
    label: 'Add to Google Calendar',
  };
}

// ── Calendly pre-filled link ──────────────────────────────────────────────────
// If the trainer has set a Calendly URL, append UTM params and client name.

export function buildCalendlyUrl(
  calendlyUrl: string,
  details: SessionDetails,
): CalendarResult {
  const base = calendlyUrl.replace(/\/$/, '');
  const params = new URLSearchParams();
  if (details.clientName) params.set('name', details.clientName);
  if (details.clientEmail) params.set('email', details.clientEmail);
  params.set('utm_source', 'trainedby');
  params.set('utm_medium', 'agent');

  return {
    type: 'calendly',
    url: `${base}?${params.toString()}`,
    label: 'Book via Calendly',
  };
}

// ── Google Calendar API (OAuth) ───────────────────────────────────────────────
// Used when trainer has connected Google Calendar via OAuth.
// Requires GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET env vars.

export async function createGoogleCalendarEvent(
  accessToken: string,
  details: SessionDetails,
): Promise<CalendarResult> {
  const {
    trainerName,
    clientName,
    clientEmail,
    title,
    durationMinutes = 60,
    proposedDate,
    location,
    notes,
  } = details;

  const start = proposedDate ?? new Date(Date.now() + 24 * 3600000);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const eventBody: Record<string, unknown> = {
    summary: title || `Session: ${clientName} with ${trainerName}`,
    location: location || '',
    description: notes || `Booked via TrainedBy`,
    start: { dateTime: start.toISOString(), timeZone: 'UTC' },
    end: { dateTime: end.toISOString(), timeZone: 'UTC' },
  };

  if (clientEmail) {
    eventBody.attendees = [{ email: clientEmail }];
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    type: 'google_event',
    url: data.htmlLink ?? 'https://calendar.google.com',
    label: 'View in Google Calendar',
  };
}

// ── Smart calendar link builder ───────────────────────────────────────────────
// Picks the best available method for the trainer.

export async function buildCalendarLink(
  trainer: {
    name: string;
    calendly_url?: string | null;
    google_calendar_token?: string | null;
  },
  details: Omit<SessionDetails, 'trainerName'>,
): Promise<CalendarResult> {
  const fullDetails: SessionDetails = { ...details, trainerName: trainer.name };

  // 1. Google Calendar API (best  -  creates event automatically)
  if (trainer.google_calendar_token) {
    try {
      return await createGoogleCalendarEvent(trainer.google_calendar_token, fullDetails);
    } catch {
      // Fall through to next option
    }
  }

  // 2. Calendly (good  -  trainer's existing booking page)
  if (trainer.calendly_url) {
    return buildCalendlyUrl(trainer.calendly_url, fullDetails);
  }

  // 3. Google Quick Add (always works  -  no setup)
  return buildGoogleQuickAddUrl(fullDetails);
}
