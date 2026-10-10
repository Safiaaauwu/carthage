import { supabase, isConfigured } from "./supabase";

export type Errors = Partial<Record<"name" | "phone" | "type" | "message", string>>;
export type ContactPayload = {
  name: string; phone: string; request_type: string; message: string; website: string;
  property_id?: string; intent?: "visit" | "advisor";
};

export function validate(v: { name: string; phone: string; type: string; message: string }): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "أدخل اسمك (حرفان على الأقل).";
  if (!/^[+\d][\d\s().-]{7,19}$/.test(v.phone.trim())) e.phone = "أدخل رقم هاتف صحيحًا.";
  if (!v.type) e.type = "اختر نوع الطلب.";
  if (v.message.trim().length < 5) e.message = "اكتب رسالتك (5 أحرف على الأقل).";
  return e;
}

const ERR_MSG: Record<string, string> = {
  duplicate: "تم استلام هذا الطلب بالفعل. سنتواصل معك قريبًا.",
  rate_limit: "أرسلت عدة طلبات خلال وقت قصير. حاول مرة أخرى بعد قليل.",
};

export async function sendContact(p: ContactPayload): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isConfigured) return { ok: false, message: "الخدمة غير مفعّلة بعد." };
  const { data, error } = await supabase.functions.invoke("contact", { body: p });
  if (error || !data?.ok) {
    let code = "";
    try { code = (await (error as any)?.context?.json?.())?.error ?? ""; } catch { /* ignore */ }
    return { ok: false, message: ERR_MSG[code] ?? "تعذّر إرسال الطلب. تحقق من البيانات وحاول مرة أخرى." };
  }
  return { ok: true };
}
