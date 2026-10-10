import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { STATUSES, type Submission } from "../lib/types";

const fmt = (d: string) => new Date(d).toLocaleString("ar-DZ", { dateStyle: "medium", timeStyle: "short" });
const INTENT = { visit: "يرغب في زيارة العقار", advisor: "يريد التحدث مع مستشار" } as const;
const badge = (s: string) => (s === "جديد" ? "badge new" : s === "تم التواصل" ? "badge mid" : "badge");

export default function SubmissionsAdmin() {
  const [items, setItems] = useState<Submission[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (error) setErr("تعذّر تحميل الطلبات."); else setItems((data ?? []) as Submission[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => items.filter((s) =>
    (!filter || s.status === filter) &&
    (!q || [s.name, s.phone, s.message, s.request_type, s.property_title ?? ""].some((v) => v.toLowerCase().includes(q.toLowerCase())))), [items, q, filter]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
    if (error) setErr("تعذّر تحديث الحالة."); else setItems((l) => l.map((s) => (s.id === id ? { ...s, status: status as Submission["status"] } : s)));
  }
  async function remove(id: string) {
    if (!confirm("حذف هذا الطلب نهائيًا؟")) return;
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (error) setErr("تعذّر الحذف."); else setItems((l) => l.filter((s) => s.id !== id));
  }

  return (
    <>
      <div className="adm-head"><h1>طلبات التواصل</h1></div>
      {err && <div className="msg bad" role="alert">{err}</div>}
      <div className="toolbar">
        <input placeholder="بحث بالاسم أو الهاتف أو الرسالة" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {loading && <p>جارٍ التحميل…</p>}
      {!loading && shown.length === 0 && <div className="card">لا توجد طلبات.</div>}
      {shown.map((s) => (
        <div className="row" key={s.id} style={{ display: "block" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div className="g">
              <div className="t">{s.name} <span className={badge(s.status)}>{s.status}</span></div>
              {s.property_title && <div className="s" style={{ color: "#111" }}>العقار: <b>{s.property_title}</b>{s.intent && <> · {INTENT[s.intent]}</>}</div>}
              <div className="s"><span dir="ltr">{s.phone}</span> · {s.request_type} · {fmt(s.created_at)}{!s.email_sent && " · لم يُرسل البريد"}</div>
            </div>
            <div className="acts">
              <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)} aria-label="الحالة" style={{ width: "auto" }}>
                {STATUSES.map((x) => <option key={x}>{x}</option>)}
              </select>
              <button className="btn ghost sm" onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? "إخفاء" : "عرض"}</button>
              <button className="btn danger sm" onClick={() => remove(s.id)}>حذف</button>
            </div>
          </div>
          {open === s.id && <div className="detail">{s.message}</div>}
        </div>
      ))}
    </>
  );
}
