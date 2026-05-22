import { useMemo } from "react";
import type { ComponentType } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { LogOutIcon, BookOpenIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { authClient } from "../lib/auth-client";
import { TenantSwitcher } from "./TenantSwitcher";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
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

const themeOptions = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "system" as const, label: "System" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center rounded-md bg-sidebar-accent p-0.5 gap-0.5">
      {themeOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex-1 inline-flex items-center justify-center px-2 py-1 text-xs rounded transition-colors duration-[var(--dur-quick)] ease-[var(--ease-soft)] ${
            theme === opt.value
              ? "bg-sidebar text-sidebar-foreground font-medium shadow-sm"
              : "text-fg-muted hover:text-sidebar-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function UserMenu() {
  const { user } = useAuth();
  if (!user) return null;
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <Avatar name={user.name || user.email} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-sidebar-foreground truncate">{user.name}</div>
        <div className="text-xs text-fg-subtle truncate">{user.email}</div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleSignOut}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOutIcon />
      </Button>
    </div>
  );
}

/**
 * Console sidebar — composed of shadcn `Sidebar` primitives so collapse,
 * mobile sheet, keyboard shortcut, and tooltip-on-collapsed all come for
 * free from `SidebarProvider`. The nav groups themselves are still
 * driven by the same `navGroups` list previously hand-rolled in Layout.
 *
 * Active-route highlighting uses `useLocation` + `isActive` on each
 * menu button — `NavLink` from react-router would also work, but the
 * shadcn `SidebarMenuButton` already styles the `data-[active]` state
 * with the brand-tinted accent, so we forward isActive via that prop
 * and skip the className branching.
 */
export function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Plugin-contributed groups (hosted-only extensions). Default empty
  // in OSS — hosted overlay-replaces plugins/registry.ts to add
  // billing / etc. Memoized so plugin lookup doesn't re-run every render.
  const groups = useMemo(
    () => [...navGroups, ...consolePlugins.flatMap((p) => p.navGroups ?? [])],
    [],
  );

  const isItemActive = (to: string, end?: boolean) => {
    if (end) return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-brand group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo size="sm" />
          <span className="font-mono font-bold text-base group-data-[collapsible=icon]:hidden">
            openma
          </span>
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <TenantSwitcher />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isItemActive(item.to, item.end);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
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
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="group-data-[collapsible=icon]:hidden space-y-2">
          <a
            href="https://docs.openma.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-fg-muted hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <BookOpenIcon className="size-4 opacity-60" />
            Documentation
          </a>
          <ThemeToggle />
          <UserMenu />
        </div>
        {/* Collapsed footer: doc icon + avatar */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-1">
          <a
            href="https://docs.openma.dev"
            target="_blank"
            rel="noopener noreferrer"
            title="Documentation"
            className="flex items-center justify-center size-8 text-fg-muted hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
          >
            <BookOpenIcon className="size-4" />
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
