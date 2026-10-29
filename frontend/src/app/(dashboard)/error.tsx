"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-400" />
      <h2 className="text-xl font-semibold text-white">
        Unable to connect to server
      </h2>
      <p className="text-sm text-white/50 max-w-md">
        The backend service might be offline or undergoing maintenance.
      </p>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  );
}
