import { create } from "zustand";
import axios from "axios";
import { kitService, type KitData } from "@/services/kit.service";

interface KitStore {
  kit: KitData | null;
  currentKitId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchKit: (id: string, force?: boolean) => Promise<void>;
  updateKit: (data: Partial<KitData>) => void;
  clearKit: () => void;
}

export const useKitStore = create<KitStore>((set, get) => ({
  kit: null,
  currentKitId: null,
  loading: false,
  error: null,

  fetchKit: async (id: string, force = false) => {
    if (!force && get().currentKitId === id && get().kit) {
      return;
    }

    set({ loading: true, error: null, currentKitId: id });

    try {
      const res = await kitService.getKit(id);
      if (res.success) {
        set({ kit: res.data, loading: false });
      } else {
        set({ error: res.message || "Failed to load kit", loading: false });
      }
    } catch (err: unknown) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as { message?: string } | undefined)?.message) ||
        (err instanceof Error ? err.message : null) ||
        "Something went wrong";
      set({ error: message, loading: false });
    }
  },

  updateKit: (data) =>
    set((state) => ({
      kit: state.kit ? { ...state.kit, ...data } : null,
    })),

  clearKit: () => set({ kit: null, currentKitId: null, error: null }),
}));
