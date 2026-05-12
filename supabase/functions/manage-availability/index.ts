import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, jsonResponse, errorResponse,
  unauthorizedError, serverError, validationError,
} from '../_shared/errors.ts';

function isValidTime(t: string): boolean {
  return /^\d{2}:\d{2}$/.test(t);
}

function isValidDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
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

    // Auth
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return unauthorizedError();
    const { data: link } = await sb
      .from('magic_links')
      .select('trainer_id, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (!link?.trainer_id) return unauthorizedError();
    const trainer_id = link.trainer_id;

    const url = new URL(req.url);
    const op = url.searchParams.get('op');

    // GET — return schedule + overrides
    if (req.method === 'GET') {
      const [scheduleResult, overridesResult] = await Promise.all([
        sb.from('trainer_availability')
          .select('day_of_week, start_time, end_time')
          .eq('trainer_id', trainer_id)
          .order('day_of_week'),
        sb.from('availability_overrides')
          .select('date, is_blocked, note')
          .eq('trainer_id', trainer_id)
          .order('date'),
      ]);
      if (scheduleResult.error) throw scheduleResult.error;
      if (overridesResult.error) throw overridesResult.error;
      return jsonResponse({ schedule: scheduleResult.data, overrides: overridesResult.data });
    }

    // PUT ?op=schedule — replace entire weekly schedule
    if (req.method === 'PUT' && op === 'schedule') {
      const { schedule } = await req.json();
      if (!Array.isArray(schedule)) {
        return validationError('schedule', 'schedule must be an array');
      }
      for (const entry of schedule) {
        if (!Number.isInteger(entry.day_of_week) || entry.day_of_week < 0 || entry.day_of_week > 6) {
          return validationError('day_of_week', 'day_of_week must be 0-6');
        }
        if (!isValidTime(entry.start_time)) {
          return validationError('start_time', 'start_time must be HH:MM');
        }
        if (!isValidTime(entry.end_time)) {
          return validationError('end_time', 'end_time must be HH:MM');
        }
        if (entry.start_time >= entry.end_time) {
          return validationError('end_time', 'end_time must be after start_time');
        }
      }

      // Delete existing schedule for trainer
      const { error: deleteError } = await sb
        .from('trainer_availability')
        .delete()
        .eq('trainer_id', trainer_id);
      if (deleteError) throw deleteError;

      if (schedule.length === 0) {
        return jsonResponse({ schedule: [] });
      }

      const rows = schedule.map((entry: { day_of_week: number; start_time: string; end_time: string }) => ({
        trainer_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
      }));

      const { data, error } = await sb
        .from('trainer_availability')
        .insert(rows)
        .select('day_of_week, start_time, end_time');
      if (error) throw error;
      return jsonResponse({ schedule: data });
    }

    // POST ?op=override — add/update a date override
    if (req.method === 'POST' && op === 'override') {
      const { date, is_blocked = true, note = null } = await req.json();
      if (!date || !isValidDate(date)) {
        return validationError('date', 'date must be YYYY-MM-DD');
      }

      const { data, error } = await sb
        .from('availability_overrides')
        .upsert({ trainer_id, date, is_blocked, note }, { onConflict: 'trainer_id,date' })
        .select('date, is_blocked, note')
        .single();
      if (error) throw error;
      return jsonResponse({ override: data }, 201);
    }

    // DELETE ?op=override — remove a date override
    if (req.method === 'DELETE' && op === 'override') {
      const { date } = await req.json();
      if (!date || !isValidDate(date)) {
        return validationError('date', 'date must be YYYY-MM-DD');
      }

      const { error } = await sb
        .from('availability_overrides')
        .delete()
        .eq('trainer_id', trainer_id)
        .eq('date', date);
      if (error) throw error;
      return jsonResponse({ deleted: true });
    }

    return errorResponse('Method or operation not supported', 405, 'METHOD_NOT_ALLOWED');
  } catch (err) {
    console.error('[manage-availability] error:', err);
    return serverError('Failed to manage availability');
  }
});
