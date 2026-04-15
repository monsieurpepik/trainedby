import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Verify token — must be unused and not expired
    const { data: link } = await sb
      .from("magic_links")
      .select("trainer_id, expires_at, used")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!link?.trainer_id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const body = await req.json();
    const { action, trainer_id } = body;

    // Security: ensure token owner matches trainer_id
    if (link.trainer_id !== trainer_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    if (action === "delete") {
      await sb.from("trainers").delete().eq("id", trainer_id);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Build update payload
    const update: Record<string, unknown> = {};
    const fields = ["name","title","bio","years_experience","clients_trained","specialties","accepting_clients","instagram","tiktok","youtube"];
    fields.forEach(f => { if (body[f] !== undefined) update[f] = body[f]; });

    // Handle new gallery images (base64 → upload to Supabase Storage)
    if (body.gallery_new && body.gallery_new.length > 0) {
      const galleryUrls: string[] = [];
      for (const base64 of body.gallery_new.slice(0, 9)) {
        const url = await uploadBase64Image(sb, base64, `gallery/${trainer_id}/${Date.now()}`);
        if (url) galleryUrls.push(url);
      }
      if (galleryUrls.length > 0) {
        const { data: current } = await sb.from("trainers").select("gallery_urls").eq("id", trainer_id).single();
        update.gallery_urls = [...(current?.gallery_urls || []), ...galleryUrls].slice(0, 9);
      }
    }

    // Update trainer
    const { error: updateError } = await sb.from("trainers").update(update).eq("id", trainer_id);
    if (updateError) throw updateError;

    // Update packages
    if (body.packages !== undefined) {
      await sb.from("session_packages").delete().eq("trainer_id", trainer_id);
      if (body.packages.length > 0) {
        await sb.from("session_packages").insert(
          body.packages.map((p: Record<string, unknown>, i: number) => ({
            trainer_id,
            name: p.name,
            price: p.price,
            duration: p.duration || "60min",
            sessions: p.sessions || 1,
            sort_order: i,
          }))
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});

async function uploadBase64Image(sb: ReturnType<typeof createClient>, base64: string, path: string): Promise<string | null> {
  try {
    const match = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    const [, mime, data] = match;
    const ext = mime.split("/")[1] || "jpg";
    const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const filePath = `${path}.${ext}`;
    const { error } = await sb.storage.from("trainer-images").upload(filePath, buffer, { contentType: mime, upsert: true });
    if (error) return null;
    const { data: urlData } = sb.storage.from("trainer-images").getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch {
    return null;
  }
}
