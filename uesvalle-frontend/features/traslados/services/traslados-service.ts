import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";
import {
  Traslado,
  CreateTrasladoData,
  UpdateTrasladoData,
} from "@/shared/types/traslado";

class TrasladosService {
  async getTraslados(): Promise<Traslado[]> {
    const response = await fetch(`${API_BASE_URL}/traslados`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener traslados");
    }

    return response.json();
  }

  async getTrasladoById(id: number): Promise<Traslado> {
    const response = await fetch(`${API_BASE_URL}/traslados/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener traslado");
    }

    return response.json();
  }

  async getTrasladosByActivo(activoId: number): Promise<Traslado[]> {
    const response = await fetch(
      `${API_BASE_URL}/traslados/activo/${activoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader(),
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener traslados del activo");
    }

    return response.json();
  }

  async createTraslado(data: CreateTrasladoData): Promise<Traslado> {
    const response = await fetch(`${API_BASE_URL}/traslados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al crear traslado");
    }

    return response.json();
  }

  async updateTraslado(
    id: number,
    data: UpdateTrasladoData
  ): Promise<Traslado> {
    const response = await fetch(`${API_BASE_URL}/traslados/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al actualizar traslado");
    }

    return response.json();
  }

  async deleteTraslado(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/traslados/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al eliminar traslado");
    }
  }
}

export const trasladosService = new TrasladosService();
