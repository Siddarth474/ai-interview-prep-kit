"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { notify } from "@/lib/notification";

export function useLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login({
        identifier: identifier.trim(),
        password,
      });

      if (res.success) {
        notify.success("Signed in successfully!");
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        router.push("/dashboard");
      } else {
        const msg = res.message || "Failed to sign in. Please try again.";
        setError(msg);
        notify.error(msg);
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.message ||
        "Invalid credentials. Please verify your details and try again.";
      setError(msg);
      notify.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    handleSubmit,
  };
}
