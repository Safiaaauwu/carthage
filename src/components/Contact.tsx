import { useState, type FormEvent } from "react";
import { REQUEST_TYPES, type Settings } from "../lib/types";
import { sendContact, validate, type Errors } from "../lib/contact";
import { Icon } from "./Icons";

export function Contact({ s }: { s: Settings }) {
  const [type, setType] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "fail">("idle");
  const [failMsg, setFailMsg] = useState("");
  const tel = s.phone.replace(/[^\d+]/g, "");
  const wa = s.whatsapp.replace(/[^\d]/g, "");
  const ig = s.instagram_handle.replace(/^@/, "");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    const errs = validate({ name, phone, type, message });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setState("sending"); setFailMsg("");
    const res = await sendContact({ name, phone, request_type: type, message, website: String(f.get("website") ?? "") });
    if (!res.ok) { setFailMsg(res.message); setState("fail"); return; }
    form.reset(); setType(""); setState("done");
  }

  return (
    <section id="contact" className="contact">
      <div className="wrap grid">
        <div>
          <span className="label">لماذا قرطاج؟</span>
          <h2>تبحث عن عقار في باتنة؟<br />تواصل مع قرطاج</h2>
          <p className="lead">اتصل بنا مباشرة أو أرسل طلبك، وسيتواصل معك أحد مستشارينا لمناقشة ما تبحث عنه.</p>
          <ul className="info">
            <li><Icon name="phone" size={22} /><span>الهاتف : <a href={`tel:${tel}`} dir="ltr">{s.phone}</a></span></li>
            <li><Icon name="mail" size={22} /><span>البريد الإلكتروني : <a href={`mailto:${s.email}`}>{s.email}</a></span></li>
            <li><Icon name="pin" size={22} /><span>العنوان : {s.address}</span></li>
            <li><Icon name="whatsapp" size={22} /><span>واتساب : <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" dir="ltr">{s.whatsapp}</a></span></li>
            <li><Icon name="instagram" size={22} /><span>إنستغرام : <a href={s.instagram_url} target="_blank" rel="noopener noreferrer">@{ig}</a></span></li>
          </ul>
        </div>
        <div className="form-col">
          <form className="form" onSubmit={onSubmit} noValidate>
            <label htmlFor="f-name">الاسم</label>
            <input id="f-name" name="name" autoComplete="name" maxLength={100} aria-invalid={!!errors.name} />
            {errors.name && <span className="err" role="alert">{errors.name}</span>}

            <label htmlFor="f-phone">رقم الهاتف</label>
            <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" style={{ textAlign: "right" }} aria-invalid={!!errors.phone} />
            {errors.phone && <span className="err" role="alert">{errors.phone}</span>}

            <label htmlFor="f-type">نوع الطلب</label>
            <select id="f-type" value={type} onChange={(e) => setType(e.target.value)} className={type ? "filled" : ""} aria-invalid={!!errors.type}>
              <option value="" disabled>بيع عقار</option>
              {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <span className="err" role="alert">{errors.type}</span>}

            <label htmlFor="f-msg">رسالتك</label>
            <textarea id="f-msg" name="message" maxLength={2000} placeholder="أخبرنا عن العقار الذي تبحث عنه" aria-invalid={!!errors.message} />
            {errors.message && <span className="err" role="alert">{errors.message}</span>}

            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button className="pill dark" type="submit" disabled={state === "sending"}>{state === "sending" ? "جارٍ الإرسال…" : "إرسال الطلب"}</button>
            {state === "done" && <div className="ok" role="status">تم إرسال طلبك بنجاح. سيتواصل معك أحد مستشارينا قريبًا.</div>}
            {state === "fail" && <p className="fail" role="alert">{failMsg}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
