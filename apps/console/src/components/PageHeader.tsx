import { useLayoutEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Sticky page header. Lives directly under shadcn `SidebarInset` so it
 * sticks to the top of the inset while page content scrolls underneath.
 *
 * Three slots:
 *   - `title`     → page name (required)
 *   - `subtitle`  → optional one-liner under the title
 *   - `actions`   → right-side button row (filters, CTAs)
 *
 * Optional `toolbar` slot renders as a second sticky row below the title
 * — use it for filters/search/segment-pickers that should stay reachable
 * while the user scrolls (the project-wide "sticky everything" goal).
 *
 * On mount + every resize, publishes its own height to
 * `document.documentElement` as `--page-header-height`. Sticky surfaces
 * inside the page body (table heads especially) read it via
 * `top-[var(--page-header-height)]` so they pin directly below the
 * header without needing to hard-code a pixel offset.
 */
interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Secondary sticky row, typically filters + search. */
  toolbar?: ReactNode;
  /** Extra classes on the outermost sticky wrapper. */
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  toolbar,
  className,
}: PageHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Publish header height to document root so descendant sticky surfaces
  // (table heads, side rails) can pin below without hardcoding offsets.
  // ResizeObserver covers font reflow + responsive breakpoint flips +
  // toolbar add/remove without a render dep. Layout effect (not regular
  // effect) so the var is set before the browser paints, otherwise the
  // first paint can position a sticky thead behind the still-zero header.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      root.style.setProperty("--page-header-height", `${Math.ceil(h)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      // Drop the var when the header unmounts so sticky surfaces on
      // pages without a header don't pin against a stale value.
      root.style.removeProperty("--page-header-height");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        // bg-bg/80 + backdrop-blur lets content faintly bleed through on
        // scroll so the header reads as "floating chrome" rather than an
        // opaque cap. z-20 is one layer above sticky table heads (z-10),
        // one below Radix popovers (z-50).
        "sticky top-0 z-20 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60 border-b border-border",
        className,
      )}
    >
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
    </div>
  );
}
