import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "../lib/supabase";
import PropertiesAdmin from "./PropertiesAdmin";
import SubmissionsAdmin from "./SubmissionsAdmin";
import SettingsAdmin from "./SettingsAdmin";
import ImagesAdmin from "./ImagesAdmin";
import "./admin.css";

function Login({ notAdmin }: { notAdmin: boolean }) {
  const [err, setErr] = useState(notAdmin ? "هذا الحساب لا يملك صلاحية الإدارة." : "");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    if (error) setErr("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    setBusy(false);
  }
  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <h1>دخول الإدارة</h1>
        {!isConfigured && <div className="msg bad">لم يتم ضبط متغيرات Supabase (.env).</div>}
        {err && <div className="msg bad" role="alert">{err}</div>}
        <label className="fld">البريد الإلكتروني<input name="email" type="email" required autoComplete="username" dir="ltr" /></label>
        <label className="fld">كلمة المرور<input name="password" type="password" required autoComplete="current-password" dir="ltr" /></label>
        <button className="btn" disabled={busy}>{busy ? "جارٍ الدخول…" : "دخول"}</button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(undefined); return; }
    supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  useEffect(() => { document.title = "لوحة الإدارة — قرطاج"; }, []);

  if (session === undefined) return <div className="adm"><p style={{ padding: 40 }}>جارٍ التحميل…</p></div>;
  if (!session) return <div className="adm"><Login notAdmin={false} /></div>;
  if (isAdmin === undefined) return <div className="adm"><p style={{ padding: 40 }}>جارٍ التحقق…</p></div>;
  if (!isAdmin) { supabase.auth.signOut(); return <div className="adm"><Login notAdmin /></div>; }

  return (
    <div className="adm">
      <header className="adm-bar">
        <b>لوحة قرطاج</b>
        <nav>
          <NavLink to="/admin/properties" className={({ isActive }) => (isActive ? "on" : "")}>العقارات</NavLink>
          <NavLink to="/admin/submissions" className={({ isActive }) => (isActive ? "on" : "")}>طلبات التواصل</NavLink>
          <NavLink to="/admin/images" className={({ isActive }) => (isActive ? "on" : "")}>صور الموقع</NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "on" : "")}>الإعدادات</NavLink>
        </nav>
        <a href="/" style={{ color: "#ccc", fontSize: 14 }} target="_blank" rel="noopener noreferrer">الموقع</a>
        <button className="btn ghost sm" onClick={() => supabase.auth.signOut()}>خروج</button>
      </header>
      <main className="adm-main">
        <Routes>
          <Route index element={<Navigate to="properties" replace />} />
          <Route path="properties" element={<PropertiesAdmin />} />
          <Route path="submissions" element={<SubmissionsAdmin />} />
          <Route path="images" element={<ImagesAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Routes>
      </main>
    </div>
  );
}
