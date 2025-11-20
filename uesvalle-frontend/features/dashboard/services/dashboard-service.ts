import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

export interface DashboardStats {
  totalActivos: number;
  activosDisponibles: number;
  activosEnMantenimiento: number;
  activosBaja: number;
  totalUsuarios: number;
  totalMantenimientos: number;
  mantenimientosPendientes: number;
  mantenimientosCompletados: number;
  proximosMantenimientos: ProximoMantenimiento[];
  distribucionPorTipo: { tipo: string; cantidad: number }[];
  distribucionPorEstado: { estado: string; cantidad: number }[];
  distribucionPorSede: { sede: string; cantidad: number }[];
}

export interface ProximoMantenimiento {
  id: number;
  activo_id: number;
  activo_placa: string;
  fecha: string;
  tipo: string;
  tecnico_nombre?: string;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      // Obtener activos
      const activosResponse = await fetch(`${API_BASE_URL}/activos`, {
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader(),
        },
        credentials: "include",
      });

      if (!activosResponse.ok) throw new Error("Error al obtener activos");
      const activos = await activosResponse.json();

      // Obtener usuarios
      const usuariosResponse = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader(),
        },
        credentials: "include",
      });

      if (!usuariosResponse.ok) throw new Error("Error al obtener usuarios");
      const usuarios = await usuariosResponse.json();

      // Obtener mantenimientos
      const mantenimientosResponse = await fetch(
        `${API_BASE_URL}/mantenimientos`,
        {
          headers: {
            "Content-Type": "application/json",
            ...authService.getAuthHeader(),
          },
          credentials: "include",
        }
      );

      if (!mantenimientosResponse.ok)
        throw new Error("Error al obtener mantenimientos");
      const mantenimientos = await mantenimientosResponse.json();

      // Calcular estadísticas de activos
      const activosDisponibles = activos.filter(
        (a: any) => a.estado?.toLowerCase() === "bueno"
      ).length;
      const activosEnMantenimiento = activos.filter(
        (a: any) => a.estado?.toLowerCase() === "mantenimiento"
      ).length;
      const activosBaja = activos.filter(
        (a: any) => a.estado?.toLowerCase() === "baja"
      ).length;

      // Distribución por tipo
      const distribucionPorTipo = activos.reduce((acc: any, activo: any) => {
        const tipo = activo.tipo || "Sin tipo";
        const existing = acc.find((item: any) => item.tipo === tipo);
        if (existing) {
          existing.cantidad++;
        } else {
          acc.push({ tipo, cantidad: 1 });
        }
        return acc;
      }, []);

      // Distribución por estado
      const distribucionPorEstado = activos.reduce((acc: any, activo: any) => {
        const estado = activo.estado || "Sin estado";
        const existing = acc.find((item: any) => item.estado === estado);
        if (existing) {
          existing.cantidad++;
        } else {
          acc.push({ estado, cantidad: 1 });
        }
        return acc;
      }, []);

      // Mapeo de sedes (mismos nombres que en la página de inventario)
      const sedesNombres: Record<number, string> = {
        1: "Cali - Sede Principal",
        2: "Palmira",
        3: "Tuluá",
        4: "Buga",
        5: "Cartago",
      };

      // Intentar obtener sedes del backend si existe el endpoint
      try {
        const sedesResponse = await fetch(`${API_BASE_URL}/sedes`, {
          headers: {
            "Content-Type": "application/json",
            ...authService.getAuthHeader(),
          },
          credentials: "include",
        });

        if (sedesResponse.ok) {
          const sedes = await sedesResponse.json();
          // Sobrescribir con nombres reales del backend
          sedes.forEach((sede: any) => {
            sedesNombres[sede.id] = sede.nombre;
          });
        }
      } catch (error) {
        // Usar nombres por defecto si no hay endpoint
        console.log("Usando nombres de sedes por defecto");
      }

      // Distribución por sede
      const distribucionPorSede = activos.reduce((acc: any, activo: any) => {
        const sedeId = activo.sede_id;
        const sedeNombre =
          sedesNombres[sedeId] || `Sede ${sedeId || "Sin asignar"}`;
        const existing = acc.find((item: any) => item.sede === sedeNombre);
        if (existing) {
          existing.cantidad++;
        } else {
          acc.push({ sede: sedeNombre, cantidad: 1 });
        }
        return acc;
      }, []);

      // Próximos mantenimientos (ordenados por fecha)
      const hoy = new Date();
      const proximosMantenimientos = mantenimientos
        .filter((m: any) => new Date(m.fecha) >= hoy)
        .sort(
          (a: any, b: any) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        )
        .slice(0, 5)
        .map((m: any) => ({
          id: m.id,
          activo_id: m.activo_id,
          activo_placa: m.activo_placa || `Activo #${m.activo_id}`,
          fecha: m.fecha,
          tipo: m.tipo,
          tecnico_nombre: m.tecnico_nombre,
        }));

      return {
        totalActivos: activos.length,
        activosDisponibles,
        activosEnMantenimiento,
        activosBaja,
        totalUsuarios: usuarios.length,
        totalMantenimientos: mantenimientos.length,
        mantenimientosPendientes: mantenimientos.filter(
          (m: any) => new Date(m.fecha) >= hoy
        ).length,
        mantenimientosCompletados: mantenimientos.filter(
          (m: any) => new Date(m.fecha) < hoy
        ).length,
        proximosMantenimientos,
        distribucionPorTipo,
        distribucionPorEstado,
        distribucionPorSede,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
