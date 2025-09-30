// /functions/email-templates-admin/index.ts
// Simple admin API to list/update email_templates (use only if you don't use Supabase Auth+RLS)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.39.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PANEL_SECRET = Deno.env.get("ADMIN_PANEL_SECRET")!;

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGINS") ?? "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-admin-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const secret = req.headers.get("x-admin-secret") ?? "";
  if (secret !== ADMIN_PANEL_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    if (req.method === "GET") {
      const { data, error } = await supa.from("email_templates").select("*").order("key");
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const { key, template_id } = body;
      if (!key) return new Response(JSON.stringify({ error: "key is required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
      const { data, error } = await supa.from("email_templates").update({ template_id }).eq("key", key).select();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, data }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
