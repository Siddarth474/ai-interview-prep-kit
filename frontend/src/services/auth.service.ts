import { api } from "@/lib/api";
import type { ApiResponse, AuthResponse, LoginData, SignupData } from "@/types";

export const authService = {
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return response.data;
  },

  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/signup", data);
    return response.data;
  },
};