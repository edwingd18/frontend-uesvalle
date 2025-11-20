import { Activo } from "@/shared/types/inventario";
import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

export interface CreateActivoData {
  serial: string;
  placa: string;
  tipo: string;
  marca: string;
  modelo: string;
  sede_id: number;
  usuario_sysman_id?: number | null;
  usuario_uso_id?: number | null;
  estado: string;
  proceso: string;
  fechaAdquisicion?: string;
  valor?: number;
}

export interface UpdateActivoData extends Partial<CreateActivoData> {}

class ActivosService {
  async getActivos(): Promise<Activo[]> {
    const response = await fetch(`${API_BASE_URL}/activos`, {
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

  async getActivo(id: number): Promise<Activo> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}`, {
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

    const activo = await response.json();

    // Si es PC o Portátil, obtener especificaciones
    const tipoLower = activo.tipo.toLowerCase();
    if (tipoLower === "computador" || tipoLower === "portatil") {
      try {
        const endpoint = tipoLower === "computador" ? "pcs" : "portatiles";
        const especResponse = await fetch(
          `${API_BASE_URL}/${endpoint}/activo/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...authService.getAuthHeader(),
            },
            credentials: "include",
          }
        );

        if (especResponse.ok) {
          const especificaciones = await especResponse.json();
          activo.especificaciones = {
            procesador: especificaciones.procesador,
            ram_gb: especificaciones.ram_gb,
            almacenamiento_gb: especificaciones.almacenamiento_gb,
            so: especificaciones.so,
            tipo_disco: especificaciones.tipo_disco,
            velocidad_cpu_ghz: especificaciones.velocidad_cpu_ghz,
          };
        }
      } catch (error) {
        // Si no hay especificaciones, continuar sin ellas
        console.warn("No se pudieron cargar las especificaciones:", error);
      }
    }

    return activo;
  }

  async createActivo(data: CreateActivoData): Promise<Activo> {
    const response = await fetch(`${API_BASE_URL}/activos`, {
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
      throw new Error(error.message || error.error || "Error al crear activo");
    }

    return await response.json();
  }

  async updateActivo(id: number, data: UpdateActivoData): Promise<Activo> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}`, {
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
        error.message || error.error || "Error al actualizar activo"
      );
    }

    return await response.json();
  }

  async deleteActivo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}`, {
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
        error.message || error.error || "Error al eliminar activo"
      );
    }
  }

  async getHojaVida(id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}/hoja-vida`, {
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
}

export const activosService = new ActivosService();
