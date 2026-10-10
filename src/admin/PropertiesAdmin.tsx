import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { LISTING_LABEL, type Property } from "../lib/types";
import { fmtPrice } from "../components/Properties";

const EMPTY: Partial<Property> = {
  title: "", category: "عقارات مميزة", location: "", price: 0, area: 0, rooms: 0, bathrooms: 0, instagram_url: "",
  listing_type: "sale", description: "", features: [], location_info: "", gallery: [],
  published: true, sort_order: 0, image_url: null,
};

async function uploadImage(file: File): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("property-images").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (up.error) return null;
  return supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;
}

export default function PropertiesAdmin() {
  const [items, setItems] = useState<Property[]>([]);
  const [edit, setEdit] = useState<Partial<Property> | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) setMsg({ ok: false, t: "تعذّر تحميل العقارات." }); else setItems((data ?? []) as Property[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function togglePublish(p: Property) {
    const { error } = await supabase.from("properties").update({ published: !p.published }).eq("id", p.id);
    if (error) setMsg({ ok: false, t: "تعذّر التحديث." }); else load();
  }
  async function remove(p: Property) {
    if (!confirm(`حذف «${p.title}» نهائيًا؟`)) return;
    const { error } = await supabase.from("properties").delete().eq("id", p.id);
    if (error) setMsg({ ok: false, t: "تعذّر الحذف." }); else { setMsg({ ok: true, t: "تم الحذف." }); load(); }
  }

  if (edit) return <Editor initial={edit} onClose={(saved) => { setEdit(null); if (saved) { setMsg({ ok: true, t: "تم الحفظ." }); load(); } }} />;

  return (
    <>
      <div className="adm-head"><h1>العقارات</h1><button className="btn" onClick={() => setEdit(EMPTY)}>+ إضافة عقار</button></div>
      {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")} role="status">{msg.t}</div>}
      {loading && <p>جارٍ التحميل…</p>}
      {!loading && items.length === 0 && <div className="card">لا توجد عقارات بعد. اضغط «إضافة عقار» للبدء.</div>}
      {items.map((p) => (
        <div className="row" key={p.id}>
          {p.image_url ? <img src={p.image_url} alt="" /> : <img alt="" />}
          <div className="g">
            <div className="t">{p.title} <span className="badge">{LISTING_LABEL[p.listing_type] ?? "للبيع"}</span> <span className={"badge" + (p.published ? " on" : "")}>{p.published ? "منشور" : "غير منشور"}</span></div>
            <div className="s">{p.category} · {p.location} · {fmtPrice(p.price)} دج · {p.area} م² · {p.rooms} غرف · {p.bathrooms} حمام</div>
          </div>
          <div className="acts">
            <a className="btn ghost sm" href={`/properties/${p.id}`} target="_blank" rel="noopener noreferrer">معاينة</a>
            <button className="btn ghost sm" onClick={() => togglePublish(p)}>{p.published ? "إلغاء النشر" : "نشر"}</button>
            <button className="btn ghost sm" onClick={() => setEdit(p)}>تعديل</button>
            <button className="btn danger sm" onClick={() => remove(p)}>حذف</button>
          </div>
        </div>
      ))}
    </>
  );
}

function Editor({ initial, onClose }: { initial: Partial<Property>; onClose: (saved: boolean) => void }) {
  const [p, setP] = useState<Partial<Property>>(initial);
  const [featuresText, setFeaturesText] = useState((initial.features ?? []).join("\n"));
  const [cover, setCover] = useState<File | null>(null);
  const [gallery, setGallery] = useState<string[]>(initial.gallery ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Property, v: unknown) => setP((o) => ({ ...o, [k]: v }));
  const coverPreview = cover ? URL.createObjectURL(cover) : p.image_url;

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const ig = (p.instagram_url ?? "").trim();
    if (ig && !/^https:\/\/(www\.)?instagram\.com\//i.test(ig)) { setErr("رابط إنستغرام يجب أن يبدأ بـ https://www.instagram.com/"); return; }
    setBusy(true);
    let image_url = p.image_url ?? null;
    if (cover) {
      const u = await uploadImage(cover);
      if (!u) { setErr("تعذّر رفع الصورة الرئيسية."); setBusy(false); return; }
      image_url = u;
    }
    const gal = [...gallery];
    for (const f of newFiles) {
      const u = await uploadImage(f);
      if (!u) { setErr("تعذّر رفع إحدى الصور."); setBusy(false); return; }
      gal.push(u);
    }
    const row = {
      title: (p.title ?? "").trim(), category: (p.category ?? "").trim(), location: (p.location ?? "").trim(), image_url, gallery: gal,
      price: Number(p.price) || 0, area: Number(p.area) || 0, rooms: Number(p.rooms) || 0, bathrooms: Number(p.bathrooms) || 0,
      listing_type: p.listing_type === "rent" ? "rent" : "sale",
      description: (p.description ?? "").trim() || null,
      features: featuresText.split("\n").map((x) => x.trim()).filter(Boolean),
      location_info: (p.location_info ?? "").trim() || null,
      instagram_url: ig || null, published: !!p.published, sort_order: Number(p.sort_order) || 0,
    };
    const { error } = p.id ? await supabase.from("properties").update(row).eq("id", p.id) : await supabase.from("properties").insert(row);
    setBusy(false);
    if (error) setErr("تعذّر الحفظ. تحقق من الحقول."); else onClose(true);
  }

  return (
    <>
      <div className="adm-head"><h1>{p.id ? "تعديل العقار" : "إضافة عقار"}</h1><button className="btn ghost" onClick={() => onClose(false)}>رجوع</button></div>
      <form className="card f" onSubmit={save}>
        {err && <div className="msg bad fld full" role="alert">{err}</div>}
        <label className="fld">العنوان<input required value={p.title ?? ""} onChange={(e) => set("title", e.target.value)} /></label>
        <label className="fld">النوع
          <select value={p.listing_type ?? "sale"} onChange={(e) => set("listing_type", e.target.value)}>
            <option value="sale">للبيع</option><option value="rent">للإيجار</option>
          </select>
        </label>
        <label className="fld">الفئة<input required value={p.category ?? ""} onChange={(e) => set("category", e.target.value)} /></label>
        <label className="fld">الموقع<input required value={p.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="وسط المدينة — باتنة" /></label>
        <label className="fld">السعر (دج)<input type="number" min={0} value={p.price ?? 0} onChange={(e) => set("price", e.target.value)} /></label>
        <label className="fld">المساحة (م²)<input type="number" min={0} value={p.area ?? 0} onChange={(e) => set("area", e.target.value)} /></label>
        <label className="fld">عدد الغرف<input type="number" min={0} value={p.rooms ?? 0} onChange={(e) => set("rooms", e.target.value)} /></label>
        <label className="fld">عدد الحمامات<input type="number" min={0} value={p.bathrooms ?? 0} onChange={(e) => set("bathrooms", e.target.value)} /></label>
        <label className="fld full">الوصف<textarea value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} /></label>
        <label className="fld full">المميزات (ميزة في كل سطر)<textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"حديقة خاصة\nمرآب"} /></label>
        <label className="fld full">معلومات الموقع<textarea value={p.location_info ?? ""} onChange={(e) => set("location_info", e.target.value)} /></label>
        <label className="fld">ترتيب العرض<input type="number" value={p.sort_order ?? 0} onChange={(e) => set("sort_order", e.target.value)} /></label>
        <label className="fld">رابط منشور إنستغرام (اختياري)<input dir="ltr" placeholder="https://www.instagram.com/p/XXXXXXXX/" value={p.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} /></label>

        <div className="fld full">
          <span>الصورة الرئيسية (تظهر على البطاقة وكأكبر صورة في الصفحة)</span>
          {coverPreview && <img className="preview" src={coverPreview} alt="" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
        </div>

        <div className="fld full">
          <span>صور إضافية (يمكن إضافة أي عدد)</span>
          <div className="thumbs">
            {gallery.map((u, i) => (
              <div className="thumb" key={u}><img src={u} alt="" /><button type="button" onClick={() => setGallery(gallery.filter((_, j) => j !== i))} aria-label="إزالة الصورة">×</button></div>
            ))}
            {newFiles.map((f, i) => (
              <div className="thumb" key={f.name + i}><img src={URL.createObjectURL(f)} alt="" /><button type="button" onClick={() => setNewFiles(newFiles.filter((_, j) => j !== i))} aria-label="إزالة الصورة">×</button></div>
            ))}
          </div>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { setNewFiles([...newFiles, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
        </div>

        <label className="fld chk full"><input type="checkbox" checked={!!p.published} onChange={(e) => set("published", e.target.checked)} />منشور على الموقع</label>
        <div className="fld full"><button className="btn" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ"}</button></div>
      </form>
    </>
  );
}
