import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, jsonResponse, errorResponse,
  unauthorizedError, notFoundError, serverError,
  validationError, sanitize,
} from '../_shared/errors.ts';

async function resolveTrainer(req: Request, sb: ReturnType<typeof createClient>): Promise<{ trainer_id: string } | Response> {
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
  return { trainer_id: link.trainer_id };
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

    const auth = await resolveTrainer(req, sb);
    if (auth instanceof Response) return auth;
    const { trainer_id } = auth;

    // GET — list session types
    if (req.method === 'GET') {
      const { data, error } = await sb
        .from('session_types')
        .select('*')
        .eq('trainer_id', trainer_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return jsonResponse({ sessionTypes: data });
    }

    // POST — create session type
    if (req.method === 'POST') {
      const body = await req.json();
      const { name, duration_min, price_cents, type, package_count } = body;

      if (!name || typeof name !== 'string') return validationError('name', 'name is required');
      if (!duration_min || !Number.isInteger(duration_min) || duration_min <= 0) {
        return validationError('duration_min', 'duration_min must be a positive integer');
      }
      if (!price_cents || !Number.isInteger(price_cents) || price_cents <= 0) {
        return validationError('price_cents', 'price_cents must be a positive integer');
      }
      if (type !== 'single' && type !== 'package') {
        return validationError('type', "type must be 'single' or 'package'");
      }
      if (type === 'package' && (!Number.isInteger(package_count) || package_count <= 1)) {
        return validationError('package_count', 'package_count must be an integer greater than 1 for package types');
      }
      if (type === 'single' && package_count != null) {
        return validationError('package_count', 'package_count must be null for single session types');
      }

      const { data, error } = await sb
        .from('session_types')
        .insert({
          trainer_id,
          name: sanitize(name),
          duration_min,
          price_cents,
          type,
          package_count: type === 'package' ? package_count : null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ sessionType: data }, 201);
    }

    // PUT — update session type
    if (req.method === 'PUT') {
      const body = await req.json();
      const { id, name, price_cents, duration_min, is_active, package_count } = body;

      if (!id) return validationError('id', 'id is required');

      // Verify ownership
      const { data: existing } = await sb
        .from('session_types')
        .select('id')
        .eq('id', id)
        .eq('trainer_id', trainer_id)
        .single();
      if (!existing) return notFoundError('Session type');

      // Build update payload — only include provided fields
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = sanitize(name);
      if (price_cents !== undefined) updates.price_cents = price_cents;
      if (duration_min !== undefined) updates.duration_min = duration_min;
      if (is_active !== undefined) updates.is_active = is_active;
      if (package_count !== undefined) updates.package_count = package_count;

      const { data, error } = await sb
        .from('session_types')
        .update(updates)
        .eq('id', id)
        .eq('trainer_id', trainer_id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ sessionType: data });
    }

    return errorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  } catch (err) {
    console.error('[manage-session-types] error:', err);
    return serverError('Failed to manage session types');
  }
});
