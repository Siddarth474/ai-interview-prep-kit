"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useKitStore } from "@/hooks/use-kit-store";
import KitLoading from "../loading";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface RequirementItem {
  id?: string;
  position?: number;
  text: string;
  category?: string;
  importance?: string;
}

export default function KitRequirementsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  useEffect(() => {
    if (id) {
      fetchKit(id);
    }
  }, [id, fetchKit]);

  if (loading && !kit) {
    return <KitLoading />;
  }

  const requirements = (
    Array.isArray(kit?.requirements) ? kit.requirements : []
  ) as RequirementItem[];

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
          <Link
            href={`/dashboard/kit/${id}`}
            className="size-9 sm:size-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0 mt-0.5 sm:mt-0"
            title="Back to Overview"
            aria-label="Back to Overview"
          >
            <ArrowLeft className="size-4 sm:size-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Requirements
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              These are the key skills and topics extracted from the job description.
            </p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
        {requirements.length > 0 ? (
          requirements.map((req, idx) => {
            const position = req.position ?? idx + 1;
            const category = (req.category || "TECHNICAL").toUpperCase();
            const importance = (req.importance || "HIGH").toUpperCase();

            return (
              <Card
                key={req.id || idx}
                className="rounded-lg border border-white/10 bg-[#111414] hover:border-white/20 transition-all duration-200 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm group"
              >
                {/* Left Part: Index Box + Description */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="size-8 sm:size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs sm:text-sm font-semibold text-white/70 shrink-0 select-none group-hover:border-white/20 group-hover:text-white transition-colors">
                    {position}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed truncate sm:line-clamp-1">
                    {req.text}
                  </p>
                </div>

                {/* Right Part: Category Badge + Importance Badge */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end sm:self-auto pl-11 sm:pl-0">
                  <Badge
                    variant="outline"
                    className="h-6 px-2.5 py-0 rounded-lg border-white/10 bg-white/5 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider"
                  >
                    {category}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 px-2.5 py-0 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border",
                      importance === "HIGH" &&
                        "text-orange-400 bg-orange-400/10 border-orange-400/20",
                      importance === "MEDIUM" &&
                        "text-yellow-300/80 bg-yellow-400/5 border-yellow-400/15",
                      importance === "LOW" &&
                        "text-blue-400 bg-blue-400/10 border-blue-400/20"
                    )}
                  >
                    {importance}
                  </Badge>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-white/10 bg-[#111414] p-8">
            <FileText className="size-8 text-white/30 mb-3" />
            <h3 className="text-sm font-semibold text-white">
              No requirements found
            </h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm">
              No requirements have been extracted for this interview kit yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
