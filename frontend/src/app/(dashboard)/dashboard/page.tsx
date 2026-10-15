"use client";

import { useDashboardKits } from "@/hooks/use-dashboard-kits";
import { DashboardTopNav } from "./components/dashboard-top-nav";
import { KitsHeader } from "./components/kits-header";
import { KitCard } from "./components/kit-card";
import { CreateKitDialog } from "./components/create-kit-dialog";
import { KitStatusDialog } from "./components/kit-status-dialog";

export default function DashboardPage() {
  const {
    searchQuery,
    setSearchQuery,
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
        userName="Anuj"
      />

      <KitsHeader
        onCreateKit={() => setIsCreateOpen(true)}
        onKitCreated={handleKitCreated}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
        {isLoading ? (
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
