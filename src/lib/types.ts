export type Property = {
  id: string; title: string; category: string; location: string; image_url: string | null;
  price: number; area: number; rooms: number; bathrooms: number; instagram_url: string | null;
  listing_type: "sale" | "rent"; description: string | null; features: string[]; location_info: string | null; gallery: string[];
  published: boolean; sort_order: number; created_at: string;
};
export type Submission = {
  id: string; name: string; phone: string; request_type: string; message: string;
  property_id: string | null; property_title: string | null; intent: "visit" | "advisor" | null;
  status: "جديد" | "تم التواصل" | "مغلق"; email_sent: boolean; created_at: string;
};
export type Settings = {
  company_name: string; phone: string; email: string; whatsapp: string; instagram_handle: string;
  instagram_url: string; address: string; cta_consult_link: string; cta_properties_link: string;
  hero_image_url: string | null; about_image_url: string | null; invest_image_url: string | null; logo_url: string | null;
  /** true une fois les paramètres chargés (évite d'afficher l'image par défaut avant l'image choisie). */
  ready?: boolean;
};
export const DEFAULT_SETTINGS: Settings = {
  company_name: "قرطاج", phone: "+213 34 00 00 00", email: "contact@adjila.dz", whatsapp: "+213 34 00 00 00",
  instagram_handle: "@adjila", instagram_url: "https://www.instagram.com/adjila/", address: "باتنة، الجزائر",
  cta_consult_link: "#contact", cta_properties_link: "#properties",
  hero_image_url: null, about_image_url: null, invest_image_url: null, logo_url: null,
};
export const DEFAULT_IMAGES = { hero: "/images/hero.jpg", about: "/images/about.jpg", invest: "/images/cta.jpg", logo: "/images/logo.png" };
export const REQUEST_TYPES = ["بيع عقار", "شراء عقار", "إيجار عقار", "استثمار عقاري", "استشارة عقارية", "أخرى"];
export const STATUSES = ["جديد", "تم التواصل", "مغلق"] as const;

export const LISTING_LABEL = { sale: "للبيع", rent: "للإيجار" } as const;
