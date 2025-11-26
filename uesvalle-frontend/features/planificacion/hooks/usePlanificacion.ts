import { useState, useEffect } from "react";
import {
  PlanificacionAnual,
  CreatePlanificacionData,
  UpdatePlanificacionData,
} from "@/shared/types/planificacion";
import { planificacionService } from "../services/planificacion-service";

export function usePlanificacion(ano: number) {
  const [planificacion, setPlanificacion] = useState<PlanificacionAnual | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanificacion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planificacionService.getPlanificacionAnual(ano);
      setPlanificacion(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("No se encontró")
      ) {
        setError("NOT_FOUND");
      } else {
        setError(errorMessage);
      }
      setPlanificacion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanificacion();
  }, [ano]);

  const createPlanificacion = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const nuevaPlanificacion =
        await planificacionService.createPlanificacionAnual(data);
      // Refrescar la planificación después de crear
      await fetchPlanificacion();
      return nuevaPlanificacion;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al crear planificación";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlanificacion = async (data: any) => {
    try {
      setError(null);
      const planificacionActualizada =
        await planificacionService.updatePlanificacionAnual(ano, data);
      // Refrescar la planificación después de actualizar
      await fetchPlanificacion();
      return planificacionActualizada;
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Error al actualizar planificación";
      setError(errorMsg);
      throw err;
    }
  };

  return {
    planificacion,
    loading,
    error,
    refetch: fetchPlanificacion,
    createPlanificacion,
    updatePlanificacion,
  };
}
