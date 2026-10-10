import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { prepareImage } from "../lib/images";
import { DEFAULT_IMAGES } from "../lib/types";

type Key = "logo_url" | "hero_image_url" | "about_image_url" | "invest_image_url";
const SLOTS: { key: Key; title: string; where: string; hint: string; maxW: number; alpha: boolean; def: string }[] = [
  { key: "logo_url", title: "الشعار", where: "أعلى كل صفحات الموقع", hint: "PNG بخلفية شفافة (أو SVG) بأعلى جودة ممكنة.", maxW: 900, alpha: true, def: DEFAULT_IMAGES.logo },
  { key: "hero_image_url", title: "صورة الواجهة الرئيسية", where: "خلف العنوان الرئيسي في أعلى الصفحة الرئيسية", hint: "صورة أفقية كبيرة (عرض 1600 بكسل أو أكثر).", maxW: 2200, alpha: false, def: DEFAULT_IMAGES.hero },
  { key: "about_image_url", title: "صورة قسم «من نحن»", where: "بجانب نص «قرطاج، شريكك في العقار»", hint: "صورة بنسبة قريبة من المربع أو أفقية قليلًا.", maxW: 1400, alpha: false, def: DEFAULT_IMAGES.about },
  { key: "invest_image_url", title: "صورة قسم الاستثمار", where: "خلف «استثمر في العقار برؤية أوضح»", hint: "صورة أفقية كبيرة (عرض 1600 بكسل أو أكثر).", maxW: 2000, alpha: false, def: DEFAULT_IMAGES.invest },
];
const MAX_MB = 15;
type Msg = { ok: boolean; t: string };

/** Chemin dans le bucket, seulement pour les fichiers envoyés depuis cette page (dossier site/). */
function sitePath(url: string | null): string | null {
  const m = url?.match(/\/property-images\/(site\/[^?]+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function ImagesAdmin() {
  const [urls, setUrls] = useState<Record<Key, string | null>>({ logo_url: null, hero_image_url: null, about_image_url: null, invest_image_url: null });
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    supabase.from("site_settings").select("logo_url,hero_image_url,about_image_url,invest_image_url").eq("id", 1).single()
      .then(({ data, error }) => {
        if (error) setLoadErr("تعذّر تحميل الصور. تأكد من تشغيل ملف update-4.sql في Supabase.");
        else if (data) setUrls(data as Record<Key, string | null>);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="adm-head"><h1>صور الموقع</h1></div>
      <p style={{ color: "#666", marginBottom: 18, lineHeight: 1.8 }}>غيّر صور الصفحة الرئيسية من هنا. تظهر الصورة الجديدة على الموقع مباشرة بعد الحفظ.</p>
      {loadErr && <div className="msg bad" role="alert">{loadErr}</div>}
      {loading ? <p>جارٍ التحميل…</p> : (
        <div className="slots">
          {SLOTS.map((s) => (
            <Slot key={s.key} slot={s} current={urls[s.key]} onChange={(u) => setUrls((o) => ({ ...o, [s.key]: u }))} />
          ))}
        </div>
      )}
    </>
  );
}

function Slot({ slot, current, onChange }: { slot: (typeof SLOTS)[number]; current: string | null; onChange: (u: string | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [inputKey, setInputKey] = useState(0); // remet le champ fichier à zéro après envoi/annulation
  const clear = () => { setFile(null); setInputKey((k) => k + 1); };

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file); setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  async function save() {
    if (!file) return;
    setMsg(null);
    if (file.size > MAX_MB * 1024 * 1024) { setMsg({ ok: false, t: `الملف كبير جدًا (الحد ${MAX_MB} ميغابايت).` }); return; }
    setBusy(true);
    try {
      const img = await prepareImage(file, slot.maxW, slot.alpha).catch(() => null);
      if (!img) { setMsg({ ok: false, t: "صيغة الصورة غير مدعومة. استعمل JPG أو PNG أو WEBP." }); return; }
      const path = `site/${crypto.randomUUID()}.${img.ext}`;
      const up = await supabase.storage.from("property-images").upload(path, img.blob, { contentType: img.type, cacheControl: "31536000" });
      if (up.error) { setMsg({ ok: false, t: "تعذّر رفع الصورة." }); return; }
      const url = supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("site_settings").update({ [slot.key]: url }).eq("id", 1);
      if (error) {
        await supabase.storage.from("property-images").remove([path]);
        setMsg({ ok: false, t: "تعذّر الحفظ. تأكد من تشغيل ملف update-4.sql في Supabase." });
        return;
      }
      const old = sitePath(current);
      if (old) await supabase.storage.from("property-images").remove([old]); // nettoyage de l'ancienne image
      onChange(url); clear(); setMsg({ ok: true, t: "تم حفظ الصورة وهي تظهر الآن على الموقع." });
    } finally { setBusy(false); }
  }

  async function reset() {
    if (!confirm("العودة إلى الصورة الافتراضية؟")) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("site_settings").update({ [slot.key]: null }).eq("id", 1);
    if (error) { setMsg({ ok: false, t: "تعذّر الحفظ." }); setBusy(false); return; }
    const old = sitePath(current);
    if (old) await supabase.storage.from("property-images").remove([old]);
    onChange(null); clear(); setMsg({ ok: true, t: "تمت العودة إلى الصورة الافتراضية." });
    setBusy(false);
  }

  const shown = preview || current || slot.def;
  return (
    <div className="card slot">
      <div className={"slot-pv" + (slot.alpha ? " checker" : "")}><img src={shown} alt="" /></div>
      <div className="slot-body">
        <h2>{slot.title}</h2>
        <p className="s">تظهر: {slot.where}</p>
        <p className="s">{slot.hint}</p>
        <input key={inputKey} type="file" accept={slot.alpha ? "image/jpeg,image/png,image/webp,image/svg+xml" : "image/jpeg,image/png,image/webp"} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setMsg(null); }} aria-label={slot.title} />
        {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")} role="status" style={{ marginTop: 10, marginBottom: 0 }}>{msg.t}</div>}
        <div className="acts" style={{ marginTop: 12 }}>
          <button className="btn" onClick={save} disabled={!file || busy}>{busy ? "جارٍ الحفظ…" : "رفع وحفظ"}</button>
          {file && <button className="btn ghost" onClick={clear} disabled={busy}>إلغاء</button>}
          <button className="btn ghost" onClick={reset} disabled={busy || !current}>الصورة الافتراضية</button>
        </div>
      </div>
    </div>
  );
}
