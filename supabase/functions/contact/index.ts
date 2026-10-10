// Edge Function "contact" — valide, enregistre et envoie l'e-mail. Aucune clé n'est exposée au navigateur.
// Secrets requis : RESEND_API_KEY ; optionnels : CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const TYPES = ["بيع عقار", "شراء عقار", "إيجار عقار", "استثمار عقاري", "استشارة عقارية", "أخرى"];
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return json({ error: "invalid" }, 400); }

  // Honeypot : les robots remplissent ce champ caché. On répond "ok" sans rien faire.
  if (body.website) return json({ ok: true });

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const request_type = String(body.request_type ?? "").trim();
  const message = String(body.message ?? "").trim();
  const property_id = body.property_id ? String(body.property_id) : null;
  const intent = body.intent === "visit" || body.intent === "advisor" ? body.intent : null;

  if (name.length < 2 || name.length > 100) return json({ error: "name" }, 400);
  if (!/^[+\d][\d\s().-]{7,19}$/.test(phone)) return json({ error: "phone" }, 400);
  if (!TYPES.includes(request_type)) return json({ error: "type" }, 400);
  if (message.length < 5 || message.length > 2000) return json({ error: "message" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Anti-doublon / anti-spam : même message en 10 min, ou plus de 3 demandes par heure pour un même numéro.
  const since10 = new Date(Date.now() - 10 * 60_000).toISOString();
  const since60 = new Date(Date.now() - 60 * 60_000).toISOString();
  const { data: recent } = await db.from("submissions").select("message,created_at").eq("phone", phone).gte("created_at", since60);
  if (recent?.some((r) => r.message === message && r.created_at >= since10)) return json({ error: "duplicate" }, 429);
  if ((recent?.length ?? 0) >= 3) return json({ error: "rate_limit" }, 429);

  // Nom du bien : lu en base (jamais fait confiance au navigateur).
  let property_title: string | null = null;
  let pid: string | null = null;
  if (property_id) {
    if (!/^[0-9a-f-]{36}$/i.test(property_id)) return json({ error: "property" }, 400);
    const { data: prop } = await db.from("properties").select("id,title").eq("id", property_id).eq("published", true).maybeSingle();
    if (!prop) return json({ error: "property" }, 400);
    pid = prop.id; property_title = prop.title;
  }

  const { data: row, error } = await db.from("submissions")
    .insert({ name, phone, request_type, message, property_id: pid, property_title, intent }).select().single();
  if (error) return json({ error: "db" }, 500);

  // Destinataire : e-mail configuré dans les paramètres du site (repli : secret puis contact@adjila.dz)
  const { data: settings } = await db.from("site_settings").select("email").eq("id", 1).single();
  const to = settings?.email || Deno.env.get("CONTACT_TO_EMAIL") || "contact@adjila.dz";
  const when = new Date(row.created_at).toLocaleString("ar-DZ", { timeZone: "Africa/Algiers" });

  let sent = false;
  const key = Deno.env.get("RESEND_API_KEY");
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("CONTACT_FROM_EMAIL") ?? "قرطاج <onboarding@resend.dev>",
        to: [to],
        subject: property_title ? `طلب تواصل جديد — قرطاج — ${property_title}` : "طلب تواصل جديد — قرطاج",
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">
          <h2>طلب تواصل جديد</h2>
          <p><b>الاسم:</b> ${esc(name)}</p>
          <p><b>رقم الهاتف:</b> <span dir="ltr">${esc(phone)}</span></p>
          <p><b>نوع الطلب:</b> ${esc(request_type)}</p>
          ${property_title ? `<p><b>العقار:</b> ${esc(property_title)}</p>` : ""}
          ${intent ? `<p><b>الرغبة:</b> ${intent === "visit" ? "زيارة العقار" : "التحدث مع مستشار"}</p>` : ""}
          <p><b>الرسالة:</b><br>${esc(message).replace(/\n/g, "<br>")}</p>
          <p style="color:#777"><b>تاريخ الإرسال:</b> ${esc(when)}</p></div>`,
      }),
    });
    sent = res.ok;
  }
  await db.from("submissions").update({ email_sent: sent }).eq("id", row.id);
  return json({ ok: true, emailed: sent });
});
