import { create } from "zustand";

interface ServerErrorState {
  hasError: boolean;
  message: string | null;
  statusCode: number | null;
  setServerError: (message: string, statusCode?: number | null) => void;
  clearServerError: () => void;
}

export const useServerError = create<ServerErrorState>((set) => ({
  hasError: false,
  message: null,
  statusCode: null,
  setServerError: (message: string, statusCode: number | null = null) =>
    set({ hasError: true, message, statusCode }),
  clearServerError: () =>
    set({ hasError: false, message: null, statusCode: null }),
}));
