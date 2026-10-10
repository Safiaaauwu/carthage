import { useEffect } from "react";
import { usePublishedProperties, useSettings } from "../lib/useSite";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Sections";
import { PropertyGrid } from "../components/Properties";

export default function AllProperties() {
  const s = useSettings();
  const { items, status } = usePublishedProperties();
  useEffect(() => { window.scrollTo(0, 0); document.title = `عقاراتنا — ${s.company_name}`; }, [s.company_name]);
  return (
    <>
      <Navbar s={s} variant="light" activeHref="#properties" />
      <main>
        <section className="props all-page">
          <div className="wrap">
            <span className="label">عقاراتنا</span>
            <h1 className="h2">جميع العقارات</h1>
            <PropertyGrid items={items} status={status} />
          </div>
        </section>
      </main>
      <Footer s={s} />
    </>
  );
}
