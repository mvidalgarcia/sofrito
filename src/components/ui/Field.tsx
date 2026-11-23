import { CircleAlert, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./Icon";

export const labelClasses = "text-label font-semibold tracking-[0.08em] text-ink-muted uppercase";

const controlClasses =
  "box-border w-full rounded-sm border border-line-strong bg-paper-raised px-4 py-3 text-body text-ink placeholder:text-ink-faint focus:border-ink aria-invalid:border-danger";

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return <label className={`${labelClasses} ${className}`} {...props} />;
}

export function Input({
  leadingIcon,
  className = "",
  ...props
}: ComponentProps<"input"> & { leadingIcon?: LucideIcon }) {
  if (!leadingIcon) {
    return <input className={`${controlClasses} min-h-12 ${className}`} {...props} />;
  }
  return (
    <div className="relative flex min-w-0 flex-1 items-center">
      <span className="text-ink-muted pointer-events-none absolute left-4">
        <Icon icon={leadingIcon} />
      </span>
      <input className={`${controlClasses} min-h-12 pl-11 ${className}`} {...props} />
    </div>
  );
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${controlClasses} min-h-24 resize-y ${className}`} {...props} />;
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-body-s text-danger flex items-start gap-2">
      <Icon icon={CircleAlert} size={16} className="mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

export function Field({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>;
}
