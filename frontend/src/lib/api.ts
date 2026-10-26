import axios from "axios";
import { useServerError } from "@/hooks/use-server-error";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  withCredentials: true,
});

// Attach Authorization header if token cookie exists
api.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    if (match) {
      config.headers.Authorization = `Bearer ${match[2]}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/signup");

    // 1. If 401 on a protected resource, redirect to /login (do not redirect on login/signup endpoints)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        document.cookie = "token=; path=/; max-age=0";
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // 2. Global handler: If backend is down (Network Error) or returns 500+
    if (!error.response) {
      useServerError
        .getState()
        .setServerError(
          "Backend server is currently unreachable. Please ensure the server is running."
        );
    } else if (error.response.status >= 500) {
      useServerError
        .getState()
        .setServerError(
          error.response.data?.message ||
            "An unexpected internal server error (500) occurred on the backend.",
          error.response.status
        );
    }

    return Promise.reject(error);
  }
);