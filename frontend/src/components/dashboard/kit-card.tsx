"use client";

import React from "react";
import {
  Calendar,
  FileText,
  Zap,
  MoreVertical,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { kitService, type KitData } from "@/services/kit.service";
import { useRouter } from "next/navigation";

interface KitCardProps {
  kit?: KitData;
  onOpen?: (kit: KitData) => void;
  onDelete?: (id: string) => void;
  onViewProgress?: (kit: KitData) => void;
}

const defaultPlaceholderKit: KitData = {
  id: "kit-1",
  company: "Google",
  role: "Software Engineer Intern",
  createdDate: "12 Aug 2025",
  progress: 65,
  questionsCount: 48,
  flashcardsCount: 32,
  daysCount: 14,
  daysAvailable: 14,
  status: "COMPLETED",
};

function getCompanyName(kit: KitData): string {
  if (kit.company && kit.company.trim()) return kit.company.trim();
  if (kit.companyName && kit.companyName.trim()) return kit.companyName.trim();
  if (kit.companyUrl) {
    try {
      const url = new URL(kit.companyUrl);
      const host = url.hostname.replace(/^www\./, "");
      const parts = host.split(".");
      const name = parts[0] || host;
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return "Company";
    }
  }
  return "Company";
}

function getFormattedDate(kit: KitData): string {
  if (kit.createdAt) {
    try {
      const date = new Date(kit.createdAt);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      // fallback
    }
  }
  return "Today";
}

function getStatusBadgeConfig(status?: string) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Ready",
        className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        dotClassName: "bg-emerald-400",
      };
    case "GENERATING":
      return {
        label: "Generating",
        className: "bg-purple-500/15 text-purple-300 border-purple-500/25",
        dotClassName: "bg-purple-400 animate-pulse",
      };
    case "RESEARCHING":
      return {
        label: "Researching",
        className: "bg-blue-500/15 text-blue-300 border-blue-500/25",
        dotClassName: "bg-blue-400 animate-pulse",
      };
    case "FAILED":
      return {
        label: "Failed",
        className: "bg-red-500/15 text-red-400 border-red-500/25",
        dotClassName: "bg-red-400",
      };
    case "CREATED":
    default:
      return {
        label: "In Progress",
        className: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        dotClassName: "bg-amber-400 animate-pulse",
      };
  }
}

export function KitCard({
  kit = defaultPlaceholderKit,
  onOpen,
  onDelete,
  onViewProgress,
}: KitCardProps) {
  
  const company = getCompanyName(kit);
  const createdDate = getFormattedDate(kit);
  const daysCount = kit.daysAvailable ?? 14;
  const progress = kit.progress ?? 0;
  const questionsCount =
    kit.questionsCount ??
    (Array.isArray(kit.questions) ? kit.questions.length : 0);
  const flashcardsCount =
    kit.flashcardsCount ??
    (Array.isArray(kit.flashcards) ? kit.flashcards.length : 0);
  const initial = company.charAt(0).toUpperCase() || "K";

  const currentStatus =
    kit.status || (questionsCount > 0 ? "COMPLETED" : "CREATED");
  const isReady = currentStatus === "COMPLETED";
  const statusBadge = getStatusBadgeConfig(currentStatus);

  const router = useRouter();

  const handleOpenKit = () => {
    if (kit.id) {
      router.push(`/dashboard/kit/${kit.id}`);
    }
    onOpen?.(kit);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-card-click]")) {
      return;
    }
    if (!isReady && onViewProgress) {
      onViewProgress(kit);
    } else {
      handleOpenKit();
    }
  };

  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteKit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!kit.id || isDeleting) return;

    try {
      setIsDeleting(true);
      await kitService.deleteKit(kit.id);
      onDelete?.(kit.id);
    } catch (error) {
      console.error("Failed to delete kit:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group relative border border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/4 transition-all duration-200 rounded-2xl shadow-lg backdrop-blur-md p-5 flex flex-col gap-4 text-white ring-0 cursor-pointer",
        !isReady && "hover:border-purple-500/30",
        isDeleting && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="size-11 shrink-0 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center font-bold text-purple-600 text-base shadow-inner select-none"
          >
            {initial}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white tracking-tight leading-snug truncate">
              {company}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            title={!isReady ? "Click to view generation progress" : undefined}
            className={cn(
              "h-6 text-[11px] font-medium px-2.5 py-0 rounded-full border flex items-center gap-1.5 transition-colors",
              statusBadge.className,
              !isReady && "hover:brightness-110",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full shrink-0",
                statusBadge.dotClassName,
              )}
            />
            <span>{statusBadge.label}</span>
          </Badge>

          <div data-no-card-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Kit options"
                    className="size-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none shrink-0"
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-40 bg-[#0e1111] border border-white/10 text-white shadow-xl rounded-xl p-1"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isReady && onViewProgress) {
                      onViewProgress(kit);
                    } else {
                      handleOpenKit();
                    }
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  <span>{isReady ? "Open Kit" : "View Progress"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10 my-1" />
                <DropdownMenuItem
                  onClick={handleDeleteKit}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Delete Kit"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-white/50">
        <Calendar className="size-3.5 text-white/40" />
        <span>Created {createdDate}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <span className="text-xs font-medium text-white/60 tabular-nums">
          {progress}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/6 mt-1">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-white/40 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white leading-tight">
              {questionsCount}
            </div>
            <div className="text-[10px] text-white/40 truncate">Questions</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="size-3.5 text-white/40 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white leading-tight">
              {flashcardsCount}
            </div>
            <div className="text-[10px] text-white/40 truncate">Flashcards</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-white/40 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white leading-tight">
              {daysCount}
            </div>
            <div className="text-[10px] text-white/40 truncate">Days</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
