import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useProperty, usePublishedProperties, useSettings } from "../lib/useSite";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Sections";
import { Icon } from "../components/Icons";
import { Gallery } from "../components/Gallery";
import { PropertyForm } from "../components/PropertyForm";
import { PropertyGrid, fmtPrice } from "../components/Properties";

export default function PropertyPage() {
  const { id } = useParams();
  const s = useSettings();
  const p = useProperty(id);
  const others = usePublishedProperties({ limit: 3, excludeId: id });

  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => { if (p) document.title = `${p.title} — ${s.company_name}`; }, [p, s.company_name]);

  const nav = <Navbar s={s} variant="light" activeHref="#home" ctaHref="#inquiry" />;

  if (p === undefined) return <>{nav}<main className="sp"><p className="state" style={{ padding: "120px 20px" }}>جارٍ التحميل…</p></main></>;
  if (p === null) return (
    <>{nav}
      <main className="sp"><div className="state" style={{ padding: "120px 20px" }}>
        <p>هذا العقار غير متوفر.</p>
        <p style={{ marginTop: 24 }}><Link className="pill dark" to="/properties">شاهد جميع العقارات</Link></p>
      </div></main>
      <Footer s={s} />
    </>
  );

  const images = [p.image_url, ...(p.gallery ?? [])].filter((x): x is string => !!x);
  const features = (p.features ?? []).filter(Boolean);

  return (
    <>
      {nav}
      <main className="sp">
        <div className="sp-wrap"><Gallery images={images} title={p.title} /></div>
        <div className="sp-wrap sp-head">
          <h1>{p.title}</h1>
          <div className="loc2"><Icon name="pin" size={24} />{p.location}</div>
        </div>

        <div className="sp-grid">
          <div className="sp-info">
            <div className="facts">
              <div className="fact"><span className="ic"><Icon name="tag" size={34} /></span><span className="k">السعر</span><span className="v">{fmtPrice(p.price)}</span></div>
              <div className="fact"><span className="ic"><Icon name="ruler" size={34} /></span><span className="k">المساحة</span><span className="v">{p.area} م²</span></div>
              <div className="fact"><span className="ic"><Icon name="bed" size={34} /></span><span className="k">الغرف</span><span className="v">{p.rooms}</span></div>
              <div className="fact"><span className="ic"><Icon name="bath" size={34} /></span><span className="k">الحمامات</span><span className="v">{p.bathrooms}</span></div>
            </div>

            {p.description && (<section className="blk"><h2>الوصف</h2><p className="desc">{p.description}</p></section>)}
            {features.length > 0 && (
              <section className="blk"><h2>المميزات</h2>
                <ul className="feats">{features.map((f, i) => <li key={i}><Icon name="check" size={16} />{f}</li>)}</ul>
              </section>
            )}
            {p.location_info && (<section className="blk"><h2>معلومات الموقع</h2><p className="desc">{p.location_info}</p></section>)}
          </div>

          <PropertyForm property={p} />
        </div>
      </main>

      {(others.status !== "ready" || others.items.length > 0) && (
        <section className="props sp-other">
          <div className="wrap">
            <span className="label">عقارات مميزة</span>
            <h2 className="h2">عقارات اخرى</h2>
            <PropertyGrid items={others.items} status={others.status} />
            <div className="all"><Link className="pill outline" to="/properties">شاهد جميع العقارات</Link></div>
          </div>
        </section>
      )}
      <Footer s={s} />
    </>
  );
}
