import axios from "axios";

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

    // 2. If backend is down (Network Error) or 500
    if (!error.response || error.response.status >= 500) {
      console.error(
        "Backend server is unreachable or returned 500:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);