import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "./auth-service";

export interface Sede {
  id: number;
  nombre: string;
}

class SedeService {
  async obtenerSedes(): Promise<Sede[]> {
    const response = await fetch(`${API_BASE_URL}/sedes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener sedes");
    }

    return response.json();
  }

  async obtenerSedePorId(id: number): Promise<Sede> {
    const response = await fetch(`${API_BASE_URL}/sedes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener sede");
    }

    return response.json();
  }
}

export const sedeService = new SedeService();
