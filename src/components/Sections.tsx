import { SERVICES, WHY } from "../data/services";
import { DEFAULT_IMAGES, type Settings } from "../lib/types";
import { Icon } from "./Icons";
import { SmartLink } from "./SmartLink";

/** Image de fond appliquée seulement une fois les paramètres chargés. */
const bg = (ready: boolean | undefined, url: string) =>
  ready ? { backgroundImage: `url("${url.replace(/"/g, "%22")}")` } : undefined;

export function Hero({ s }: { s: Settings }) {
  return (
    <section id="home" className="hero" style={bg(s.ready, s.hero_image_url || DEFAULT_IMAGES.hero)}>
      <div className="body">
        <h1>نساعدك على إيجاد<br />العقار المناسب بثقة</h1>
        <p>وكالة قرطاج العقارية، شريكك الموثوق في بيع وإيجار واستثمار العقارات في باتنة. نرافقك بخبرة واستشارة متخصصة في كل خطوة.</p>
        <div className="btns">
          <SmartLink href={s.cta_properties_link} className="pill dark">استكشف العقارات</SmartLink>
          <SmartLink href={s.cta_consult_link} className="pill cream">تحدث مع مستشار</SmartLink>
        </div>
      </div>
    </section>
  );
}

export function About({ s }: { s: Settings }) {
  return (
    <section id="about" className="about">
      <div className="wrap grid">
        <div className="txt">
          <div>
            <span className="label">من نحن</span>
            <h2 className="h2">قرطاج، شريكك في العقار</h2>
          </div>
          <div className="paras">
            <p>تعمل وكالة قرطاج العقارية على تقديم حلول عقارية متكاملة للأفراد والمستثمرين، من خلال خبرة في العقارات السكنية والاستثمارية ومعرفة دقيقة بالسوق المحلي في باتنة.</p>
            <p>نؤمن أن العقار ليس مجرد مساحة، بل قرار مهم يحتاج إلى رؤية واضحة، استشارة موثوقة، ومرافقة حقيقية. لذلك نعمل على تبسيط الرحلة العقارية وتقديم حلول تتناسب مع احتياجات كل عميل.</p>
            <div className="btnrow"><SmartLink href={s.cta_consult_link} className="pill dark">تواصل مع فريقنا</SmartLink></div>
          </div>
        </div>
        <div className="img">{s.ready && <img src={s.about_image_url || DEFAULT_IMAGES.about} alt="" loading="lazy" />}</div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className="services">
      <div className="wrap">
        <span className="label">خدماتنا</span>
        <h2 className="h2">حلول عقارية تناسب احتياجاتك</h2>
        <div className="grid">
          {SERVICES.map((v) => (
            <article className="svc" key={v.title}>
              <div className="ic"><Icon name={v.icon} size={30} /></div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="why">
      <div className="wrap grid">
        <div>
          <span className="label">لماذا قرطاج؟</span>
          <h2 className="h2">خبرة تجعل قرارك العقاري أوضح</h2>
        </div>
        <div className="list">
          {WHY.map((w) => (
            <article className="wc" key={w.title}>
              <div><h3>{w.title}</h3><p>{w.text}</p></div>
              <div className="ic"><Icon name={w.icon} size={30} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Invest({ s }: { s: Settings }) {
  return (
    <section className="invest" style={bg(s.ready, s.invest_image_url || DEFAULT_IMAGES.invest)}>
      <div className="body">
        <h2>استثمر في العقار برؤية أوضح</h2>
        <p>نساعدك على فهم الفرص العقارية ودراسة الخيارات التي تتناسب مع أهدافك الاستثمارية.</p>
        <SmartLink href={s.cta_consult_link} className="pill cream">تحدث مع مستشار</SmartLink>
      </div>
    </section>
  );
}

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="footer">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="in">
          <div className="brand"><div>شريكك الموثوق في العقار</div><div>© {s.company_name} — جميع الحقوق محفوظة</div></div>
          <nav className="links" aria-label="روابط التذييل">
            <a href="#home">الرئيسية</a><a href="#properties">عقاراتنا</a><a href="#services">خدماتنا</a><a href="#about">عن قرطاج</a><a href="#contact">تواصل معنا</a>
          </nav>
          <SmartLink href={s.cta_consult_link} className="pill cream">اطلب استشارة</SmartLink>
        </div>
      </div>
    </footer>
  );
}
