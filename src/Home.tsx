import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "./lib/useSite";
import { Navbar } from "./components/Navbar";
import { About, Footer, Hero, Invest, Services, Why } from "./components/Sections";
import { Properties } from "./components/Properties";
import { Contact } from "./components/Contact";

export default function Home() {
  const s = useSettings();
  const { hash } = useLocation();
  // Arrivée depuis une autre page (/#contact) : le contenu est rendu après coup, on défile une fois prêt.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 350);
    return () => clearTimeout(t);
  }, [hash]);
  return (
    <>
      <Navbar s={s} />
      <main>
        <Hero s={s} /><About s={s} /><Services /><Properties /><Why /><Invest s={s} /><Contact s={s} />
      </main>
      <Footer s={s} />
    </>
  );
}
