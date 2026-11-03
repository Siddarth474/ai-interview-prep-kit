"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeUser() {
      try {
        const stored = localStorage.getItem("user");
        if (stored && isMounted) {
          setUser(JSON.parse(stored) as User);
          setIsLoading(false);
        }
      } catch {}

      try {
        const res = await authService.getMe();
        if (res.success && res.data && isMounted) {
          setUser(res.data);
          try {
            localStorage.setItem("user", JSON.stringify(res.data));
          } catch {}
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, isLoading };
}
