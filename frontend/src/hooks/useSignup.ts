"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export function useSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();
    const { password } = formData;

    if (!trimmedUsername || !trimmedEmail || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.signup({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });

      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.message || "Failed to create account. Please try again.");
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.message ||
          "Failed to create account. Please check your details and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    handleSubmit,
  };
}
