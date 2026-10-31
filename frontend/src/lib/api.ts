import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useServerError } from "@/hooks/use-server-error";
import { authService } from "@/services/auth.service";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const match =
      document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
    if (match) {
      config.headers.Authorization = `Bearer ${match[2]}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

function redirectToLogin() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("user");
    } catch {}

    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "refreshToken=; path=/; max-age=0";

    if (
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/signup")
    ) {
      window.location.replace("/login");
    }
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/refresh");

    // 1. If 401 from /auth/refresh or auth endpoints, do not attempt to refresh again
    if (error.response?.status === 401 && isAuthEndpoint) {
      if (url.includes("/auth/refresh")) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    // 2. If 401 on protected endpoint, attempt to refresh access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authService.refreshToken();
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 3. Global handler: If backend is down (Network Error) or returns 500+
    if (!error.response) {
      useServerError
        .getState()
        .setServerError(
          "Backend server is currently unreachable. Please ensure the server is running.",
        );
    } else if (error.response.status >= 500) {
      useServerError
        .getState()
        .setServerError(
          (error.response.data as { message?: string } | undefined)?.message ||
            "An unexpected internal server error (500) occurred on the backend.",
          error.response.status,
        );
    }

    return Promise.reject(error);
  },
);
