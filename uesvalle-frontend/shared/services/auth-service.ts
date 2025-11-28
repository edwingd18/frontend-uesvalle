import {
  LoginCredentials,
  RegisterData,
  LoginResponse,
} from "@/shared/types/auth";
import { API_BASE_URL } from "@/shared/config/api";

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // ✅ Recibir cookies del servidor
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || "Error al iniciar sesión"
      );
    }

    const data = await response.json();
    return data;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al registrar usuario");
    }

    const result = await response.json();
    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Enviar cookies para el logout
      });
    } catch (error) {
      // Ignorar errores del logout
    }
  }

  getAuthHeader(): Record<string, string> {
    if (typeof window === "undefined") return {};

    const storage = localStorage.getItem("auth-storage");
    if (!storage) return {};

    try {
      const { state } = JSON.parse(storage);
      if (state?.token) {
        return {
          Authorization: `Bearer ${state.token}`,
        };
      }
    } catch (error) {
      // Error al obtener token
    }

    return {};
  }
}

export const authService = new AuthService();
