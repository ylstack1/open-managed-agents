import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";

import { cn } from "@/lib/utils";

import type { AppOutletContext } from "./AppShell";

/**
 * Page header — rendered via React portal into AppShell's
 * `pageHeaderSlot`, which sits ABOVE the scroll container as a
 * `shrink-0` sibling. The slot literally cannot scroll, so the header
 * never moves; no sticky positioning required, and no fragile CSS-var
 * coordination with table heads (those just use `sticky top-0` inside
 * `<main>`, which puts them right below this slot).
 *
 * Three slots:
 *   - `title`     → page name (required)
 *   - `subtitle`  → optional one-liner under the title
 *   - `actions`   → right-side button row (filters, CTAs)
 *
 * Optional `toolbar` slot renders as a second row below the title —
 * use it for filters/search/segment-pickers.
 *
 * Returns null when the slot isn't mounted (e.g. rendered outside
 * AppShell), so pages won't crash if called from an unauthenticated
 * shell-less route.
 */
interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  toolbar,
  className,
}: PageHeaderProps) {
  const ctx = useOutletContext<AppOutletContext | undefined>();
  const slot = ctx?.pageHeaderSlot;
  if (!slot) return null;

  return createPortal(
    <div className={cn("bg-bg", className)}>
      <div className="flex items-start gap-4 px-4 py-3 md:px-8 lg:px-10">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-fg-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
      {toolbar && (
        <div className="flex items-center gap-2 px-4 pb-3 md:px-8 lg:px-10 overflow-x-auto">
          {toolbar}
        </div>
      )}
    </div>,
    slot,
  );
}
