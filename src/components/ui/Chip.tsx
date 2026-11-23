import { X } from "lucide-react";
import { Icon } from "./Icon";

export function Chip({
  label,
  onRemove,
  removeLabel,
}: {
  label: string;
  onRemove?: () => void;
  /** Accessible name of the remove button, e.g. "Remove onion". */
  removeLabel?: string;
}) {
  return (
    <span
      className={`bg-paper-sunk text-button text-ink inline-flex min-h-9 items-center gap-1 rounded-full font-medium ${
        onRemove ? "pr-1 pl-3" : "px-3"
      }`}
    >
      {label}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="text-ink-muted hover:bg-line hover:text-ink inline-grid size-7 cursor-pointer place-items-center rounded-full"
        >
          <Icon icon={X} size={16} />
        </button>
      ) : null}
    </span>
  );
}
