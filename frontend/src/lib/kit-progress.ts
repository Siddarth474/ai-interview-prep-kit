function getInitialProgressFloor(status?: string | null): number {
  if (status === "COMPLETED") return 100;
  if (status === "GENERATING") return 75;
  if (status === "RESEARCHING") return 50;
  return 25;
}

export function getSavedKitProgress(
  kitId: string | null | undefined,
  status?: string | null,
): number {
  const floor = getInitialProgressFloor(status);
  if (floor === 100) return 100;
  if (typeof window === "undefined" || !kitId) return floor;

  try {
    const saved = localStorage.getItem(`kit_gen_progress_${kitId}`);
    if (!saved) return floor;
    const parsed = parseInt(saved, 10);
    if (isNaN(parsed)) return floor;

    return Math.min(96, Math.max(floor, parsed));
  } catch {
    return floor;
  }
}

export function saveKitProgress(
  kitId: string | null | undefined,
  progress: number,
): void {
  if (typeof window === "undefined" || !kitId) return;
  try {
    if (progress >= 100) {
      localStorage.removeItem(`kit_gen_progress_${kitId}`);
    } else {
      localStorage.setItem(
        `kit_gen_progress_${kitId}`,
        Math.min(96, Math.max(0, Math.round(progress))).toString(),
      );
    }
  } catch {
    // Ignore quota or private browsing errors
  }
}

export function clearKitProgress(kitId?: string | null): void {
  if (typeof window === "undefined" || !kitId) return;
  try {
    localStorage.removeItem(`kit_gen_progress_${kitId}`);
  } catch {}
}
