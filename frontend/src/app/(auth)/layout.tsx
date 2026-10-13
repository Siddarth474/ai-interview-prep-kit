import React from "react";
import Link from "next/link";
import { ArrowLeft, Book } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#090b0b] px-4 py-12 text-white selection:bg-white/20 selection:text-white">
      <div className="pointer-events-none absolute left-0 bottom-10 h-80 w-80 rounded-full bg-white/1 blur-3xl" />
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
          >
            <Book />
            PrepKit
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
