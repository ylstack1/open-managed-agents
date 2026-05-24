import { useMemo } from "react";
import type { ComponentType } from "react";
import { NavLink, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { TenantSwitcher } from "./TenantSwitcher";
import { Logo } from "./Logo";
import { UserProfile } from "./UserProfile";
import {
  AgentIcon,
  ApiKeysIcon,
  RuntimesIcon,
  DashboardIcon,
  EnvIcon,
  FilesIcon,
  GitHubIcon,
  LinearIcon,
  MemoryIcon,
  ModelCardsIcon,
  SessionsIcon,
  SkillsIcon,
  SlackIcon,
  VaultIcon,
} from "./icons";
import { consolePlugins } from "../plugins/registry";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/* ── Navigation groups — single source of truth for sidebar items ── */
const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: DashboardIcon, end: true }],
  },
  {
    label: "Managed Agents",
    items: [
      { to: "/agents", label: "Agents", icon: AgentIcon },
      { to: "/sessions", label: "Sessions", icon: SessionsIcon },
      { to: "/files", label: "Files", icon: FilesIcon },
      { to: "/evals", label: "Eval Runs", icon: SessionsIcon },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { to: "/environments", label: "Environments", icon: EnvIcon },
      { to: "/vaults", label: "Credential Vaults", icon: VaultIcon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/skills", label: "Skills", icon: SkillsIcon },
      { to: "/memory", label: "Memory Stores", icon: MemoryIcon },
      { to: "/model-cards", label: "Model Cards", icon: ModelCardsIcon },
      { to: "/api-keys", label: "API Keys", icon: ApiKeysIcon },
      { to: "/runtimes", label: "Local Runtimes", icon: RuntimesIcon },
    ],
  },
  {
    label: "Integrations",
    items: [
      { to: "/integrations/linear", label: "Linear", icon: LinearIcon },
      { to: "/integrations/github", label: "GitHub", icon: GitHubIcon },
      { to: "/integrations/slack", label: "Slack", icon: SlackIcon },
    ],
  },
];

/**
 * Console sidebar — cloned from minimaxhub_benchmark/AppShell so the
 * brand-row recipe matches a known-good layout:
 *
 *   `<SidebarHeader className="bg-sidebar h-11 px-3 flex-row items-
 *   center gap-2">` directly hosts the brand row (no nested wrapper
 *   div). `flex-row` overrides shadcn's default `flex-col`, putting
 *   logo + name on one line aligned with the AppShell top toolbar.
 *
 *   `<Sidebar className="bg-sidebar border-0 group-data-[side=left]:
 *   border-r-0">` — bg-sidebar matches the AppShell outer wrapper so
 *   they read as one continuous stage; the border-0 + border-r-0
 *   pair strips shadcn's default right border which otherwise anti-
 *   aliases into a dark hairline against the rounded main panel.
 *
 * Footer also gets `bg-sidebar p-0` so the UserProfile row sits flush
 * on the stage instead of in a padded card.
 */
export function AppSidebar() {
  const { pathname } = useLocation();

  const items = useMemo(
    () =>
      [...navGroups, ...consolePlugins.flatMap((p) => p.navGroups ?? [])].flatMap(
        (g) => g.items,
      ),
    [],
  );

  const isItemActive = (to: string, end?: boolean) => {
    if (end) return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar border-0 group-data-[side=left]:border-r-0"
    >
      <SidebarHeader className="bg-sidebar h-11 px-3 flex-row items-center gap-2">
        <Logo size="sm" />
        <span className="font-mono font-bold text-base text-brand group-data-[collapsible=icon]:hidden">
          openma
        </span>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {/* Flat nav — every item lives in ONE SidebarMenu with no
            group wrappers. Inactive rows stay completely transparent
            (no pill, no hover fill); only the active route gets the
            gray bg-sidebar-accent pill. The `!` overrides on the
            non-active background are necessary because Tailwind v4's
            `data-active:` variant matches the attribute regardless of
            value (true/false both fire), so shadcn's built-in
            `data-active:bg-sidebar-accent` would otherwise paint every
            row. */}
        <SidebarMenu>
          {items.map((item) => {
            const active = isItemActive(item.to, item.end);
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className={
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "!bg-transparent hover:!bg-transparent !text-sidebar-foreground hover:!text-sidebar-foreground"
                  }
                >
                  <NavLink to={item.to} end={item.end}>
                    <item.icon className="size-4 opacity-80" />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer stacks tenant on top, user below. Both use the same
          custom h-11 px-3 recipe as the brand row in SidebarHeader, so
          collapse behavior matches the openma logo at the top: icon
          stays at x=12, text hides via
          `group-data-[collapsible=icon]:hidden`. */}
      <SidebarFooter className="bg-sidebar p-0">
        <TenantSwitcher />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
