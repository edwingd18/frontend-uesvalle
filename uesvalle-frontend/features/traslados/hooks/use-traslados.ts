import { useState, useEffect } from "react";
import { Traslado } from "@/shared/types/traslado";
import { trasladosService } from "../services/traslados-service";

export function useTraslados() {
  const [data, setData] = useState<Traslado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTraslados = async () => {
    try {
      setLoading(true);
      setError(null);
      const traslados = await trasladosService.getTraslados();
      setData(traslados);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar traslados"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraslados();
  }, []);

  return {
    data,
    loading,
    error,
    refreshData: fetchTraslados,
  };
}
