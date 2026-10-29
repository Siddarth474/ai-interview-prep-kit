"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Book,
  Calendar,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  SquareStack,
} from "lucide-react";

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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import { authService } from "@/services/auth.service";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

const getKitNavItems = (kitId: string) => [
  {
    title: "Overview",
    url: `/dashboard/kit/${kitId}`,
    icon: LayoutDashboard,
  },
  {
    title: "Requirements",
    url: `/dashboard/kit/${kitId}/requirements`,
    icon: FileText,
  },
  {
    title: "Interview Questions",
    url: `/dashboard/kit/${kitId}/questions`,
    icon: Search,
  },
  {
    title: "Flashcards",
    url: `/dashboard/kit/${kitId}/flashcards`,
    icon: SquareStack,
  },
  {
    title: "Study Plan",
    url: `/dashboard/kit/${kitId}/study-plan`,
    icon: Calendar,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user } = useUser();
  const { isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Agar URL /dashboard/[id] hai toh params.id mil jayega
  const kitId = params?.id as string | undefined;
  const isKitView = Boolean(kitId);
  const activeNavItems =
    isKitView && kitId ? getKitNavItems(kitId) : mainNavItems;

  const displayName = user?.username || "Account";
  const displayEmail = user?.email || "Signed in";
  const initials = (displayName.slice(0, 2) || "U").toUpperCase();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      try {
        localStorage.removeItem("user");
      } catch {}
      if (typeof document !== "undefined") {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      }
      router.replace("/login");
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-[#090b0b] text-white **:data-[sidebar=sidebar]:bg-[#090b0b] **:data-[sidebar=sidebar]:text-white **:data-[slot=sidebar-gap]:bg-[#090b0b]"
      style={
        {
          "--sidebar": "#090b0b",
          "--sidebar-foreground": "#ffffff",
          "--sidebar-border": "rgba(255, 255, 255, 0.1)",
          "--sidebar-accent": "rgba(255, 255, 255, 0.08)",
          "--sidebar-accent-foreground": "#ffffff",
          "--sidebar-ring": "rgba(255, 255, 255, 0.2)",
        } as React.CSSProperties
      }
      {...props}
    >
      <SidebarHeader className="border-b border-white/10 px-3.5 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-90 group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Book className="size-4" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden font-medium">
              PrepKit
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup className="p-0 group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="text-xs font-medium text-white/40 uppercase tracking-wider px-2 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {activeNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-10 px-3 text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-2 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="gap-1">
          {/* User Details & Logout Dropdown */}
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={`${displayName} (${displayEmail})`}
                    className="h-12 w-full rounded-xl px-2.5 text-white hover:bg-white/10 transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center cursor-pointer data-popup-open:bg-white/10"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg bg-neutral-800 border border-white/10 text-white shrink-0">
                  <AvatarFallback
                    suppressHydrationWarning
                    className="rounded-lg bg-neutral-800 text-white text-xs font-semibold"
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span
                    suppressHydrationWarning
                    className="truncate font-medium text-white text-xs sm:text-sm"
                  >
                    {displayName}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="truncate text-[11px] text-white/50"
                  >
                    {displayEmail}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-white/50 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={8}
                className="w-56 bg-[#0e1111] border border-white/10 text-white shadow-xl rounded-xl p-1"
              >
                <DropdownMenuGroup>
                  <div className="flex items-center gap-2.5 px-2.5 py-2 text-left">
                    <Avatar className="size-8 rounded-lg bg-neutral-800 border border-white/10 text-white shrink-0">
                      <AvatarFallback
                        suppressHydrationWarning
                        className="rounded-lg bg-neutral-800 text-white text-xs font-semibold"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span
                        suppressHydrationWarning
                        className="truncate font-medium text-white text-xs sm:text-sm"
                      >
                        {displayName}
                      </span>
                      <span
                        suppressHydrationWarning
                        className="truncate text-[11px] text-white/50"
                      >
                        {displayEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10 my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-2.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 rounded-lg cursor-pointer transition-colors"
                >
                  {isLoggingOut ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-red-400" />
                  ) : (
                    <LogOut className="size-3.5 shrink-0 text-red-400" />
                  )}
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
