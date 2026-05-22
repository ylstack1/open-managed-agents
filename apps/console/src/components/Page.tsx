import type { ReactNode } from "react";

/**
 * Standard scrollable page wrapper. Optional `header` slot is rendered
 * outside the scroll padding so a sticky `PageHeader` stays pinned to
 * the top of the scroll area while content scrolls underneath.
 *
 * Use for content/detail/list pages. Pages with custom chrome (chat-style
 * shells like SessionDetail) keep their own layout.
 */
interface PageProps {
  children: ReactNode;
  /** Sticky page header — usually a `<PageHeader />`. Rendered before
   *  the padded content area so it can use `sticky top-0` and not be
   *  offset by the page padding. */
  header?: ReactNode;
  className?: string;
}

export function Page({ header, children, className = "" }: PageProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {header}
      <div className={`flex-1 py-4 md:py-8 lg:py-10 ${className}`.trim()}>
        {/* When a sticky header is set, its sibling content gets a
            sticky-friendly top margin via py-* on the container above.
            Without a header, fall through to the standard padded box so
            existing callers keep their look. */}
        {header ? children : <div className="px-4 md:px-8 lg:px-10">{children}</div>}
      </div>
    </div>
  );
}
