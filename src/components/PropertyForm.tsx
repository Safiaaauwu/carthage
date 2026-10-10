import { useState, type FormEvent } from "react";
import { REQUEST_TYPES, type Property } from "../lib/types";
import { sendContact, validate, type Errors } from "../lib/contact";

export function PropertyForm({ property, onAdvisor }: { property: Property; onAdvisor?: () => void }) {
  const [intent, setIntent] = useState<"visit" | "advisor">("visit");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "fail">("idle");
  const [failMsg, setFailMsg] = useState("");

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
    const res = await sendContact({
      name, phone, request_type: type, message, website: String(f.get("website") ?? ""),
      property_id: property.id, intent,
    });
    if (!res.ok) { setFailMsg(res.message); setState("fail"); return; }
    form.reset(); setType(""); setState("done");
  }

  return (
    <form className="pf" id="inquiry" onSubmit={onSubmit} noValidate>
      <div className="pf-card">
        <h2>مهتم بهذا العقار؟</h2>
        <p className="sub">اترك معلوماتك وسيتواصل معك أحد مستشاري قرطاج.</p>

        <div className="tg" role="group" aria-label="نوع الرغبة">
          <button type="button" aria-pressed={intent === "visit"} onClick={() => setIntent("visit")}>ارغب في زيارة العقار</button>
          <button type="button" aria-pressed={intent === "advisor"} onClick={() => { setIntent("advisor"); onAdvisor?.(); }}>تحدث مع مستشار</button>
        </div>

        <div className="two">
          <div className="fl">
            <label htmlFor="pf-name">الاسم</label>
            <input id="pf-name" name="name" autoComplete="name" maxLength={100} aria-invalid={!!errors.name} />
            {errors.name && <span className="err" role="alert">{errors.name}</span>}
          </div>
          <div className="fl">
            <label htmlFor="pf-phone">رقم الهاتف</label>
            <input id="pf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" style={{ textAlign: "right" }} aria-invalid={!!errors.phone} />
            {errors.phone && <span className="err" role="alert">{errors.phone}</span>}
          </div>
        </div>

        <div className="fl">
          <label htmlFor="pf-type">نوع الطلب</label>
          <select id="pf-type" value={type} onChange={(e) => setType(e.target.value)} className={type ? "filled" : ""} aria-invalid={!!errors.type}>
            <option value="" disabled>بيع عقار</option>
            {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <span className="err" role="alert">{errors.type}</span>}
        </div>

        <div className="fl">
          <label htmlFor="pf-msg">رسالتك</label>
          <textarea id="pf-msg" name="message" maxLength={2000} placeholder="أخبرنا عن العقار الذي تبحث عنه" aria-invalid={!!errors.message} />
          {errors.message && <span className="err" role="alert">{errors.message}</span>}
        </div>

        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      <button className="pill dark pf-send" type="submit" disabled={state === "sending"}>{state === "sending" ? "جارٍ الإرسال…" : "إرسال الطلب"}</button>
      {state === "done" && <div className="ok" role="status">تم إرسال طلبك بنجاح. سيتواصل معك أحد مستشارينا قريبًا.</div>}
      {state === "fail" && <p className="fail" role="alert">{failMsg}</p>}
    </form>
  );
}
