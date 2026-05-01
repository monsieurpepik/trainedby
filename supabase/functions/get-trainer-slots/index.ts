import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, jsonResponse, errorResponse,
  serverError, validationError, notFoundError,
} from '../_shared/errors.ts';

interface Slot {
  date: string;
  time: string;
  available: boolean;
}

function dateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

function timeToMinutes(t: string): number {
  // t may be "HH:MM" or "HH:MM:SS"
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse params from GET query string or POST body
    let trainer_id: string | null = null;
    let startStr: string | null = null;
    let endStr: string | null = null;
    let durationMin: number | null = null;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      trainer_id = url.searchParams.get('trainer_id');
      startStr = url.searchParams.get('start') ?? url.searchParams.get('dateFrom');
      endStr = url.searchParams.get('end') ?? url.searchParams.get('dateTo');
      const dStr = url.searchParams.get('duration') ?? url.searchParams.get('durationMin');
      durationMin = dStr ? parseInt(dStr, 10) : null;
    } else if (req.method === 'POST') {
      const body = await req.json();
      trainer_id = body.trainer_id ?? body.trainerId ?? null;
      startStr = body.start ?? body.dateFrom ?? null;
      endStr = body.end ?? body.dateTo ?? null;
      durationMin = body.duration ?? body.durationMin ?? null;
      if (typeof durationMin === 'string') durationMin = parseInt(durationMin, 10);
    } else {
      return errorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
    }

    // Validate
    if (!trainer_id) return validationError('trainer_id', 'trainer_id is required');
    if (!startStr || !endStr) return validationError('start', 'start and end dates are required');
    if (!durationMin || durationMin <= 0) return validationError('duration', 'duration must be a positive integer (minutes)');

    const startDate = new Date(startStr + 'T00:00:00Z');
    const endDate = new Date(endStr + 'T00:00:00Z');
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return validationError('start', 'Invalid date format. Use YYYY-MM-DD');
    }

    // Cap to 60 days
    const maxEnd = new Date(startDate);
    maxEnd.setUTCDate(maxEnd.getUTCDate() + 59);
    const effectiveEnd = endDate < maxEnd ? endDate : maxEnd;

    // Verify trainer exists
    const { data: trainer } = await sb
      .from('trainers')
      .select('id')
      .eq('id', trainer_id)
      .single();
    if (!trainer) return notFoundError('Trainer');

    // Load weekly schedule
    const { data: schedule, error: scheduleErr } = await sb
      .from('trainer_availability')
      .select('day_of_week, start_time, end_time')
      .eq('trainer_id', trainer_id);
    if (scheduleErr) throw scheduleErr;

    // Load date overrides
    const { data: overrides, error: overridesErr } = await sb
      .from('availability_overrides')
      .select('date, is_blocked')
      .eq('trainer_id', trainer_id)
      .gte('date', startStr)
      .lte('date', endStr);
    if (overridesErr) throw overridesErr;

    // Load active bookings
    const { data: bookings, error: bookingsErr } = await sb
      .from('bookings')
      .select('scheduled_at, duration_min')
      .eq('trainer_id', trainer_id)
      .in('status', ['pending', 'confirmed', 'completed'])
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', new Date(effectiveEnd.getTime() + 24 * 60 * 60 * 1000).toISOString());
    if (bookingsErr) throw bookingsErr;

    // Build lookup maps
    const scheduleByDow = new Map<number, { start_time: string; end_time: string }>();
    for (const s of (schedule ?? [])) {
      scheduleByDow.set(s.day_of_week, { start_time: s.start_time, end_time: s.end_time });
    }

    const blockedDates = new Set<string>();
    for (const o of (overrides ?? [])) {
      if (o.is_blocked) blockedDates.add(o.date);
    }

    // Convert bookings to sets of taken slot starts (in minutes from midnight UTC)
    // key: "YYYY-MM-DD", value: Set<minutesFromMidnight>
    const takenSlots = new Map<string, Set<number>>();
    for (const b of (bookings ?? [])) {
      const at = new Date(b.scheduled_at);
      const dateKey = at.toISOString().slice(0, 10);
      const minsFromMidnight = at.getUTCHours() * 60 + at.getUTCMinutes();
      if (!takenSlots.has(dateKey)) takenSlots.set(dateKey, new Set());
      takenSlots.get(dateKey)!.add(minsFromMidnight);
    }

    // Generate slots for each date
    const slots: Slot[] = [];
    for (const date of dateRange(startDate, effectiveEnd)) {
      const dateKey = date.toISOString().slice(0, 10);
      const dow = date.getUTCDay(); // 0=Sun

      if (blockedDates.has(dateKey)) continue;

      const avail = scheduleByDow.get(dow);
      if (!avail) continue;

      const startMins = timeToMinutes(avail.start_time);
      const endMins = timeToMinutes(avail.end_time);
      const takenToday = takenSlots.get(dateKey) ?? new Set<number>();

      for (let m = startMins; m + durationMin <= endMins; m += 60) {
        const available = !takenToday.has(m);
        slots.push({ date: dateKey, time: minutesToTime(m), available });
      }
    }

    return jsonResponse({ slots });
  } catch (err) {
    console.error('[get-trainer-slots] error:', err);
    return serverError('Failed to get trainer slots');
  }
});
