import { useMemo } from "react";
import { Outlet, Navigate, useNavigate } from "react-router";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuth } from "../lib/auth";
import { useChordKeybinding, type ChordBinding } from "../lib/useChordKeybinding";
import { ROUTE_CHORDS } from "../lib/route-chords";

import { AppSidebar } from "./AppSidebar";
import { BrandLoader } from "./BrandLoader";
import { CommandPalette } from "./CommandPalette";
import { NavigationProgress } from "./NavigationProgress";
import { Logo } from "./Logo";

/**
 * Application shell. Wraps every authenticated route in shadcn's
 * `SidebarProvider` + custom `AppSidebar` + `SidebarInset`. Inside the
 * inset, page content scrolls; sticky `PageHeader` rendered by each page
 * pins to the top of the scroll area.
 *
 * Replaces the previous hand-rolled Layout (570L) — collapse / mobile
 * drawer / sidebar resize / keyboard shortcuts all delegate to shadcn's
 * primitives. The bits that stayed:
 *   - Linear-style chord keybindings (g+letter routes) driven by
 *     ROUTE_CHORDS (lifted to `lib/route-chords.ts`).
 *   - The autofill honeypot pair at the top of the authenticated DOM —
 *     stops Chrome/Safari from filling login credentials into the first
 *     real form input on the page.
 *   - NavigationProgress / CommandPalette mounted once at the top.
 */
export function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Linear-style chord bindings. Derived from ROUTE_CHORDS so the
  // sidebar / palette / chords stay in lockstep — adding a route to
  // the map enables `g <key>` automatically. The hook itself bypasses
  // chords inside form inputs and while a Radix dialog is open, so
  // these are safe to register at the top of the authenticated layout.
  const chordBindings = useMemo<ChordBinding[]>(
    () =>
      Object.entries(ROUTE_CHORDS).map(([path, key]) => ({
        prefix: "g",
        key,
        handler: () => navigate(path),
        label: path,
      })),
    [navigate],
  );
  useChordKeybinding(chordBindings);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <BrandLoader size="lg" label="Loading session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TooltipProvider delayDuration={250}>
      <SidebarProvider>
        <NavigationProgress />
        <CommandPalette />

        {/* Autofill honeypot. Chrome / Safari ignore autoComplete="off"
            on text inputs and aggressively offer the saved login
            email/password on the first plausible-looking input they find.
            Sit a hidden input + password pair at the very top of the
            authenticated DOM so the browser fills it instead of any real
            Title / search / whatever input downstream. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            height: 0,
            width: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <input type="text" tabIndex={-1} autoComplete="username" name="username" />
          <input
            type="password"
            tabIndex={-1}
            autoComplete="current-password"
            name="password"
          />
        </div>

        <AppSidebar />

        <SidebarInset className="flex flex-col h-svh overflow-hidden">
          {/* Mobile header — shadcn SidebarTrigger doubles as the
              hamburger; logo + name read as the app identifier when the
              sidebar is hidden behind the sheet. Desktop: SidebarTrigger
              is hidden via `md:hidden` because the sidebar is always
              visible (or icon-collapsed) on md+. */}
          <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border">
            <SidebarTrigger />
            <Logo size="sm" />
            <span className="font-mono font-bold text-sm text-brand">openma</span>
          </div>

          <div className="flex-1 overflow-y-auto bg-bg">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
