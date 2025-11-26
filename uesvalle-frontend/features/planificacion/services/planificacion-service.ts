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
    console.log("Respuesta del backend al obtener planificación:", result);

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

    console.log("Planificación transformada:", planificacionTransformada);
    return planificacionTransformada;
  }

  async createPlanificacionAnual(data: any): Promise<any> {
    try {
      console.log(
        "Enviando POST a /planificacion:",
        JSON.stringify(data, null, 2)
      );

      const response = await fetch(`${API_BASE_URL}/planificacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader(),
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      console.log("Status de respuesta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del backend:", errorText);

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
      console.log("Respuesta del backend al crear:", result);

      return result;
    } catch (error) {
      console.error("Error completo al crear planificación:", error);
      throw error;
    }
  }

  async updatePlanificacionAnual(ano: number, data: any): Promise<any> {
    console.log("Enviando PUT a /planificacion:", data);

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
    console.log("Respuesta del backend al actualizar:", result);

    return result;
  }
}

export const planificacionService = new PlanificacionService();
