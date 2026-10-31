"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  Globe,
  ExternalLink,
  Sparkles,
  Layers,
  HeartHandshake,
  Target,
  CheckCircle2,
  Lightbulb,
  Cpu,
  Compass,
  ArrowRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import type {
  KitData,
  CompanyBrief,
  CompanyProducts,
  CompanyCulture,
  CompanyHiringInfo,
} from "@/services/kit.service";

interface KitCompanyBriefProps {
  kit?: KitData | null;
}

function safeParse<T>(data: unknown): T | null {
  if (!data) return null;
  if (typeof data === "object") return data as T;
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function parseStage(text: string) {
  if (!text) return { title: "", details: null };
  const cleaned = text
    .replace(/^(?:round|stage|step)?\s*\d+[\s.:-]+\s*/i, "")
    .trim();
  const colonIndex = cleaned.indexOf(":");
  const dashIndex = cleaned.indexOf(" - ");

  if (colonIndex > 0 && (dashIndex === -1 || colonIndex < dashIndex)) {
    return {
      title: cleaned.slice(0, colonIndex).trim(),
      details: cleaned.slice(colonIndex + 1).trim() || null,
    };
  }
  if (dashIndex > 0) {
    return {
      title: cleaned.slice(0, dashIndex).trim(),
      details: cleaned.slice(dashIndex + 3).trim() || null,
    };
  }
  return {
    title: cleaned || text,
    details: null,
  };
}

export function KitCompanyBrief({ kit }: KitCompanyBriefProps) {
  const brief: CompanyBrief | null = kit?.companyBrief || null;

  const companyName =
    brief?.companyName ||
    kit?.companyName ||
    kit?.company ||
    (kit?.companyUrl
      ? (() => {
          try {
            const host = new URL(kit.companyUrl).hostname.replace(/^www\./, "");
            const name = host.split(".")[0];
            return name
              ? name.charAt(0).toUpperCase() + name.slice(1)
              : "Company";
          } catch {
            return "Company";
          }
        })()
      : "Company");

  const companyUrl = kit?.companyUrl || "";
  let formattedUrl = companyUrl;
  try {
    if (companyUrl) {
      const parsed = new URL(companyUrl);
      formattedUrl = parsed.hostname.replace(/^www\./, "");
    }
  } catch {
    formattedUrl = companyUrl;
  }

  const products = safeParse<CompanyProducts>(brief?.products);
  const culture = safeParse<CompanyCulture>(brief?.culture);
  const hiringInfo = safeParse<CompanyHiringInfo>(brief?.hiringInfo);

  if (!brief) {
    return (
      <Card className="rounded-2xl border border-white/10 bg-[#111414] shadow-lg p-5 sm:p-6 lg:p-7 flex flex-col gap-4 text-white">
        <CardHeader className="p-0 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-10 sm:size-11 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
              <Building2 className="size-5 text-white/80" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Company Intelligence Brief
              </CardTitle>
              <p className="text-xs text-white/45 mt-0.5">
                {companyName} {formattedUrl ? `• ${formattedUrl}` : ""}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 text-white/60 text-xs px-3 py-1 gap-1.5"
          >
            <Sparkles className="size-3 text-amber-400" />
            <span>Research in progress</span>
          </Badge>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          <div className="rounded-xl border border-white/5 bg-white/2 p-5 sm:p-6 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-white/70 max-w-md">
              We are crawling and researching{" "}
              <span className="text-white font-medium">{companyName}</span> to
              generate high-signal company intelligence, product breakdown, and
              interview guidance.
            </p>
            {companyUrl ? (
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mt-1"
              >
                <span>Visit {formattedUrl}</span>
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-[#111414] shadow-lg p-5 sm:p-6 lg:p-7 flex flex-col gap-6 text-white">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-white/5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="size-11 sm:size-12 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Building2 className="size-5 sm:size-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {brief.companyName}
              </CardTitle>
              {brief.industry ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white/80 text-xs px-2.5 py-0.5"
                >
                  {brief.industry}
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 gap-1"
              >
                <Sparkles className="size-3" />
                <span>AI Researched</span>
              </Badge>
            </div>

            {companyUrl ? (
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mt-1"
              >
                <Globe className="size-3" />
                <span>{formattedUrl}</span>
                <ExternalLink className="size-2.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/45">
          <ShieldCheck className="size-4 text-emerald-400/80" />
          <span>Verified from official website</span>
        </div>
      </CardHeader>

      {/* Company Overview Section */}
      {brief.overview ? (
        <div className="flex flex-col gap-2 rounded-xl bg-white/2 border border-white/5 p-4 sm:p-5">
          <h4 className="text-xs uppercase tracking-wider text-white/45 font-semibold">
            Company Overview & Mission
          </h4>
          <div className="text-sm sm:text-base text-white/80 leading-relaxed space-y-2.5">
            {brief.overview.split("\n\n").map((para, idx) => (
              <p key={idx}>{para.trim()}</p>
            ))}
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="products" className="w-full flex flex-col gap-4">
        <div className="w-full overflow-x-auto pb-1 sm:pb-0 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto inline-flex flex-nowrap items-center justify-start w-max sm:w-fit gap-1 text-white/60">
            <TabsTrigger
              value="products"
              className="shrink-0 cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all text-white/60 hover:text-white data-active:bg-white data-active:text-black data-active:shadow-sm"
            >
              <Layers className="size-3.5 sm:size-4" />
              <span>Products & Tech</span>
            </TabsTrigger>

            <TabsTrigger
              value="culture"
              className="shrink-0 cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all text-white/60 hover:text-white data-active:bg-white data-active:text-black data-active:shadow-sm"
            >
              <HeartHandshake className="size-3.5 sm:size-4" />
              <span>Culture & Values</span>
            </TabsTrigger>

            <TabsTrigger
              value="hiring"
              className="shrink-0 cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all text-white/60 hover:text-white data-active:bg-white data-active:text-black data-active:shadow-sm"
            >
              <Target className="size-3.5 sm:size-4" />
              <span>Hiring & Interview Process</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Products & Tech */}
        <TabsContent
          value="products"
          className="flex flex-col gap-4 mt-0 outline-none"
        >
          {products?.summary ? (
            <p className="text-xs sm:text-sm text-white/70 italic">
              {products.summary}
            </p>
          ) : null}

          {/* Flagship Products */}
          {products?.flagshipProducts &&
          products.flagshipProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {products.flagshipProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/2 hover:border-white/20 transition-colors overflow-hidden"
                >
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 max-w-full">
                        <div className="size-7 rounded-lg bg-white/6 flex items-center justify-center shrink-0">
                          <Package className="size-3.5 text-white/80" />
                        </div>
                        <h5 className="text-sm font-semibold text-white wrap-break-word">
                          {prod.name}
                        </h5>
                      </div>
                      {prod.targetUsers ? (
                        <Badge
                          variant="outline"
                          className="h-auto max-w-full whitespace-normal text-left text-[11px] border-white/10 bg-white/5 text-white/60 leading-tight py-1 px-2.5 rounded-md wrap-break-word shrink-0 sm:shrink"
                        >
                          {prod.targetUsers}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed wrap-break-word">
                      {prod.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Tech Highlights */}
          {products?.techHighlights && products.techHighlights.length > 0 ? (
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                <Cpu className="size-3.5 text-white/60" />
                <span>Key Technologies & Architecture:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {products.techHighlights.map((tech, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-lg border-white/10 bg-white/5 text-white/80 text-xs px-2.5 py-1"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* Tab 2: Culture & Values */}
        <TabsContent
          value="culture"
          className="flex flex-col gap-4 mt-0 outline-none"
        >
          {/* Core Values */}
          {culture?.coreValues && culture.coreValues.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Core Cultural Values
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {culture.coreValues.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/2"
                  >
                    <Sparkles className="size-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm text-white/90 font-medium">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Work Environment & Engineering Culture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
            {culture?.workEnvironment ? (
              <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Compass className="size-4 text-white/70" />
                  <span>Work Environment & Style</span>
                </div>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                  {culture.workEnvironment}
                </p>
              </div>
            ) : null}

            {culture?.engineeringCulture ? (
              <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Cpu className="size-4 text-white/70" />
                  <span>Engineering Culture & Standards</span>
                </div>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                  {culture.engineeringCulture}
                </p>
              </div>
            ) : null}
          </div>
        </TabsContent>

        {/* Tab 3: Hiring & Interview Insights */}
        <TabsContent
          value="hiring"
          className="flex flex-col gap-4 mt-0 outline-none"
        >
          {/* Interview Process Stages */}
          {hiringInfo?.interviewProcess &&
          hiringInfo.interviewProcess.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  Typical Interview Stages
                </h5>
                <span className="text-[11px] text-white/40 font-medium">
                  {hiringInfo.interviewProcess.length}{" "}
                  {hiringInfo.interviewProcess.length === 1
                    ? "round"
                    : "rounds"}
                </span>
              </div>
              <div
                className={`grid gap-2.5 sm:gap-3 ${
                  hiringInfo.interviewProcess.length === 1
                    ? "grid-cols-1"
                    : hiringInfo.interviewProcess.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : hiringInfo.interviewProcess.length === 3
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {hiringInfo.interviewProcess.map((stage, idx) => {
                  const parsed = parseStage(stage);
                  const isLast =
                    idx === (hiringInfo.interviewProcess?.length ?? 0) - 1;

                  return (
                    <div
                      key={idx}
                      className="group flex flex-row sm:flex-col items-start sm:items-stretch justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/4 transition-all"
                    >
                      {/* Mobile Number Badge */}
                      <div className="size-7 rounded-lg bg-white/6 border border-white/10 text-white font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:hidden">
                        {idx + 1}
                      </div>

                      {/* Desktop Header with Step and Arrow */}
                      <div className="hidden sm:flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/6 border border-white/10 text-[11px] font-medium text-white/70 group-hover:text-white transition-colors">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Stage {idx + 1}
                        </span>
                        {!isLast ? (
                          <ArrowRight className="size-3 text-white/30 hidden sm:block shrink-0 group-hover:text-white/60 transition-colors" />
                        ) : null}
                      </div>

                      {/* Stage Content */}
                      <div className="flex-1 min-w-0">
                        <h6 className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-snug">
                          {parsed.title}
                        </h6>
                        {parsed.details ? (
                          <p className="text-[11px] sm:text-xs text-white/60 mt-1 leading-relaxed">
                            {parsed.details}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
            {/* What They Value */}
            {hiringInfo?.whatTheyValue &&
            hiringInfo.whatTheyValue.length > 0 ? (
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/2">
                <h5 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>What They Look For in Candidates</span>
                </h5>
                <ul className="space-y-2">
                  {hiringInfo.whatTheyValue.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-white/70 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 shrink-0 mt-0.5">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Tips for Candidates */}
            {hiringInfo?.tipsForCandidates &&
            hiringInfo.tipsForCandidates.length > 0 ? (
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <h5 className="text-xs font-semibold text-amber-300 flex items-center gap-2">
                  <Lightbulb className="size-4 text-amber-400" />
                  <span>Actionable Preparation Tips</span>
                </h5>
                <ul className="space-y-2">
                  {hiringInfo.tipsForCandidates.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-white/80 flex items-start gap-2"
                    >
                      <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
