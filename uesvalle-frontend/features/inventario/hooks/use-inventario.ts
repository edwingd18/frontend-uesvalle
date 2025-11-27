"use client";

import { useState, useEffect } from "react";
import { Activo } from "@/shared/types/inventario";
import { authService } from "@/shared/services/auth-service";
import { API_BASE_URL } from "@/shared/config/api";

export function useInventario() {
  const [data, setData] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/activos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader(),
        },
        credentials: "include", // ✅ Enviar cookies automáticamente
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const activosData = await response.json();

      // Transformar los datos de la API al formato esperado
      const activos: Activo[] = activosData.map((item: any) => {
        return {
          id: parseInt(item.id),
          serial: item.serial,
          placa: item.placa,
          tipo: item.tipo, // Mantener tal como viene del backend (MAYÚSCULAS)
          marca: item.marca,
          modelo: item.modelo,
          sede_id: parseInt(item.sede_id),
          usuario_sysman_id: item.usuario_sysman_id
            ? parseInt(item.usuario_sysman_id)
            : null,
          usuario_uso_id: item.usuario_uso_id
            ? parseInt(item.usuario_uso_id)
            : null,
          usuario_sysman_nombre: item.usuario_sysman_nombre || null,
          usuario_uso_nombre: item.usuario_uso_nombre || null,
          estado: item.estado, // Mantener tal como viene del backend (MAYÚSCULAS)
          proceso: item.proceso, // Mantener tal como viene del backend
          fechaAdquisicion: item.fechaAdquisicion,
          valor: item.valor,
          creado_por_id: item.creado_por_id,
          creado_por_nombre: item.creado_por_nombre,
          eliminado_por_id: item.eliminado_por_id,
          observacion_baja: item.observacion_baja,
          fecha_instalacion: item.fecha_instalacion,
          fecha_creacion: item.fecha_creacion,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          especificaciones: item.especificaciones,
        };
      });

      setData(activos);
    } catch (err) {
      console.error("Error al cargar activos:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar los activos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const refreshData = async () => {
    await fetchActivos();
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
}
