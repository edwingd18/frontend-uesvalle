import {
  Mantenimiento,
  CreateMantenimientoData,
  UpdateMantenimientoData,
} from "@/shared/types/mantenimiento";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/lib/api-client";
import { planificacionService } from "@/features/planificacion/services/planificacion-service";

class MantenimientosService {
  async getMantenimientos(): Promise<Mantenimiento[]> {
    return apiGet<Mantenimiento[]>(`/mantenimientos`);
  }

  async getMantenimiento(id: number): Promise<Mantenimiento> {
    return apiGet<Mantenimiento>(`/mantenimientos/${id}`);
  }

  async getMantenimientosByActivo(activoId: number): Promise<Mantenimiento[]> {
    return apiGet<Mantenimiento[]>(`/mantenimientos/activo/${activoId}`);
  }

  async createMantenimiento(
    data: CreateMantenimientoData
  ): Promise<Mantenimiento> {
    const mantenimiento = await apiPost<Mantenimiento>(`/mantenimientos`, data);

    // Incrementar el contador de realizados en la planificación
    try {
      const fecha = new Date(mantenimiento.fecha_realizado);
      const ano = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;

      // Obtener la planificación actual
      const planificacion = await planificacionService.getPlanificacionAnual(
        ano
      );

      // Incrementar el contador de realizados del mes correspondiente
      const mesesActualizados = planificacion.meses.map((m) =>
        m.mes === mes
          ? {
              mes: m.mes,
              planificados: m.planificados,
              realizados: m.realizados + 1,
            }
          : {
              mes: m.mes,
              planificados: m.planificados,
              realizados: m.realizados,
            }
      );

      // Actualizar la planificación
      await planificacionService.updatePlanificacionAnual(ano, {
        meses: mesesActualizados,
      });
    } catch (error) {
      // Si no existe planificación para el año, no hacer nada
      console.warn("No se pudo actualizar la planificación:", error);
    }

    return mantenimiento;
  }

  async updateMantenimiento(
    id: number,
    data: UpdateMantenimientoData
  ): Promise<Mantenimiento> {
    return apiPatch<Mantenimiento>(`/mantenimientos/${id}`, data);
  }

  async deleteMantenimiento(id: number): Promise<void> {
    return apiDelete<void>(`/mantenimientos/${id}`);
  }
}

export const mantenimientosService = new MantenimientosService();
