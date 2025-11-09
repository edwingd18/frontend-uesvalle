import { useState, useEffect } from "react";
import { Usuario } from "@/shared/types/usuario";
import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/usuarios`, {
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

      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
      console.error("Error fetching usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const getUsuarioNombre = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    return usuario?.nombre || "N/A";
  };

  return {
    usuarios,
    loading,
    error,
    getUsuarioNombre,
    refreshUsuarios: fetchUsuarios,
  };
}
