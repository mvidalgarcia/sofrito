import Link from "next/link";

/**
 * The Sofrito mark: a pan with tomato, pepper and an olive leaf jumping in.
 * Drawn with theme tokens so the pan follows dark mode. `animated` tosses the
 * pan and sends the ingredients flying, for loading screens (see globals.css).
 */
export function Mark({
  size = 28,
  className = "",
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`flex-none overflow-visible ${animated ? "saute" : ""} ${className}`}
    >
      <g transform="translate(0 3)">
        <g className="saute-pan">
          <path d="M7 35h38c0 10-7.5 17.5-17.5 17.5h-3C14.5 52.5 7 45 7 35z" className="fill-ink" />
          <rect x="4" y="32" width="44" height="5" rx="2.5" className="fill-ink" />
          <rect
            x="45"
            y="31.5"
            width="17"
            height="5"
            rx="2.5"
            transform="rotate(-10 47 34)"
            className="fill-ink"
          />
        </g>
        <g className="saute-bit saute-tomato">
          <rect
            x="9.5"
            y="15"
            width="11.5"
            height="11.5"
            rx="2.75"
            transform="rotate(-18 15.25 20.75)"
            className="fill-tomato"
          />
        </g>
        <g className="saute-bit saute-pepper">
          <rect
            x="21.5"
            y="3"
            width="9.5"
            height="9.5"
            rx="2.5"
            transform="rotate(16 26.25 7.75)"
            className="fill-saffron"
          />
        </g>
        <g className="saute-bit saute-leaf">
          <path d="M31.5 25.5c2.6-6.4 9-9.6 15-8.6-1.9 6.4-9 10.2-15 8.6z" className="fill-olive" />
          <path
            d="M33.6 24.2c3.4-1.9 6.6-3.6 10.4-5.4"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
            className="stroke-olive-soft"
          />
        </g>
      </g>
    </svg>
  );
}

/** The "sofrito" wordmark beside the mark, linking home. */
export function Wordmark({ size = "header" }: { size?: "header" | "hero" }) {
  const hero = size === "hero";
  return (
    <Link
      href="/"
      className={`font-display text-ink inline-flex items-center leading-none tracking-[-0.01em] no-underline ${
        hero ? "gap-3 text-[56px]" : "gap-2 text-[22px]"
      }`}
    >
      <Mark size={hero ? 64 : 28} />
      sofrito
    </Link>
  );
}
