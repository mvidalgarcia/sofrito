import type { ReactNode } from "react";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export function PageHeader({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">{left}</div>
        <div className="flex items-center gap-2">
          {right}
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
}
