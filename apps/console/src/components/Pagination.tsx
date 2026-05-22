import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon } from "lucide-react";

interface PaginationProps {
  /** Zero-based current page; rendered as `Page {pageIndex + 1}`. */
  pageIndex: number;
  pageSize: number;
  hasNext: boolean;
  /** Number of pages we have cursors for (i.e. visited so far). When
   *  `hasNext` is true an ellipsis tile renders after the known pages. */
  knownPages: number;
  /** Items currently on screen — used to render "Showing X-Y" range. */
  itemCount: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  onPageChange(index: number): void;
  onPageSizeChange(size: number): void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Build the visible list of page indices. Always shows page 0 and the
 * current page; collapses long runs with an ellipsis. Forward-only
 * cursor backend means we only know about pages we've visited — caller
 * passes `knownPages` (= cursor stack length) and `hasNext` to decide
 * whether to render the trailing "…" affordance.
 *
 * Returns a list of items: number = real page index, "…" = ellipsis tile.
 *
 * Examples (current = bold):
 *   knownPages=1, hasNext=true       → [**0**, …]
 *   knownPages=3, hasNext=true       → [0, 1, **2**, …]
 *   knownPages=8, hasNext=true,
 *     pageIndex=4                    → [0, …, 3, **4**, 5, …]
 *   knownPages=8, hasNext=false,
 *     pageIndex=7                    → [0, …, 5, 6, **7**]
 */
function buildPageList(
  pageIndex: number,
  knownPages: number,
  hasNext: boolean,
): Array<number | "…"> {
  const last = knownPages - 1; // highest known index
  const lo = Math.max(1, pageIndex - 1);
  const hi = Math.min(last - 1, pageIndex + 1);
  const out: Array<number | "…"> = [];

  out.push(0);
  if (lo > 1) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < last - 1) out.push("…");
  if (last > 0) out.push(last);
  if (hasNext) out.push("…");

  // Dedup consecutive duplicates (small knownPages can cause overlap).
  const dedup: Array<number | "…"> = [];
  for (const v of out) {
    if (v === dedup[dedup.length - 1]) continue;
    dedup.push(v);
  }
  return dedup;
}

/**
 * Full pagination footer for list pages.
 *
 *   Showing 21-40            [20 ▼ per page]            « ‹  3 [4] 5  …  ›
 *
 * Left:    "Showing X-Y" range (no total — backend is cursor-based, no count).
 * Middle:  shadcn Select page-size picker. Caller provides allowed values.
 * Right:   First / Prev / numbered tiles with ellipsis / Next, rendered
 *          via shadcn Button so focus rings + sizing stay aligned with
 *          the rest of the design system.
 *
 * Pair with `usePagedList`.
 */
export function Pagination({
  pageIndex,
  pageSize,
  hasNext,
  knownPages,
  itemCount,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  loading,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const hasPrev = pageIndex > 0;

  // 1-based range display. itemCount tells us the actual rows on screen
  // — true "to" is start + itemCount - 1, not start + pageSize - 1
  // (last page may be partial).
  const rangeStart = pageIndex * pageSize + 1;
  const rangeEnd = pageIndex * pageSize + itemCount;
  const showRange = itemCount > 0;

  const tiles = buildPageList(pageIndex, knownPages, hasNext);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border bg-bg-sidebar/40 px-4 py-2.5 flex-wrap">
      {/* Left: range */}
      <div className="text-[12px] text-fg-subtle font-mono tabular-nums min-w-[100px]">
        {showRange ? `Showing ${rangeStart}–${rangeEnd}` : " "}
      </div>

      {/* Middle: page size selector */}
      <div className="flex items-center gap-2 text-[12px] text-fg-subtle font-mono">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(parseInt(v, 10))}
        >
          <SelectTrigger
            aria-label="Rows per page"
            size="sm"
            className="w-auto min-w-[60px] tabular-nums"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)} className="tabular-nums">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-fg-subtle">per page</span>
      </div>

      {/* Right: nav (First / Prev / numbered / Next) */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(0)}
          disabled={!hasPrev || loading}
          aria-label="First page"
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!hasPrev || loading}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>
        {tiles.map((t, i) =>
          t === "…" ? (
            <span
              key={`ellipsis-${i}`}
              aria-hidden="true"
              className="inline-flex items-center justify-center min-w-[28px] h-7 px-1 text-[13px] text-fg-subtle font-mono select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={t}
              type="button"
              variant={t === pageIndex ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(t)}
              disabled={loading}
              aria-label={`Page ${t + 1}`}
              aria-current={t === pageIndex ? "page" : undefined}
              className="tabular-nums min-w-[32px]"
            >
              {t + 1}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!hasNext || loading}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
