import { api } from "@/lib/api";
import type { ApiResponse, AuthResponse, LoginData, SignupData, User } from "@/types";

export const authService = {
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return response.data;
  },

  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/signup", data);
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>("/auth/logout");
    return response.data;
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const response = await api.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >("/auth/refresh");
    return response.data;
  },
};