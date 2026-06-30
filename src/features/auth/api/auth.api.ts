// ============================================================
// Auth API Functions
// ============================================================
import api from '@/shared/lib/axios';
import type { LoginResponse, AuthTokens, ApiResponse, UserProfile } from '@/shared';
import type { RegisterInput, LoginInput } from '@/shared';

export async function loginApi(input: LoginInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', input);
  return data.data;
}

export async function registerApi(input: RegisterInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/register', input);
  return data.data;
}

export async function refreshTokenApi(refreshToken: string): Promise<AuthTokens> {
  const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/refresh-token', { refreshToken });
  return data.data;
}

export async function getProfileApi(): Promise<UserProfile> {
  const { data } = await api.get<ApiResponse<{ user: UserProfile }>>('/auth/profile');
  return data.data.user;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}
