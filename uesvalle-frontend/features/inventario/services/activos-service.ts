import { Activo } from "@/shared/types/inventario";
import { apiGet, apiPost, apiPatch } from "@/shared/lib/api-client";
import { useAuthStore } from "@/shared/store/auth-store";

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
    return apiGet<Activo[]>(`/activos`);
  }

  async getActivo(id: number): Promise<Activo> {
    const activo = await apiGet<Activo>(`/activos/${id}`);

    // Si es PC o Portátil, obtener especificaciones
    const tipoUpper = activo.tipo.toUpperCase();
    if (tipoUpper === "COMPUTADOR" || tipoUpper === "PORTATIL") {
      try {
        const endpoint = tipoUpper === "COMPUTADOR" ? "pcs" : "portatiles";
        const especificaciones = await apiGet<any>(`/${endpoint}/activo/${id}`);

        activo.especificaciones = {
          procesador: especificaciones.procesador,
          ram_gb: especificaciones.ram_gb,
          almacenamiento_gb: especificaciones.almacenamiento_gb,
          so: especificaciones.so,
          tipo_disco: especificaciones.tipo_disco,
          velocidad_cpu_ghz: especificaciones.velocidad_cpu_ghz,
          licencia: especificaciones.licencia,
        };
      } catch (error) {
        // Si no hay especificaciones, continuar sin ellas
        console.warn("No se pudieron cargar las especificaciones:", error);
      }
    }

    return activo;
  }

  async createActivo(data: CreateActivoData): Promise<Activo> {
    return apiPost<Activo>(`/activos`, data);
  }

  async updateActivo(id: number, data: UpdateActivoData): Promise<Activo> {
    return apiPatch<Activo>(`/activos/${id}`, data);
  }

  async darDeBajaActivo(id: number, observacion_baja: string): Promise<void> {
    // Obtener el ID del usuario actual
    const usuario = useAuthStore.getState().usuario;
    const eliminado_por_id = usuario?.id || null;

    await apiPatch<void>(`/activos/${id}`, {
      estado: "BAJA",
      observacion_baja: observacion_baja,
      eliminado_por_id: eliminado_por_id,
    });
  }

  async getHojaVida(id: number): Promise<any> {
    return apiGet<any>(`/activos/${id}/hoja-vida`);
  }
}

export const activosService = new ActivosService();
