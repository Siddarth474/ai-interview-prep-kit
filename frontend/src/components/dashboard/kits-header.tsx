"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateKitDialog } from "./create-kit-dialog";
import type { KitData } from "@/services/kit.service";

interface KitsHeaderProps {
  onCreateKit?: () => void;
  onKitCreated?: (kit: KitData) => void;
}

export function KitsHeader({ onCreateKit, onKitCreated }: KitsHeaderProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const handleClick = () => {
    if (onCreateKit) {
      onCreateKit();
    } else {
      setInternalOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            My Interview Kits
          </h1>
          <p className="text-xs sm:text-sm text-white/50 max-w-xl">
            Create and manage your interview preparation kits for upcoming opportunities.
          </p>
        </div>

        <Button
          onClick={handleClick}
          className="h-10 self-start sm:self-auto rounded-xl bg-white text-[#090b0b]! hover:bg-white/90 font-medium px-4 text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          <span>Create New Kit</span>
        </Button>
      </div>

      {!onCreateKit && (
        <CreateKitDialog
          open={internalOpen}
          onOpenChange={setInternalOpen}
          onSuccess={onKitCreated}
        />
      )}
    </>
  );
}
