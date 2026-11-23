import type { LucideIcon } from "lucide-react";

/** Lucide icon at the Sofrito defaults: 1.75 stroke, decorative unless labelled elsewhere. */
export function Icon({
  icon: Glyph,
  size = 20,
  className,
  filled = false,
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
  /** Fill the shape with currentColor (used for the "saved" bookmark). */
  filled?: boolean;
}) {
  return (
    <Glyph
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
      focusable="false"
      fill={filled ? "currentColor" : "none"}
      className={className}
    />
  );
}
