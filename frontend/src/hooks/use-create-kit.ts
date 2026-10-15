import { useState, type FormEvent } from "react";
import { kitService, type CreateKitPayload } from "@/services/kit.service";

interface UseCreateKitOptions {
  onOpenChange: (open: boolean) => void;
  onSuccess?: (kit: any) => void;
}

export function useCreateKit({
  onOpenChange,
  onSuccess,
}: UseCreateKitOptions) {
  const [kitData, setKitData] = useState({
    companyUrl: "",
    jobDescription: "",
    daysAvailable: "14",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setKitData({
      companyUrl: "",
      jobDescription: "",
      daysAvailable: "14",
    });
    setError(null);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = kitData.companyUrl.trim();
    const trimmedJd = kitData.jobDescription.trim();
    const parsedDays = parseInt(kitData.daysAvailable, 10);

    if (!trimmedUrl || !trimmedJd || !kitData.daysAvailable) {
      setError("Please fill in all required fields.");
      return;
    }

    // Basic URL check
    try {
      new URL(trimmedUrl);
    } catch {
      setError("Please enter a valid URL (e.g. https://google.com/careers).");
      return;
    }

    if (isNaN(parsedDays) || parsedDays < 1) {
      setError("Days available must be at least 1 day.");
      return;
    }

    try {
      setIsLoading(true);
      const payload: CreateKitPayload = {
        companyUrl: trimmedUrl,
        jobDescription: trimmedJd,
        daysAvailable: parsedDays,
      };

      const res = await kitService.createKit(payload);
      if (res.success) {
        onSuccess?.(res.data);
        handleClose(false);
      } else {
        setError(res.message || "Failed to create kit. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to generate kit. Please check your inputs and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    kitData,
    setKitData,
    isLoading,
    error,
    resetForm,
    handleClose,
    handleSubmit,
  };
}
