import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  /** Square 44px button holding only an icon. Needs an aria-label. */
  icon?: boolean;
  block?: boolean;
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-tomato text-on-tomato hover:bg-tomato-hover",
  secondary:
    "border-line-strong bg-paper-raised text-ink hover:bg-paper-sunk aria-pressed:border-tomato-soft aria-pressed:bg-tomato-soft aria-pressed:text-tomato-ink",
  ghost: "border-transparent bg-transparent text-ink hover:bg-paper-sunk",
};

export function buttonClasses({
  variant = "secondary",
  icon = false,
  block = false,
  className = "",
}: ButtonStyleOptions = {}) {
  return [
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-sm border",
    "text-button font-semibold whitespace-nowrap no-underline",
    "transition-colors duration-150 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    "[&_svg]:shrink-0",
    icon ? "w-11 p-0" : "px-4",
    block ? "w-full" : "",
    VARIANTS[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentProps<"button"> & Omit<ButtonStyleOptions, "className">;

export function Button({
  variant,
  icon,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, icon, block, className })} {...props} />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & Omit<ButtonStyleOptions, "className">;

export function ButtonLink({ variant, icon, block, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, icon, block, className })} {...props} />;
}

/** Inline text link in the action colour. */
export const linkClasses =
  "inline-flex items-center gap-1 font-semibold text-tomato no-underline underline-offset-[3px] hover:underline";
