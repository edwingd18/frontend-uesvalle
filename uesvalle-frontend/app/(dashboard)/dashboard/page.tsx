"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Wrench,
  Users,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Calendar,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";
import { useAuthStore } from "@/shared/store/auth-store";
import { ActivoFormModal } from "@/features/inventario/components/activo-form-modal";
import { MantenimientoFormModal } from "@/features/mantenimientos/components/mantenimiento-form-modal";

export default function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboardStats();
  const usuario = useAuthStore((state) => state.usuario);

  // Estados para los modales
  const [activoModalOpen, setActivoModalOpen] = useState(false);
  const [mantenimientoModalOpen, setMantenimientoModalOpen] = useState(false);

  // Si es técnico, mostrar dashboard simplificado
  const isTecnico = usuario?.rol === "TECNICO";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Error al cargar datos</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const porcentajeDisponibles =
    stats.totalActivos > 0
      ? Math.round((stats.activosDisponibles / stats.totalActivos) * 100)
      : 0;

  // Acciones rápidas según el rol
  const quickActions = [
    {
      onClick: () => setActivoModalOpen(true),
      icon: Package,
      title: "Nuevo Activo",
      description: "Registrar equipo",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      roles: ["ADMIN", "SYSMAN"],
    },
    {
      onClick: () => setMantenimientoModalOpen(true),
      icon: Wrench,
      title: "Mantenimiento",
      description: "Crear servicio",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      roles: ["ADMIN", "SYSMAN"],
    },
    {
      href: "/planificacion",
      icon: Calendar,
      title: "Planificación",
      description: "Ver calendario",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      roles: ["ADMIN", "SYSMAN"],
    },
    {
      href: "/usuarios",
      icon: Users,
      title: "Usuarios",
      description: "Ver usuarios",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      roles: ["ADMIN"],
    },
    {
      href: "/inventario",
      icon: BarChart3,
      title: "Inventario",
      description: "Ver todo",
      color: "bg-gradient-to-br from-slate-500 to-slate-600",
      roles: ["ADMIN", "SYSMAN", "TECNICO"],
    },
  ].filter((action) => action.roles.includes(usuario?.rol || "TECNICO"));

  const handleSuccess = () => {
    refetch();
  };

  // Dashboard para técnicos
  if (isTecnico) {
    return (
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Panel de Técnico
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Bienvenido,{" "}
              <span className="font-medium text-orange-600">
                {usuario?.nombre}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Métricas simplificadas para técnicos */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Mantenimientos Activos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.activosEnMantenimiento}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">En proceso</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Activos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalActivos}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">En inventario</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Disponibles
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.activosDisponibles}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {porcentajeDisponibles}% operativos
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas para técnicos */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Accesos Rápidos</CardTitle>
            <CardDescription className="text-blue-700">
              Funciones principales para técnicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link href="/mantenimientos">
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <Wrench className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">
                      Mantenimientos
                    </h3>
                    <p className="text-xs opacity-90 hidden sm:block">
                      Ver servicios
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/inventario">
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">
                      Inventario
                    </h3>
                    <p className="text-xs opacity-90 hidden sm:block">
                      Ver activos
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/planificacion">
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">
                      Planificación
                    </h3>
                    <p className="text-xs opacity-90 hidden sm:block">
                      Ver calendario
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Estado de activos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de los Activos</CardTitle>
            <CardDescription>Condición actual del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribucionPorEstado
                .sort((a, b) => b.cantidad - a.cantidad)
                .map((item) => {
                  const porcentaje =
                    stats.totalActivos > 0
                      ? Math.round((item.cantidad / stats.totalActivos) * 100)
                      : 0;

                  const colorClasses =
                    item.estado.toLowerCase() === "bueno"
                      ? "bg-green-500"
                      : item.estado.toLowerCase() === "regular"
                      ? "bg-yellow-500"
                      : item.estado.toLowerCase() === "malo"
                      ? "bg-red-500"
                      : item.estado.toLowerCase() === "mantenimiento"
                      ? "bg-blue-500"
                      : "bg-gray-500";

                  return (
                    <div key={item.estado} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {item.estado}
                        </span>
                        <span className="text-muted-foreground">
                          {item.cantidad} ({porcentaje}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClasses} transition-all`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Sede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Distribución por Sede
            </CardTitle>
            <CardDescription>
              {stats.distribucionPorSede.length} sedes activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribucionPorSede
                .sort((a, b) => b.cantidad - a.cantidad)
                .map((item) => {
                  const porcentaje =
                    stats.totalActivos > 0
                      ? Math.round((item.cantidad / stats.totalActivos) * 100)
                      : 0;

                  return (
                    <div key={item.sede} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.sede}</span>
                        <span className="text-muted-foreground">
                          {item.cantidad} ({porcentaje}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard para administradores y SYSMAN
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Bienvenido,{" "}
            <span className="font-medium text-orange-600">
              {usuario?.nombre}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Activos
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalActivos}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.distribucionPorTipo.length} tipos
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Mantenimientos
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalMantenimientos}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total realizados</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.activosDisponibles}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  {porcentajeDisponibles}% operativos
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Dados de Baja
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.activosBaja}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalUsuarios} usuarios
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-900">Accesos Rápidos</CardTitle>
          <CardDescription className="text-orange-700">
            Accede directamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              if (action.href) {
                return (
                  <Link key={index} href={action.href}>
                    <div className="group cursor-pointer">
                      <div
                        className={`${action.color} rounded-xl p-4 sm:p-6 text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1`}
                      >
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                        <h3 className="font-semibold text-xs sm:text-sm mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs opacity-90 hidden sm:block">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              }

              return (
                <div
                  key={index}
                  onClick={action.onClick}
                  className="group cursor-pointer"
                >
                  <div
                    className={`${action.color} rounded-xl p-4 sm:p-6 text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1`}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs opacity-90 hidden sm:block">
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Sede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Distribución por Sede
            </CardTitle>
            <CardDescription>
              {stats.distribucionPorSede.length} sedes activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribucionPorSede
                .sort((a, b) => b.cantidad - a.cantidad)
                .map((item) => {
                  const porcentaje =
                    stats.totalActivos > 0
                      ? Math.round((item.cantidad / stats.totalActivos) * 100)
                      : 0;

                  return (
                    <div key={item.sede} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.sede}</span>
                        <span className="text-muted-foreground">
                          {item.cantidad} ({porcentaje}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de los Activos</CardTitle>
            <CardDescription>Condición actual del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribucionPorEstado
                .sort((a, b) => b.cantidad - a.cantidad)
                .map((item) => {
                  const porcentaje =
                    stats.totalActivos > 0
                      ? Math.round((item.cantidad / stats.totalActivos) * 100)
                      : 0;

                  const colorClasses =
                    item.estado.toLowerCase() === "bueno"
                      ? "bg-green-500"
                      : item.estado.toLowerCase() === "regular"
                      ? "bg-yellow-500"
                      : item.estado.toLowerCase() === "malo"
                      ? "bg-red-500"
                      : item.estado.toLowerCase() === "mantenimiento"
                      ? "bg-blue-500"
                      : "bg-gray-500";

                  return (
                    <div key={item.estado} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {item.estado}
                        </span>
                        <span className="text-muted-foreground">
                          {item.cantidad} ({porcentaje}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClasses} transition-all`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de Activos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                Tipos de Activos
              </CardTitle>
              <CardDescription>
                {stats.distribucionPorTipo.length} categorías registradas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/inventario">
                Ver todo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.distribucionPorTipo
              .sort((a, b) => b.cantidad - a.cantidad)
              .map((item) => {
                const porcentaje =
                  stats.totalActivos > 0
                    ? Math.round((item.cantidad / stats.totalActivos) * 100)
                    : 0;

                return (
                  <div
                    key={item.tipo}
                    className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                      <span className="text-lg sm:text-xl font-bold text-orange-600">
                        {item.cantidad}
                      </span>
                    </div>
                    <span className="font-medium capitalize text-xs sm:text-sm text-center">
                      {item.tipo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {porcentaje}%
                    </span>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <ActivoFormModal
        open={activoModalOpen}
        onOpenChange={setActivoModalOpen}
        activo={null}
        onSuccess={handleSuccess}
      />

      <MantenimientoFormModal
        open={mantenimientoModalOpen}
        onOpenChange={setMantenimientoModalOpen}
        mantenimiento={null}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
