import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DEFAULT_IMAGES, type Settings } from "../lib/types";

export const NAV = [
  { href: "#home", label: "الرئيسية" },
  { href: "#properties", label: "عقاراتنا" },
  { href: "#services", label: "خدماتنا" },
  { href: "#about", label: "عن قرطاج" },
  { href: "#contact", label: "تواصل معنا" },
];

type Props = {
  s: Settings;
  /** "overlay" = sur le hero (accueil) ; "light" = pages intérieures, fond blanc. */
  variant?: "overlay" | "light";
  activeHref?: string;
  ctaHref?: string;
};

export function Navbar({ s, variant = "overlay", activeHref, ctaHref }: Props) {
  const home = variant === "overlay";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(activeHref ?? "#home");

  useEffect(() => {
    if (!home) { setActive(activeHref ?? "#home"); return; }
    const ids = NAV.map((n) => n.href.slice(1));
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = "home";
      for (const id of ids) { const el = document.getElementById(id); if (el && el.offsetTop <= y) cur = id; }
      setActive("#" + cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home, activeHref]);

  // Sur les pages intérieures, les ancres pointent vers l'accueil (/#section).
  const to = (h: string) => (/^https?:\/\//i.test(h) || !h.startsWith("#") || home ? h : "/" + h);
  const cta = ctaHref ?? to(s.cta_consult_link);
  const external = /^https?:\/\//i.test(cta);

  return (
    <header className={"nav" + (home ? "" : " light")}>
      <div className="in">
        <a href={home ? "#home" : "/"} className="logo" aria-label={s.company_name}>
          <img src={s.logo_url || DEFAULT_IMAGES.logo} alt={s.company_name} style={s.ready ? undefined : { visibility: "hidden" }} />
        </a>
        <nav className="links" aria-label="التنقل الرئيسي">
          {NAV.map((n) => <a key={n.href} href={to(n.href)} className={active === n.href ? "active" : ""}>{n.label}</a>)}
        </nav>
        <a href={cta} className="pill black cta" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>اطلب استشارة</a>
        <button className="burger" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <div className={"mobile-menu" + (open ? " open" : "")} onClick={() => setOpen(false)}>
        {NAV.map((n) => <a key={n.href} href={to(n.href)}>{n.label}</a>)}
        <a href={cta} className="pill">اطلب استشارة</a>
      </div>
    </header>
  );
}
