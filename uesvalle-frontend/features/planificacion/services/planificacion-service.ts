import {
  PlanificacionAnual,
  CreatePlanificacionData,
  UpdatePlanificacionData,
} from "@/shared/types/planificacion";
import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

class PlanificacionService {
  async getPlanificacionAnual(ano: number): Promise<any> {
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

    // Transformar la respuesta del backend al formato esperado por el frontend
    const planificacionTransformada = {
      id: result.id,
      ano: result.ano,
      meses: result.meses.map((mes: any) => ({
        mes: mes.mes,
        cuotas: mes.mantenimientos.map((mant: any) => ({
          tipo: mant.tipo_activo,
          planificado: mant.planificados,
          realizado: mant.realizados,
        })),
      })),
    };

    return planificacionTransformada;
  }

  async createPlanificacionAnual(data: any): Promise<any> {
    try {
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
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updatePlanificacionAnual(ano: number, data: any): Promise<any> {
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
    return result;
  }
}

export const planificacionService = new PlanificacionService();
