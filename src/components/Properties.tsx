import { Link } from "react-router-dom";
import { LISTING_LABEL, type Property } from "../lib/types";
import { usePublishedProperties } from "../lib/useSite";
import { Icon } from "./Icons";

export const fmtPrice = (n: number) => n.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");

export function PropertyCard({ p }: { p: Property }) {
  const href = `/properties/${p.id}`;
  return (
    <article className="pc">
      <Link to={href} className="ph" tabIndex={-1} aria-hidden="true">
        {p.image_url && <img src={p.image_url} alt="" loading="lazy" />}
        <span className={"tag " + p.listing_type}>{LISTING_LABEL[p.listing_type] ?? LISTING_LABEL.sale}</span>
      </Link>
      <div className="b">
        <span className="cat">{p.category}</span>
        <h3>{p.title}</h3>
        <div className="loc"><Icon name="pin" size={13} />{p.location}</div>
        <div className="meta">
          <span><Icon name="ruler" size={14} />{p.area} م²</span>
          <span><Icon name="bed" size={14} />{p.rooms} غرف</span>
          <span><Icon name="bath" size={14} />{p.bathrooms} حمام</span>
        </div>
        <div className="foot">
          <span className="price">{fmtPrice(p.price)} دج</span>
          <Link className="pill dark" to={href}>عرض التفاصيل</Link>
        </div>
      </div>
    </article>
  );
}

export function PropertyGrid({ items, status }: { items: Property[]; status: "loading" | "ready" | "error" }) {
  return (
    <div className="grid" aria-busy={status === "loading"}>
      {status === "loading" && <p className="state">جارٍ تحميل العقارات…</p>}
      {status === "error" && <p className="state">تعذّر تحميل العقارات حاليًا. حاول مرة أخرى لاحقًا.</p>}
      {status === "ready" && items.length === 0 && <p className="state">لا توجد عقارات منشورة حاليًا.</p>}
      {items.map((p) => <PropertyCard key={p.id} p={p} />)}
    </div>
  );
}

/** Section « عقارات مميزة » de l'accueil : 3 biens + lien vers la page de tous les biens. */
export function Properties() {
  const { items, status } = usePublishedProperties({ limit: 3 });
  return (
    <section id="properties" className="props">
      <div className="wrap">
        <span className="label">عقارات مميزة</span>
        <h2 className="h2">عقارات مميزة</h2>
        <PropertyGrid items={items} status={status} />
        <div className="all"><Link className="pill outline" to="/properties">شاهد جميع العقارات</Link></div>
      </div>
    </section>
  );
}
