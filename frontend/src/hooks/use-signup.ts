"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { notify } from "@/lib/notification";

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

    try {
      setIsLoading(true);
      const res = await authService.signup({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });

      if (res.success) {
        notify.success("Account created successfully!");
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        router.push("/dashboard");
      } else {
        const msg = res.message || "Failed to create account. Please try again.";
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
        "Failed to create account. Please check your details and try again.";
      setError(msg);
      notify.error(msg);
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
