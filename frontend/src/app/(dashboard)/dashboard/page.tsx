"use client";

import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";
import { useDashboardKits } from "@/hooks/use-dashboard-kits";
import {
  DashboardTopNav,
  KitsHeader,
  KitCard,
  CreateKitDialog,
  KitStatusDialog,
} from "@/components/dashboard";

export default function DashboardPage() {
  const {
    searchQuery,
    setSearchQuery,
    serverError,
    refetch,
    isCreateOpen,
    setIsCreateOpen,
    kits,
    isLoading,
    activeKitId,
    activeKit,
    isStatusOpen,
    setIsStatusOpen,
    filteredKits,
    handleKitCreated,
    handleKitReady,
    handleDeleteKit,
    handleCardClick,
    handleOpenKit,
  } = useDashboardKits();

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      <DashboardTopNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        userName=""
      />

      <KitsHeader
        onCreateKit={() => setIsCreateOpen(true)}
        onKitCreated={handleKitCreated}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
        {serverError ? (
          <div className="col-span-full py-16 px-6 flex flex-col items-center justify-center gap-4 text-center rounded-2xl border border-white/10 bg-white/2">
            <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WifiOff className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg font-semibold text-white">
                Unable to connect to server
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {serverError}
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-2 gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-white hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </div>
        ) : isLoading ? (
          <div className="col-span-full py-12 text-center text-sm text-white/40">
            Loading your interview kits...
          </div>
        ) : kits.length > 0 ? (
          filteredKits.length > 0 ? (
            filteredKits.map((kit, index) => (
              <KitCard
                key={kit.id || index}
                kit={kit}
                onOpen={handleCardClick}
                onViewProgress={handleCardClick}
                onDelete={handleDeleteKit}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-sm text-white/40">
              No kits found matching &ldquo;{searchQuery}&rdquo;
            </div>
          )
        ) : (
          <KitCard />
        )}
      </div>

      <CreateKitDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleKitCreated}
      />

      <KitStatusDialog
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        kitId={activeKitId}
        initialKit={activeKit}
        onKitReady={handleKitReady}
        onOpenKit={handleOpenKit}
      />
    </div>
  );
}
