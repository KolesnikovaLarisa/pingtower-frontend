import api from "./client";
import { LoginResponse, RegisterResponse, User } from "../types/api";

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  
  // Сохраняем токены в localStorage
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  
  return data;
}

export async function registerUser(email: string, password: string, name: string): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", { email, password, name });
  
  // Сохраняем токены в localStorage
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Очищаем токены независимо от результата запроса
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data } = await api.post("/auth/refresh", { refreshToken });
  
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  
  return data;
}

export function getCurrentUser(): User | null {
  const token = localStorage.getItem("accessToken");
  console.log('Auth: Проверяем токен:', token ? 'есть' : 'отсутствует');
  
  if (!token) return null;

  try {
    // Декодируем JWT токен (только payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Auth: Декодированный payload:', payload);
    
    // Проверяем, не истек ли токен
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log('Auth: Токен истек, очищаем localStorage');
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }

    const user = {
      id: payload.sub || payload.userId,
      name: payload.name,
      email: payload.email
    };
    console.log('Auth: Извлеченный пользователь:', user);
    return user;
  } catch (error) {
    console.error("Auth: Ошибка при декодировании токена:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}
