"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Code2, Users, Briefcase } from "lucide-react";
import type { KitData } from "@/services/kit.service";

interface KitRequirementsBreakdownProps {
  kit?: KitData | null;
}

export function KitRequirementsBreakdown({
  kit,
}: KitRequirementsBreakdownProps) {
  // If kit.requirements is available, calculate counts dynamically
  const reqs = Array.isArray(kit?.requirements) ? kit.requirements : [];

  const technicalCount =
    reqs.filter(
      (r: any) =>
        r.category === "TECHNICAL" ||
        r.category === "technical" ||
        r.type === "technical"
    ).length || 8;

  const behavioralCount =
    reqs.filter(
      (r: any) =>
        r.category === "BEHAVIORAL" ||
        r.category === "behavioral" ||
        r.type === "behavioral"
    ).length || 2;

  const roleSpecificCount =
    reqs.filter(
      (r: any) =>
        r.category === "ROLE_SPECIFIC" ||
        r.category === "role_specific" ||
        r.category === "ROLE" ||
        r.type === "role_specific"
    ).length || 2;

  const total = technicalCount + behavioralCount + roleSpecificCount || 12;

  const technicalPct = Math.round((technicalCount / total) * 100) || 67;
  const behavioralPct = Math.round((behavioralCount / total) * 100) || 50;
  const roleSpecificPct = Math.round((roleSpecificCount / total) * 100) || 30;

  const categories = [
    {
      title: "Technical",
      count: technicalCount,
      percentage: reqs.length ? technicalPct : 67,
      icon: Code2,
    },
    {
      title: "Behavioral",
      count: behavioralCount,
      percentage: reqs.length ? behavioralPct : 50,
      icon: Users,
    },
    {
      title: "Role Specific",
      count: roleSpecificCount,
      percentage: reqs.length ? roleSpecificPct : 30,
      icon: Briefcase,
    },
  ];

  return (
    <Card className="rounded-2xl border border-white/10 bg-[#111414] shadow-lg p-5 sm:p-6 lg:p-7 gap-5 sm:gap-6">
      <CardHeader className="p-0">
        <CardTitle className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Requirements Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-4 sm:gap-5">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 py-2.5 sm:py-3 border-b border-white/5 last:border-0"
            >
              {/* Category Info */}
              <div className="flex items-center gap-3.5 min-w-45">
                <div className="size-10 sm:size-11 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="size-4 sm:size-5 text-white/80" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-white/45 mt-0.5">
                    {item.count} requirements
                  </p>
                </div>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="flex items-center gap-3.5 sm:gap-4 flex-1 max-w-none sm:max-w-md w-full">
                <div className="h-2 sm:h-2.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-white/80 tabular-nums w-10 text-right shrink-0">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
