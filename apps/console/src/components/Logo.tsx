/**
 * Brand mark — the JetBrains-Mono `[horse]` logo. Single source of truth
 * so future logo swaps (or alt-text tweaks) are atomic.
 *
 * Width/height HTML attrs (in addition to CSS classes) so the browser
 * reserves the correct box BEFORE the SVG finishes downloading — without
 * them the inline <img> renders at 0×0 until the SVG lands and pops to
 * its final size, which reads as a "jump" in the sidebar header.
 */
const SIZE_CLASSES = {
  sm: { cls: "h-8", px: 32 },
  md: { cls: "h-9", px: 36 },
  lg: { cls: "h-10", px: 40 },
} as const;

interface LogoProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function Logo({ size = "sm", className = "" }: LogoProps) {
  const { cls, px } = SIZE_CLASSES[size];
  return (
    <img
      src="/logo.svg"
      alt="openma"
      width={px}
      height={px}
      className={`${cls} shrink-0 ${className}`.trim()}
    />
  );
}
