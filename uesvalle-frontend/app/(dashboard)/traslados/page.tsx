"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  MapPin,
  Calendar,
  Package,
  User,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTraslados } from "@/features/traslados/hooks/use-traslados";
import { TrasladoFormModal } from "@/features/traslados/components/traslado-form-modal";
import { DeleteTrasladoDialog } from "@/features/traslados/components/delete-traslado-dialog";
import { ReportesTrasladosModal } from "@/features/traslados/components/ReportesTrasladosModal";
import { Traslado } from "@/shared/types/traslado";
import { sedes } from "@/mocks/inventario";
import { useInventario } from "@/features/inventario/hooks/use-inventario";
import { useUsuarios } from "@/shared/hooks/use-usuarios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download } from "lucide-react";

const getSedeNombre = (sedeId: number) => {
  return sedes.find((sede) => sede.id === sedeId)?.nombre || "N/A";
};

export default function TrasladosPage() {
  const router = useRouter();
  const { data: traslados, loading, error, refreshData } = useTraslados();
  const { data: activos } = useInventario();
  const { usuarios } = useUsuarios();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportesModalOpen, setReportesModalOpen] = useState(false);
  const [selectedTraslado, setSelectedTraslado] = useState<Traslado | null>(
    null
  );

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [sedeOrigenFilter, setSedeOrigenFilter] = useState<string>("todos");
  const [sedeDestinoFilter, setSedeDestinoFilter] = useState<string>("todos");

  // Filtrar traslados
  const filteredTraslados = useMemo(() => {
    return traslados
      .filter((traslado) => {
        const matchSearch =
          searchTerm === "" ||
          traslado.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          traslado.id.toString().includes(searchTerm);

        const matchOrigen =
          sedeOrigenFilter === "todos" ||
          traslado.sede_origen_id === Number(sedeOrigenFilter);

        const matchDestino =
          sedeDestinoFilter === "todos" ||
          traslado.sede_destino_id === Number(sedeDestinoFilter);

        return matchSearch && matchOrigen && matchDestino;
      })
      .sort((a, b) => b.id - a.id);
  }, [traslados, searchTerm, sedeOrigenFilter, sedeDestinoFilter]);

  const handleCreate = () => {
    setSelectedTraslado(null);
    setModalOpen(true);
  };

  const handleEdit = (traslado: Traslado) => {
    setSelectedTraslado(traslado);
    setModalOpen(true);
  };

  const handleView = (traslado: Traslado) => {
    router.push(`/traslados/${traslado.id}`);
  };

  const handleDelete = (traslado: Traslado) => {
    setSelectedTraslado(traslado);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    refreshData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 sm:py-6 pr-1">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Traslados</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona los traslados de activos entre sedes
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={refreshData} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <Button variant="outline" onClick={() => setReportesModalOpen(true)} size="sm">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Generar Reporte</span>
            <span className="sm:hidden">Reporte</span>
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleCreate}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Traslado</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-orange-600" />
                Historial de Traslados
              </CardTitle>
              <CardDescription>
                {filteredTraslados.length} de {traslados.length} traslados
              </CardDescription>
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por motivo o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select
                value={sedeOrigenFilter}
                onValueChange={setSedeOrigenFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sede origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las sedes origen</SelectItem>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={String(sede.id)}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sedeDestinoFilter}
                onValueChange={setSedeDestinoFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sede destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las sedes destino</SelectItem>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={String(sede.id)}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm ||
                sedeOrigenFilter !== "todos" ||
                sedeDestinoFilter !== "todos") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setSedeOrigenFilter("todos");
                    setSedeDestinoFilter("todos");
                  }}
                  className="sm:col-span-2 lg:col-span-1"
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {filteredTraslados.length === 0 ? (
            <div className="flex items-center justify-center h-48 sm:h-64 text-muted-foreground">
              <div className="text-center px-4">
                <ArrowLeftRight className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <p className="text-base sm:text-lg font-medium mb-2">
                  {traslados.length === 0
                    ? "No hay traslados registrados"
                    : "No se encontraron traslados con los filtros aplicados"}
                </p>
                <p className="text-sm sm:text-base mb-4">
                  {traslados.length === 0
                    ? "Comienza creando un nuevo traslado"
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
                {traslados.length === 0 && (
                  <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Traslado
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTraslados.map((traslado) => (
                <div
                  key={traslado.id}
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  onClick={() => handleView(traslado)}
                >
                  {/* Botón de acciones - esquina superior derecha */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(traslado);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(traslado);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(traslado);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contenido principal */}
                  <div className="pr-12">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Header con fecha y ID */}
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
                        <Badge variant="outline" className="font-mono w-fit">
                          #{traslado.id}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {format(
                            new Date(traslado.fecha),
                            "dd 'de' MMMM, yyyy",
                            {
                              locale: es,
                            }
                          )}
                        </div>
                      </div>

                      {/* Tipo de traslado */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            // Determinar el tipo de traslado
                            ((traslado.usuario_uso_destino &&
                              traslado.usuario_uso_destino.trim() !== "") ||
                              (traslado.usuario_sysman_destino &&
                                traslado.usuario_sysman_destino.trim() !==
                                  "")) &&
                            traslado.sede_origen_id !== traslado.sede_destino_id
                              ? "bg-green-100 text-green-800 border-green-300"
                              : (traslado.usuario_uso_destino &&
                                  traslado.usuario_uso_destino.trim() !== "") ||
                                (traslado.usuario_sysman_destino &&
                                  traslado.usuario_sysman_destino.trim() !== "")
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : "bg-blue-100 text-blue-800 border-blue-300"
                          }
                        >
                          {((traslado.usuario_uso_destino &&
                            traslado.usuario_uso_destino.trim() !== "") ||
                            (traslado.usuario_sysman_destino &&
                              traslado.usuario_sysman_destino.trim() !== "")) &&
                          traslado.sede_origen_id !== traslado.sede_destino_id
                            ? "Traslado de Ubicación y Usuarios"
                            : (traslado.usuario_uso_destino &&
                                traslado.usuario_uso_destino.trim() !== "") ||
                              (traslado.usuario_sysman_destino &&
                                traslado.usuario_sysman_destino.trim() !== "")
                            ? "Traslado de Usuarios"
                            : "Traslado de Ubicación"}
                        </Badge>
                      </div>

                      {/* Contenido según tipo de traslado */}
                      {((traslado.usuario_uso_destino &&
                        traslado.usuario_uso_destino.trim() !== "") ||
                        (traslado.usuario_sysman_destino &&
                          traslado.usuario_sysman_destino.trim() !== "")) &&
                      traslado.sede_origen_id !== traslado.sede_destino_id ? (
                        // TRASLADO DE AMBOS - Mostrar ubicación Y usuarios
                        <div className="space-y-3">
                          {/* Cambio de ubicación */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">
                                {getSedeNombre(traslado.sede_origen_id)}
                              </span>
                            </div>
                            <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-900">
                                {getSedeNombre(traslado.sede_destino_id)}
                              </span>
                            </div>
                          </div>

                          {/* Cambio de usuarios */}
                          <div className="space-y-2">
                            {/* Usuario de Uso */}
                            {traslado.usuario_uso_destino &&
                              traslado.usuario_uso_destino.trim() !== "" && (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200 flex-1">
                                    <User className="h-4 w-4 text-red-600" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-red-600 font-medium">
                                        Usuario de Uso Anterior
                                      </span>
                                      <span className="text-sm text-red-900 font-medium">
                                        {traslado.usuario_uso_origen &&
                                        traslado.usuario_uso_origen.trim() !==
                                          ""
                                          ? traslado.usuario_uso_origen
                                          : "Sin asignar"}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowLeftRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 flex-1">
                                    <User className="h-4 w-4 text-purple-600" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-purple-600 font-medium">
                                        Usuario de Uso Nuevo
                                      </span>
                                      <span className="text-sm text-purple-900 font-medium">
                                        {traslado.usuario_uso_destino}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Usuario Sysman */}
                            {traslado.usuario_sysman_destino &&
                              traslado.usuario_sysman_destino.trim() !== "" && (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 flex-1">
                                    <User className="h-4 w-4 text-orange-600" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-orange-600 font-medium">
                                        Usuario Sysman Anterior
                                      </span>
                                      <span className="text-sm text-orange-900 font-medium">
                                        {traslado.usuario_sysman_origen &&
                                        traslado.usuario_sysman_origen.trim() !==
                                          ""
                                          ? traslado.usuario_sysman_origen
                                          : "Sin asignar"}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowLeftRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200 flex-1">
                                    <User className="h-4 w-4 text-indigo-600" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-indigo-600 font-medium">
                                        Usuario Sysman Nuevo
                                      </span>
                                      <span className="text-sm text-indigo-900 font-medium">
                                        {traslado.usuario_sysman_destino}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      ) : (traslado.usuario_uso_destino &&
                          traslado.usuario_uso_destino.trim() !== "") ||
                        (traslado.usuario_sysman_destino &&
                          traslado.usuario_sysman_destino.trim() !== "") ? (
                        // TRASLADO DE USUARIOS - Solo mostrar cambio de usuarios
                        <div className="space-y-2">
                          {/* Usuario de Uso */}
                          {((traslado.usuario_uso_origen &&
                            traslado.usuario_uso_origen.trim() !== "") ||
                            (traslado.usuario_uso_destino &&
                              traslado.usuario_uso_destino.trim() !== "")) && (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200 flex-1">
                                <User className="h-4 w-4 text-red-600" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-red-600 font-medium">
                                    Usuario de Uso Anterior
                                  </span>
                                  <span className="text-sm text-red-900 font-medium">
                                    {traslado.usuario_uso_origen || "N/A"}
                                  </span>
                                </div>
                              </div>
                              <ArrowLeftRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 flex-1">
                                <User className="h-4 w-4 text-purple-600" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-purple-600 font-medium">
                                    Usuario de Uso Nuevo
                                  </span>
                                  <span className="text-sm text-purple-900 font-medium">
                                    {traslado.usuario_uso_destino || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Usuario Sysman */}
                          {((traslado.usuario_sysman_origen &&
                            traslado.usuario_sysman_origen.trim() !== "") ||
                            (traslado.usuario_sysman_destino &&
                              traslado.usuario_sysman_destino.trim() !==
                                "")) && (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 flex-1">
                                <User className="h-4 w-4 text-orange-600" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-orange-600 font-medium">
                                    Usuario Sysman Anterior
                                  </span>
                                  <span className="text-sm text-orange-900 font-medium">
                                    {traslado.usuario_sysman_origen || "N/A"}
                                  </span>
                                </div>
                              </div>
                              <ArrowLeftRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200 flex-1">
                                <User className="h-4 w-4 text-indigo-600" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-indigo-600 font-medium">
                                    Usuario Sysman Nuevo
                                  </span>
                                  <span className="text-sm text-indigo-900 font-medium">
                                    {traslado.usuario_sysman_destino || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // TRASLADO DE UBICACIÓN - Solo mostrar cambio de sedes
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {getSedeNombre(traslado.sede_origen_id)}
                            </span>
                          </div>
                          <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900">
                              {getSedeNombre(traslado.sede_destino_id)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Motivo */}
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg line-clamp-2">
                        <span className="font-medium">Motivo:</span>{" "}
                        {traslado.motivo}
                      </div>

                      {/* Info adicional */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Activo:{" "}
                          {activos.find((a) => a.id === traslado.activo_id)
                            ?.placa || `ID: ${traslado.activo_id}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Solicitado por:{" "}
                          {usuarios.find(
                            (u) => u.id === traslado.solicitado_por_id
                          )?.nombre || `ID: ${traslado.solicitado_por_id}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <TrasladoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        traslado={selectedTraslado}
        onSuccess={handleSuccess}
      />

      <DeleteTrasladoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        traslado={selectedTraslado}
        onSuccess={handleSuccess}
      />

      <ReportesTrasladosModal
        open={reportesModalOpen}
        onOpenChange={setReportesModalOpen}
        traslados={traslados}
        activos={activos}
        sedes={sedes}
        usuarios={usuarios}
      />
    </div>
  );
}
