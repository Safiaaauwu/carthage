import { Tag, KeyRound, MessageSquareText, TrendingUp, ArchiveRestore, Truck, BadgeCheck, Layers, Handshake, MapPin, Phone, Mail, MessageCircle, Instagram, Ruler, BedDouble, Bath, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

const map = {
  tag: Tag, key: KeyRound, chat: MessageSquareText, trend: TrendingUp, inbox: ArchiveRestore, truck: Truck,
  badge: BadgeCheck, layers: Layers, hands: Handshake, pin: MapPin, phone: Phone, mail: Mail,
  whatsapp: MessageCircle, instagram: Instagram, ruler: Ruler, bed: BedDouble, bath: Bath, check: Check, prev: ChevronRight, next: ChevronLeft, close: X,
} as const;
export type IconName = keyof typeof map;
export function Icon({ name, size = 26 }: { name: IconName; size?: number }) {
  const C = map[name];
  return <C size={size} strokeWidth={1.5} aria-hidden="true" />;
}
