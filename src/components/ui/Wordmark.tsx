import Link from "next/link";

/** The "sofrito" wordmark, linking home. */
export function Wordmark({ size = "header" }: { size?: "header" | "hero" }) {
  return (
    <Link
      href="/"
      className={`font-display text-ink inline-flex items-center gap-2 leading-none tracking-[-0.01em] no-underline ${
        size === "hero" ? "text-[56px]" : "text-[22px]"
      }`}
    >
      sofrito
    </Link>
  );
}
