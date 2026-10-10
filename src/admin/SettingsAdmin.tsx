import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_SETTINGS, type Settings } from "../lib/types";

type TextKey = "company_name" | "phone" | "email" | "whatsapp" | "instagram_handle" | "instagram_url" | "address" | "cta_consult_link" | "cta_properties_link";
const FIELDS: [TextKey, string, boolean][] = [
  ["company_name", "اسم الشركة", false], ["phone", "الهاتف", true], ["email", "البريد الإلكتروني (يستقبل الطلبات)", true],
  ["whatsapp", "واتساب", true], ["instagram_handle", "حساب إنستغرام (@adjila)", true], ["instagram_url", "رابط صفحة إنستغرام", true],
  ["address", "العنوان", false], ["cta_consult_link", "رابط زر «اطلب استشارة / تحدث مع مستشار»", true], ["cta_properties_link", "رابط زر «استكشف العقارات»", true],
];

export default function SettingsAdmin() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => data && setS({ ...DEFAULT_SETTINGS, ...data })); }, []);

  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const rest = Object.fromEntries(FIELDS.map(([k]) => [k, s[k]]));
    const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
    setBusy(false);
    setMsg(error ? { ok: false, t: "تعذّر الحفظ." } : { ok: true, t: "تم حفظ الإعدادات، وتظهر الآن على الموقع." });
  }

  return (
    <>
      <div className="adm-head"><h1>إعدادات الموقع</h1></div>
      {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")} role="status">{msg.t}</div>}
      <form className="card f" onSubmit={save}>
        {FIELDS.map(([k, label, ltr]) => (
          <label className="fld" key={k}>{label}
            <input required value={s[k]} dir={ltr ? "ltr" : "rtl"} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
          </label>
        ))}
        <div className="fld full"><button className="btn" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ الإعدادات"}</button></div>
      </form>
    </>
  );
}
