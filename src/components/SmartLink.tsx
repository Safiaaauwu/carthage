import type { ReactNode } from "react";
// Lien interne (#ancre → défilement fluide) ou externe (nouvel onglet).
export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const external = /^https?:\/\//i.test(href);
  return external
    ? <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
    : <a href={href} className={className}>{children}</a>;
}
