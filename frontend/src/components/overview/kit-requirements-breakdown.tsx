"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Code2, Users, Briefcase, Network } from "lucide-react";
import type { KitData, KitRequirement } from "@/services/kit.service";

interface KitRequirementsBreakdownProps {
  kit?: KitData | null;
}

export function KitRequirementsBreakdown({
  kit,
}: KitRequirementsBreakdownProps) {
  const reqs: KitRequirement[] = Array.isArray(kit?.requirements)
    ? kit.requirements
    : [];

  const getCleanCategory = (r: KitRequirement) =>
    (r.category || (r.type as string) || "")
      .toUpperCase()
      .replace(/[-\s]/g, "_");

  const technicalCount =
    reqs.filter((r: KitRequirement) => getCleanCategory(r) === "TECHNICAL")
      .length || 0;

  const systemDesignCount =
    reqs.filter((r: KitRequirement) => {
      const cat = getCleanCategory(r);
      return cat === "SYSTEM_DESIGN" || cat === "SYSTEMDESIGN";
    }).length || 0;

  const behavioralCount =
    reqs.filter((r: KitRequirement) => getCleanCategory(r) === "BEHAVIORAL")
      .length || 0;

  const roleSpecificCount =
    reqs.filter((r: KitRequirement) => {
      const cat = getCleanCategory(r);
      return cat === "ROLE_SPECIFIC" || cat === "ROLE";
    }).length || 0;

  const total =
    technicalCount + systemDesignCount + behavioralCount + roleSpecificCount ||
    0;

  const technicalPct = Math.round((technicalCount / total) * 100) || 0;
  const systemDesignPct = Math.round((systemDesignCount / total) * 100) || 0;
  const behavioralPct = Math.round((behavioralCount / total) * 100) || 0;
  const roleSpecificPct = Math.round((roleSpecificCount / total) * 100) || 0;

  const categories = [
    {
      title: "Technical",
      count: technicalCount,
      percentage: reqs.length ? technicalPct : 0,
      icon: Code2,
    },
    {
      title: "System Design",
      count: systemDesignCount,
      percentage: reqs.length ? systemDesignPct : 0,
      icon: Network,
    },
    {
      title: "Role Specific",
      count: roleSpecificCount,
      percentage: reqs.length ? roleSpecificPct : 0,
      icon: Briefcase,
    },
    {
      title: "Behavioral",
      count: behavioralCount,
      percentage: reqs.length ? behavioralPct : 0,
      icon: Users,
    },
  ];

  return (
    <Card className="rounded-2xl border border-white/10 bg-[#111414] shadow-lg p-5 sm:p-6 lg:p-7 gap-5 sm:gap-6">
      <CardHeader className="p-0 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Requirements Breakdown
        </CardTitle>
        <span className="text-xs text-white/45 font-medium tabular-nums">
          {total} {total === 1 ? "requirement" : "requirements"}
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col justify-between gap-3 p-4 sm:p-4.5 rounded-xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/3 transition-all"
              >
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-10.5 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className="size-4.5 sm:size-5 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/45 mt-0.5">
                        {item.count}{" "}
                        {item.count === 1 ? "requirement" : "requirements"}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-white/80 tabular-nums shrink-0">
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 sm:h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
