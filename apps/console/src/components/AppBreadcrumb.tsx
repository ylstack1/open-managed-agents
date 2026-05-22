import { Fragment } from "react";
import { useLocation } from "react-router";
import { ChevronRightIcon } from "lucide-react";

import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Path-segment fallback when the URL doesn't map to a known top-level
 * route. Unknown segments fall back to start-cased text; the "" empty
 * segment for "/" is filtered out earlier.
 *
 * (Earlier draft used react-router's `useMatches()` to read per-route
 * `handle.crumb` overrides, but that hook is data-router-only and the
 * console mounts under `<BrowserRouter>` + declarative `<Routes>`, so
 * it throws at runtime: "useMatches must be used within a data router".
 * Until/unless we migrate main.tsx to `createBrowserRouter` +
 * `<RouterProvider>`, breadcrumbs derive purely from the URL.)
 */
const FALLBACK_LABELS: Record<string, string> = {
  agents: "Agents",
  sessions: "Sessions",
  files: "Files",
  evals: "Eval Runs",
  environments: "Environments",
  vaults: "Credential Vaults",
  skills: "Skills",
  memory: "Memory Stores",
  "model-cards": "Model Cards",
  "api-keys": "API Keys",
  runtimes: "Local Runtimes",
  integrations: "Integrations",
  linear: "Linear",
  github: "GitHub",
  slack: "Slack",
  billing: "Billing",
};

function titleize(seg: string): string {
  const known = FALLBACK_LABELS[seg];
  if (known) return known;
  return seg
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * AppShell breadcrumb. Splits the current pathname into cumulative
 * crumbs ("/sessions/abc123" → [Sessions, abc123]) and renders them in
 * the top toolbar. Hidden on the root path because the brand already
 * identifies the workspace there.
 */
export function AppBreadcrumb() {
  const { pathname } = useLocation();

  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return null;

  const crumbs = segs.map((seg, i) => ({
    label: titleize(seg),
    to: "/" + segs.slice(0, i + 1).join("/"),
  }));

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={c.to}>
              {i > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRightIcon className="size-3.5" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={c.to}>{c.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}
