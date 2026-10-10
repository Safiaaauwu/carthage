import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icons";

/** Galerie : 1 grande image + 2 empilées (comme la maquette). Plus de 3 images → « +N » et visionneuse. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = images.length;
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Page RTL : la flèche gauche = image suivante.
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, close, step]);

  if (n === 0) return <div className="gal n0" aria-hidden="true" />;

  const tile = (i: number, extra?: number) => (
    <button type="button" className="gt" onClick={() => setOpen(i)} aria-label={`عرض الصورة ${i + 1} من ${n}`}>
      <img src={images[i]} alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} />
      {extra ? <span className="more">+{extra}</span> : null}
    </button>
  );

  return (
    <>
      <div className={"gal n" + Math.min(n, 3)}>
        <div className="big">{tile(0)}</div>
        {n === 2 && <div className="side one">{tile(1)}</div>}
        {n >= 3 && <div className="side">{tile(1)}{tile(2, n > 3 ? n - 3 : 0)}</div>}
      </div>

      {open !== null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={title} onClick={close}>
          <button className="lb-x" onClick={close} aria-label="إغلاق"><Icon name="close" size={28} /></button>
          {n > 1 && <button className="lb-n next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="التالية"><Icon name="next" size={34} /></button>}
          <img src={images[open]} alt="" onClick={(e) => e.stopPropagation()} />
          {n > 1 && <button className="lb-n prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="السابقة"><Icon name="prev" size={34} /></button>}
          <span className="lb-c">{open + 1} / {n}</span>
        </div>
      )}
    </>
  );
}
