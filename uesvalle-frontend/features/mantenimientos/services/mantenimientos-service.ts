import {
  Mantenimiento,
  CreateMantenimientoData,
  UpdateMantenimientoData,
} from "@/shared/types/mantenimiento";
import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

class MantenimientosService {
  async getMantenimientos(): Promise<Mantenimiento[]> {
    const response = await fetch(`${API_BASE_URL}/mantenimientos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getMantenimiento(id: number): Promise<Mantenimiento> {
    const response = await fetch(`${API_BASE_URL}/mantenimientos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getMantenimientosByActivo(activoId: number): Promise<Mantenimiento[]> {
    const response = await fetch(
      `${API_BASE_URL}/mantenimientos/activo/${activoId}`,
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
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async createMantenimiento(
    data: CreateMantenimientoData
  ): Promise<Mantenimiento> {
    const response = await fetch(`${API_BASE_URL}/mantenimientos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || "Error al crear mantenimiento"
      );
    }

    return await response.json();
  }

  async updateMantenimiento(
    id: number,
    data: UpdateMantenimientoData
  ): Promise<Mantenimiento> {
    const response = await fetch(`${API_BASE_URL}/mantenimientos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || "Error al actualizar mantenimiento"
      );
    }

    return await response.json();
  }

  async deleteMantenimiento(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/mantenimientos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || "Error al eliminar mantenimiento"
      );
    }
  }
}

export const mantenimientosService = new MantenimientosService();
