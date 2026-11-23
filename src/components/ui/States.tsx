import { CircleAlert, LoaderCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { Mark } from "./Wordmark";

export function EmptyState({
  icon,
  title,
  text,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="bg-saffron-soft text-saffron-ink grid size-16 place-items-center rounded-full">
        <Icon icon={icon} size={28} />
      </div>
      <h2 className="font-display text-card-title">{title}</h2>
      {text ? (
        <p className="text-ink-muted max-w-[32ch] text-[15px] leading-[22px]">{text}</p>
      ) : null}
      {actions ? <div className="flex flex-col items-center gap-2 pt-2">{actions}</div> : null}
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return <Icon icon={LoaderCircle} size={size} className="animate-spin" />;
}

/** The sautéing pan and a status line over skeleton cards, used while a recipe is being written. */
export function LoadingState({ label, cards = 1 }: { label: string; cards?: number }) {
  return (
    <section aria-busy="true" className="flex flex-col gap-3">
      <p role="status" className="text-body-s text-ink-muted flex items-center gap-3 pt-3">
        <Mark size={44} animated />
        {label}
      </p>
      {Array.from({ length: cards }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="border-line bg-paper-raised flex flex-col gap-3 rounded-md border p-4"
        >
          <div className="bg-paper-sunk h-[26px] w-[72%] animate-pulse rounded-sm" />
          <div className="bg-paper-sunk h-3.5 w-[54%] animate-pulse rounded-sm" />
          <div className="bg-paper-sunk h-3.5 w-[90%] animate-pulse rounded-sm" />
        </div>
      ))}
    </section>
  );
}

/**
 * Page-level loading: the pan mark tossing its ingredients, with a line below.
 * `fullScreen` centres it in the viewport, for before any page chrome exists.
 * It fades in after a beat so quick loads don't flash it.
 */
export function PageLoading({
  label,
  fullScreen = false,
}: {
  label: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      role="status"
      className={`loader-fade-in text-ink-muted flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "bg-paper min-h-screen" : "py-16"
      }`}
    >
      <Mark size={72} animated />
      <span className="text-body-s">{label}</span>
    </div>
  );
}

export function ErrorAlert({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="border-line bg-paper-raised flex items-start gap-3 rounded-md border px-4 py-3"
    >
      <span className="text-danger mt-0.5">
        <Icon icon={CircleAlert} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-button text-danger font-semibold">{title}</p>
        {text ? <p className="text-body-s text-ink-muted">{text}</p> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
