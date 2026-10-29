"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(() => !getStoredUser());

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const res = await authService.getMe();
        if (res.success && res.data && isMounted) {
          setUser(res.data);
          try {
            localStorage.setItem("user", JSON.stringify(res.data));
          } catch {}
        }
      } catch {
        // If not logged in or network issue, keep stored or null
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, isLoading };
}
