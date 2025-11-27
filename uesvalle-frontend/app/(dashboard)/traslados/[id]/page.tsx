"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  User,
  FileText,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { trasladosService } from "@/features/traslados/services/traslados-service";
import { activosService } from "@/features/inventario/services/activos-service";
import { usuarioService } from "@/shared/services/usuario-service";
import { Traslado } from "@/shared/types/traslado";
import { Activo } from "@/shared/types/inventario";
import { Usuario } from "@/shared/types/auth";
import { sedes } from "@/mocks/inventario";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TrasladoFormModal } from "@/features/traslados/components/traslado-form-modal";
import { DeleteTrasladoDialog } from "@/features/traslados/components/delete-traslado-dialog";

const getSedeNombre = (sedeId: number) => {
  return sedes.find((sede) => sede.id === sedeId)?.nombre || "N/A";
};

export default function TrasladoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [traslado, setTraslado] = useState<Traslado | null>(null);
  const [activo, setActivo] = useState<Activo | null>(null);
  const [solicitante, setSolicitante] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener traslado
      const trasladoData = await trasladosService.getTrasladoById(Number(id));
      setTraslado(trasladoData);

      // Obtener activo
      try {
        const activoData = await activosService.getActivo(
          trasladoData.activo_id
        );
        setActivo(activoData);
      } catch (err) {
        console.error("Error al cargar activo:", err);
      }

      // Obtener solicitante
      try {
        const solicitanteData = await usuarioService.obtenerUsuarioPorId(
          trasladoData.solicitado_por_id
        );
        setSolicitante(solicitanteData);
      } catch (err) {
        console.error("Error al cargar solicitante:", err);
      }
    } catch (err) {
      console.error("Error al cargar traslado:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar el traslado"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSuccess = () => {
    fetchData();
  };

  const handleDeleteSuccess = () => {
    router.push("/traslados");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !traslado) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Traslado no encontrado"}
          </p>
          <Button onClick={() => router.push("/traslados")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Traslados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/traslados")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Traslado #{traslado.id}
            </h1>
            <p className="text-muted-foreground">
              Detalles completos del traslado
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-orange-600" />
              Información del Traslado
            </CardTitle>
            <CardDescription>
              <Badge
                variant="secondary"
                className={
                  ((traslado.usuario_uso_destino &&
                    traslado.usuario_uso_destino.trim() !== "") ||
                    (traslado.usuario_sysman_destino &&
                      traslado.usuario_sysman_destino.trim() !== "")) &&
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
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fecha */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Fecha del Traslado
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(traslado.fecha), "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Contenido según tipo de traslado */}
            {((traslado.usuario_uso_destino &&
              traslado.usuario_uso_destino.trim() !== "") ||
              (traslado.usuario_sysman_destino &&
                traslado.usuario_sysman_destino.trim() !== "")) &&
            traslado.sede_origen_id !== traslado.sede_destino_id ? (
              // TRASLADO DE AMBOS
              <div className="space-y-6">
                {/* Cambio de Ubicación */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Cambio de Ubicación
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600 uppercase">
                          Origen
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {getSedeNombre(traslado.sede_origen_id)}
                      </p>
                    </div>

                    <ArrowLeftRight className="h-8 w-8 text-gray-400 flex-shrink-0" />

                    <div className="flex-1 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span className="text-xs font-medium text-green-600 uppercase">
                          Destino
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-900">
                        {getSedeNombre(traslado.sede_destino_id)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cambio de Usuarios */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    Cambio de Responsables
                  </p>

                  {/* Usuario de Uso */}
                  {((traslado.usuario_uso_origen &&
                    traslado.usuario_uso_origen.trim() !== "") ||
                    (traslado.usuario_uso_destino &&
                      traslado.usuario_uso_destino.trim() !== "")) && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                        Usuario de Uso
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-red-600" />
                            <span className="text-xs font-medium text-red-600 uppercase">
                              Anterior
                            </span>
                          </div>
                          <p className="text-lg font-bold text-red-900">
                            {traslado.usuario_uso_origen || "N/A"}
                          </p>
                        </div>

                        <ArrowLeftRight className="h-8 w-8 text-gray-400 flex-shrink-0" />

                        <div className="flex-1 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600 uppercase">
                              Nuevo
                            </span>
                          </div>
                          <p className="text-lg font-bold text-purple-900">
                            {traslado.usuario_uso_destino || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usuario Sysman */}
                  {((traslado.usuario_sysman_origen &&
                    traslado.usuario_sysman_origen.trim() !== "") ||
                    (traslado.usuario_sysman_destino &&
                      traslado.usuario_sysman_destino.trim() !== "")) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                        Usuario Sysman
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-orange-600" />
                            <span className="text-xs font-medium text-orange-600 uppercase">
                              Anterior
                            </span>
                          </div>
                          <p className="text-lg font-bold text-orange-900">
                            {traslado.usuario_sysman_origen || "N/A"}
                          </p>
                        </div>

                        <ArrowLeftRight className="h-8 w-8 text-gray-400 flex-shrink-0" />

                        <div className="flex-1 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            <span className="text-xs font-medium text-indigo-600 uppercase">
                              Nuevo
                            </span>
                          </div>
                          <p className="text-lg font-bold text-indigo-900">
                            {traslado.usuario_sysman_destino || "N/A"}
                          </p>
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
              // TRASLADO DE USUARIOS
              <div className="space-y-6">
                {/* Cambio de Usuarios */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    Cambio de Responsables
                  </p>

                  {/* Usuario de Uso */}
                  {((traslado.usuario_uso_origen &&
                    traslado.usuario_uso_origen.trim() !== "") ||
                    (traslado.usuario_uso_destino &&
                      traslado.usuario_uso_destino.trim() !== "")) && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                        Usuario de Uso
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-red-600" />
                            <span className="text-xs font-medium text-red-600 uppercase">
                              Anterior
                            </span>
                          </div>
                          <p className="text-lg font-bold text-red-900">
                            {traslado.usuario_uso_origen || "N/A"}
                          </p>
                        </div>

                        <ArrowLeftRight className="h-8 w-8 text-gray-400 flex-shrink-0" />

                        <div className="flex-1 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600 uppercase">
                              Nuevo
                            </span>
                          </div>
                          <p className="text-lg font-bold text-purple-900">
                            {traslado.usuario_uso_destino || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usuario Sysman */}
                  {((traslado.usuario_sysman_origen &&
                    traslado.usuario_sysman_origen.trim() !== "") ||
                    (traslado.usuario_sysman_destino &&
                      traslado.usuario_sysman_destino.trim() !== "")) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                        Usuario Sysman
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-orange-600" />
                            <span className="text-xs font-medium text-orange-600 uppercase">
                              Anterior
                            </span>
                          </div>
                          <p className="text-lg font-bold text-orange-900">
                            {traslado.usuario_sysman_origen || "N/A"}
                          </p>
                        </div>

                        <ArrowLeftRight className="h-8 w-8 text-gray-400 flex-shrink-0" />

                        <div className="flex-1 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            <span className="text-xs font-medium text-indigo-600 uppercase">
                              Nuevo
                            </span>
                          </div>
                          <p className="text-lg font-bold text-indigo-900">
                            {traslado.usuario_sysman_destino || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // TRASLADO DE UBICACIÓN
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Cambio de Ubicación
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600 uppercase">
                        Origen
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {getSedeNombre(traslado.sede_origen_id)}
                    </p>
                  </div>

                  <ArrowLeftRight className="h-8 w-8 text-gray-400 flex-shrink-0" />

                  <div className="flex-1 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium text-green-600 uppercase">
                        Destino
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {getSedeNombre(traslado.sede_destino_id)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Motivo */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Motivo del Traslado
                </p>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border">
                  {traslado.motivo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Activo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Activo Trasladado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Placa</p>
                    <p className="text-lg font-semibold font-mono text-orange-600">
                      {activo.placa}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Serial</p>
                    <p className="text-lg font-semibold font-mono">
                      {activo.serial}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo</p>
                    <p className="text-lg font-semibold capitalize">
                      {activo.tipo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Marca</p>
                    <p className="text-lg font-semibold">{activo.marca}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Modelo</p>
                    <p className="text-lg font-semibold">{activo.modelo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <Badge
                      variant={
                        activo.estado.toLowerCase() === "bueno"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {activo.estado}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/inventario/${activo.id}`)}
                  className="w-full"
                >
                  Ver Detalles del Activo
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">
                Activo ID: {traslado.activo_id} (No se pudo cargar la
                información)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Información del Solicitante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600" />
              Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent>
            {solicitante ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nombre</p>
                  <p className="text-lg font-semibold">{solicitante.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Correo</p>
                  <p className="text-lg">{solicitante.correo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rol</p>
                  <Badge>{solicitante.rol}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Usuario ID: {traslado.solicitado_por_id} (No se pudo cargar la
                información)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metadatos */}
        {(traslado.createdAt || traslado.updatedAt) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              {traslado.createdAt && (
                <p>
                  <span className="font-medium">Creado:</span>{" "}
                  {format(new Date(traslado.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </p>
              )}
              {traslado.updatedAt && (
                <p>
                  <span className="font-medium">Última actualización:</span>{" "}
                  {format(new Date(traslado.updatedAt), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de edición */}
      <TrasladoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        traslado={traslado}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
