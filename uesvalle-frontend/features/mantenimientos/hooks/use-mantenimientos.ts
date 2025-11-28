import { useState, useEffect } from "react";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { mantenimientosService } from "../services/mantenimientos-service";

export function useMantenimientos() {
  const [data, setData] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const mantenimientos = await mantenimientosService.getMantenimientos();
      setData(mantenimientos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar mantenimientos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return { data, loading, error, refreshData };
}
