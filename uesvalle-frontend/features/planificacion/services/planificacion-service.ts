import {
  PlanificacionAnual,
  CreatePlanificacionData,
  UpdatePlanificacionData,
} from "@/shared/types/planificacion";
import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

class PlanificacionService {
  async getPlanificacionAnual(ano: number): Promise<PlanificacionAnual> {
    const response = await fetch(`${API_BASE_URL}/planificacion/${ano}`, {
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

    const result = await response.json();
    console.log("Respuesta del backend al obtener:", result);
    console.log(
      "porMes antes de ordenar:",
      result.porMes.map((m: any) => m.mes)
    );

    // Transformar y ordenar la respuesta del backend
    const mesesOrdenados = result.porMes
      .map((mes: any) => ({
        mes: mes.mes,
        planificados: mes.planificado,
        realizados: mes.realizado,
      }))
      .sort((a: any, b: any) => a.mes - b.mes);

    console.log(
      "Meses después de ordenar:",
      mesesOrdenados.map((m: any) => m.mes)
    );

    return {
      ano: result.ano,
      totalPlanificado: result.totalPlanificado,
      totalRealizado: result.totalRealizado,
      meses: mesesOrdenados,
    };
  }

  async createPlanificacionAnual(
    data: CreatePlanificacionData
  ): Promise<PlanificacionAnual> {
    console.log("Enviando POST a /planificacion:", data);

    const response = await fetch(`${API_BASE_URL}/planificacion`, {
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
        error.message || error.error || "Error al crear planificación"
      );
    }

    const result = await response.json();
    console.log("Respuesta del backend al crear:", result);

    // Transformar y ordenar la respuesta del backend
    const mesesOrdenados = result.porMes
      .map((mes: any) => ({
        mes: mes.mes,
        planificados: mes.planificado,
        realizados: mes.realizado,
      }))
      .sort((a: any, b: any) => a.mes - b.mes);

    return {
      ano: result.ano,
      totalPlanificado: result.totalPlanificado,
      totalRealizado: result.totalRealizado,
      meses: mesesOrdenados,
    };
  }

  async updatePlanificacionAnual(
    ano: number,
    data: UpdatePlanificacionData
  ): Promise<PlanificacionAnual> {
    const response = await fetch(`${API_BASE_URL}/planificacion/${ano}`, {
      method: "PUT",
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
        error.message || error.error || "Error al actualizar planificación"
      );
    }

    const result = await response.json();

    // Transformar y ordenar la respuesta del backend
    const mesesOrdenados = result.porMes
      .map((mes: any) => ({
        mes: mes.mes,
        planificados: mes.planificado,
        realizados: mes.realizado,
      }))
      .sort((a: any, b: any) => a.mes - b.mes);

    return {
      ano: result.ano,
      totalPlanificado: result.totalPlanificado,
      totalRealizado: result.totalRealizado,
      meses: mesesOrdenados,
    };
  }
}

export const planificacionService = new PlanificacionService();
