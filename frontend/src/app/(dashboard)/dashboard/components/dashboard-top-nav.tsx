"use client";

import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardTopNavProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  userName?: string;
  userEmail?: string;
}

export function DashboardTopNav({
  searchQuery = "",
  onSearchChange,
  userName = "Anuj",
}: DashboardTopNavProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4 py-1">
     
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search your kits..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-10 w-full rounded-xl bg-white/4 border-white/10 pl-9 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all shadow-none"
          />
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="size-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Bell className="size-4.5" />
        </Button>

        {/* User Profile Avatar */}
        <Avatar className="size-8 bg-neutral-800 border border-white/10 text-white font-semibold text-xs">
          <AvatarFallback className="bg-neutral-800 text-white">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
