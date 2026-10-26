"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Read localStorage on mount to prevent SSR hydration mismatch
    try {
      const stored = localStorage.getItem("user");
      if (stored && isMounted) {
        setUser(JSON.parse(stored));
        setIsLoading(false);
      }
    } catch {}

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
