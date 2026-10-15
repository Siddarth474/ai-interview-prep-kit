"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { KitData } from "@/services/kit.service";
import { kitService } from "@/services/kit.service";

export function useDashboardKits() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [kits, setKits] = useState<KitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status dialog state for tracking newly created kit
  const [activeKitId, setActiveKitId] = useState<string | null>(null);
  const [activeKit, setActiveKit] = useState<KitData | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Fetch all kits on mount
  useEffect(() => {
    const fetchKits = async () => {
      try {
        setIsLoading(true);
        const res = await kitService.getKits();
        if (res.success) {
          const kitsList = Array.isArray(res.data?.kits)
            ? res.data.kits
            : Array.isArray(res.data)
            ? res.data
            : [];
          setKits(kitsList);
        }
      } catch (error) {
        console.error("Failed to fetch kits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKits();
  }, []);

  const handleKitCreated = (newKit: any) => {
    setKits((prev) => [newKit, ...prev]);
    if (newKit?.id) {
      setActiveKitId(newKit.id);
      setActiveKit(newKit);
      setIsStatusOpen(true);
    }
  };

  const handleKitReady = (updatedKit: KitData) => {
    setKits((prev) =>
      prev.map((kit) =>
        kit.id === updatedKit.id ? { ...kit, ...updatedKit } : kit
      )
    );
  };

  const handleDeleteKit = (id: string) => {
    setKits((prev) => prev.filter((kit) => kit.id !== id));
  };

  // Click handler: opens progress dialog if in-progress, or navigates to kit if ready
  const handleCardClick = (kit: KitData) => {
    if (kit.status !== "COMPLETED") {
      if (kit.id) {
        setActiveKitId(kit.id);
        setActiveKit(kit);
        setIsStatusOpen(true);
      }
    } else {
      if (kit.id) {
        router.push(`/dashboard/kit/${kit.id}`);
      }
    }
  };

  const handleOpenKit = (id: string) => {
    router.push(`/dashboard/kit/${id}`);
  };

  // Background polling: automatically update dashboard card badges if any kit is in progress
  useEffect(() => {
    const hasInProgressKit = kits.some(
      (k) => k.status && k.status !== "COMPLETED" && k.status !== "FAILED"
    );

    if (!hasInProgressKit) return;

    const interval = setInterval(async () => {
      try {
        const res = await kitService.getKits();
        if (res.success) {
          const kitsList = Array.isArray(res.data?.kits)
            ? res.data.kits
            : Array.isArray(res.data)
            ? res.data
            : [];
          if (kitsList.length > 0) {
            setKits(kitsList);
            if (activeKitId) {
              const updated = kitsList.find(
                (k: KitData) => k.id === activeKitId
              );
              if (updated) {
                setActiveKit(updated);
              }
            }
          }
        }
      } catch (err) {
        console.error("Dashboard background poll error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [kits, activeKitId]);

  // Filter kits based on search input (company or role/job description)
  const filteredKits = kits.filter((kit) => {
    const comp = (
      kit.company ||
      kit.companyName ||
      kit.companyUrl ||
      ""
    ).toLowerCase();
    const role = (kit.role || kit.jobDescription || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return comp.includes(query) || role.includes(query);
  });

  return {
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
  };
}
