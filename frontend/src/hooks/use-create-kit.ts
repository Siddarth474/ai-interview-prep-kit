import { useState, type FormEvent } from "react";
import axios from "axios";
import {
  kitService,
  type CreateKitPayload,
  type KitData,
} from "@/services/kit.service";
import { notify } from "@/lib/notification";

interface UseCreateKitOptions {
  onOpenChange: (open: boolean) => void;
  onSuccess?: (kit: KitData) => void;
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

    try {
      setIsLoading(true);
      const payload: CreateKitPayload = {
        companyUrl: kitData.companyUrl.trim(),
        jobDescription: kitData.jobDescription.trim(),
        daysAvailable: Number(kitData.daysAvailable),
      };

      const res = await kitService.createKit(payload);
      if (res.success) {
        notify.success("Interview kit created! Research is starting...");
        onSuccess?.(res.data);
        handleClose(false);
      } else {
        const errorMsg = res.message || "Failed to create kit. Please try again.";
        setError(errorMsg);
      }
    } catch (err: unknown) {
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data as { message?: string } | undefined)?.message) ||
        "Failed to generate kit. Please check your inputs and try again.";
      setError(message);
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
