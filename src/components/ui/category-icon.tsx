import {
  Bot,
  Dog,
  Droplets,
  PanelTop,
  PersonStanding,
  ToyBrick,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

/**
 * Categories store an icon *name* in the database so the admin can pick one
 * without touching code. Only these are wired up — anything else falls back
 * to the generic robot glyph rather than rendering nothing.
 */
const ICONS: Record<string, LucideIcon> = {
  Bot,
  Droplets,
  Trees,
  Waves,
  PanelTop,
  PersonStanding,
  Dog,
  ToyBrick,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || Bot;
  return <Icon className={className} aria-hidden="true" />;
}
