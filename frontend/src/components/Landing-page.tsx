import Link from "next/link";
import {
  ArrowRight,
  Book,
  ChartNoAxesCombined,
  FileText,
  PencilLine,
  Sparkles,
  SquareStack,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Personalized Content",
    subtitle: "from your JD",
  },
  {
    icon: SquareStack,
    title: "Questions, Flashcards",
    subtitle: "& a Study Plan",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Track Your Progress",
    subtitle: "stay on schedule",
  },
  {
    icon: PencilLine,
    title: "Edit, Regenerate",
    subtitle: "& Customize",
  },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
    >
      <Book />
      PrepKit
    </Link>
  );
}

function FeatureStrip() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-7 gap-y-6 border-t border-white/8 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {features.map(({ icon: Icon, title, subtitle }) => (
        <div key={title} className="flex items-start gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/3.5 text-white/80">
            <Icon className="size-3.75" strokeWidth={1.8} />
          </div>

          <div className="min-w-0 pt-0.5">
            <p className="text-[12px] font-medium leading-[1.35] text-white/80">
              {title}
            </p>

            {subtitle && (
              <p className="text-[11px] font-normal leading-[1.35] text-white/50">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroVisual() {
  return (
    <div
      aria-label="PrepKit Interactive Features Preview"
      className="relative mx-auto hidden h-90 w-full max-w-110 items-center justify-center lg:flex lg:h-105"
    >
      <Image
        src="/images/schedule-image.png"
        alt="PrepKit Preview"
        width={1254}
        height={1254}
        priority
        className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#090b0b] text-white selection:bg-white/20 selection:text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 -top-32 h-140 w-225 -translate-x-1/2 rounded-full bg-linear-to-b from-white/7 via-white/2 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-100 w-100 rounded-full bg-white/1.5 blur-3xl" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-[#090b0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {["Features", "How it works", "Sample Kit", "Pricing"].map(
              (item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="h-auto rounded-md px-0 py-1 text-[13px] font-medium text-white/60 hover:bg-transparent hover:text-white transition-colors cursor-pointer"
                >
                  {item}
                </Button>
              ),
            )}
          </nav>

          {/* Header CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className={buttonVariants({
                className:
                  "h-9 rounded-lg bg-white px-4 text-[12px] font-semibold text-[#090b0b]! shadow-sm hover:bg-white/90 transition-all",
              })}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          {/* Hero content */}
          <div className="max-w-xl">
            {/* AI badge */}
            <Badge
              variant="outline"
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm"
            >
              <Sparkles className="size-3 text-white/80" />
              AI-powered interview preparation
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-[58px] lg:leading-[1.04]">
              Ace Your Next
              <br />
              <span className="bg-linear-to-r from-white via-white/95 to-white/60 bg-clip-text text-transparent">
                Interview with AI
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/60 sm:text-base">
              Generate a personalized interview prep kit with questions,
              flashcards, and a day-by-day study schedule based on any job
              description.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className={buttonVariants({
                  className:
                    "h-11 rounded-lg bg-white px-6 text-[13px] font-semibold text-[#090b0b]! shadow-md hover:bg-white/90 hover:shadow-lg transition-all",
                })}
              >
                Get Started Free
                <ArrowRight className="ml-2 size-4" strokeWidth={2.2} />
              </Link>

              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "h-11 rounded-lg border-white/15 bg-transparent px-6 text-[13px] font-medium text-white/80 hover:bg-white/6 hover:text-white transition-all",
                })}
              >
                See Sample Kit
              </Link>
            </div>

            {/* Feature strip */}
            <FeatureStrip />
          </div>

          {/* Hero visual (desktop only) */}
          <div className="hidden lg:block">
            <HeroVisual />
          </div>
        </section>
      </main>
    </div>
  );
}
