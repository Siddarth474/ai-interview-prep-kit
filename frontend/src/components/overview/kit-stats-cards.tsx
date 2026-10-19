"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import type { KitData } from "@/services/kit.service";

interface KitStatsCardsProps {
  kit?: KitData | null;
}

export function KitStatsCards({ kit }: KitStatsCardsProps) {
  const requirementsCount =
    kit?.requirements?.length ??
    kit?.requirementsCount ??
    12;

  const questionsCount =
    kit?.questionsCount ??
    (Array.isArray(kit?.questions) ? kit?.questions.length : undefined) ??
    86;

  const flashcardsCount =
    kit?.flashcardsCount ??
    (typeof kit?.flashcards === "number"
      ? kit?.flashcards
      : Array.isArray(kit?.flashcards)
      ? kit?.flashcards.length
      : undefined) ??
    64;

  const studyDays = kit?.daysAvailable ?? 30;

  const stats = [
    {
      value: String(requirementsCount),
      label: "Requirements",
    },
    {
      value: String(questionsCount),
      label: "Interview Questions",
    },
    {
      value: String(flashcardsCount),
      label: "Flashcards",
    },
    {
      value: `${studyDays} Days`,
      label: "Study Plan",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className="rounded-2xl border border-white/10 bg-[#111414] hover:border-white/20 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between shadow-lg"
        >
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
            {stat.value}
          </div>
          <div className="text-xs sm:text-sm font-medium text-white/50 mt-1 sm:mt-1.5">
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
}
