"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  MapPin,
  User,
  Wrench,
  Download,
  Cpu,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { activosService } from "@/features/inventario/services/activos-service";
import { mantenimientosService } from "@/features/mantenimientos/services/mantenimientos-service";
import { Activo } from "@/shared/types/inventario";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { showToast } from "@/shared/lib/toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ActivoFormModal } from "@/features/inventario/components/activo-form-modal";
import { DeleteActivoDialog } from "@/features/inventario/components/delete-activo-dialog";
import { useUsuarios } from "@/shared/hooks/use-usuarios";

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    bueno: { variant: "default", className: "bg-green-600" },
    regular: { variant: "secondary", className: "" },
    malo: { variant: "destructive", className: "" },
    mantenimiento: {
      variant: "outline",
      className: "border-orange-500 text-orange-700",
    },
    baja: { variant: "destructive", className: "bg-red-800" },
  };
  return variants[estado.toLowerCase()] || variants.regular;
};

export default function ActivoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getUsuarioNombre } = useUsuarios();
  const [activo, setActivo] = useState<Activo | null>(null);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const id = Number(params.id);

      console.log("🔍 Cargando datos para activo ID:", id);

      // Cargar activo
      const activoData = await activosService.getActivo(id);
      setActivo(activoData);
      console.log("✅ Activo cargado:", activoData);

      // Intentar cargar mantenimientos, pero no fallar si el endpoint no existe
      try {
        console.log("🔧 Intentando cargar mantenimientos para activo:", id);
        const mantenimientosData =
          await mantenimientosService.getMantenimientosByActivo(id);
        console.log("✅ Mantenimientos cargados:", mantenimientosData);
        setMantenimientos(mantenimientosData);
      } catch (mantError) {
        // Si el endpoint no existe (404), simplemente dejamos la lista vacía
        console.error("❌ Error al cargar mantenimientos:", mantError);
        setMantenimientos([]);
      }
    } catch (error) {
      showToast.error("Error al cargar el activo");
      console.error("❌ Error general:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    router.push("/inventario");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!activo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Activo no encontrado
        </h2>
        <Button onClick={() => router.push("/inventario")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inventario
        </Button>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(activo.estado);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/inventario")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {activo.placa}
                  </h1>
                  <Badge
                    variant={estadoBadge.variant}
                    className={estadoBadge.className}
                  >
                    {activo.estado.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  {activo.marca} {activo.modelo} • {activo.tipo}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Info Principal */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Serial
                  </label>
                  <p className="text-base font-mono mt-1">{activo.serial}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tipo
                  </label>
                  <p className="text-base capitalize mt-1">{activo.tipo}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Marca
                  </label>
                  <p className="text-base mt-1">{activo.marca}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Modelo
                  </label>
                  <p className="text-base mt-1">{activo.modelo}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sede
                  </label>
                  <p className="text-base mt-1">Sede {activo.sede_id}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Proceso
                  </label>
                  <p className="text-base mt-1">{activo.proceso}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="mantenimientos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mantenimientos">
                  <Wrench className="mr-2 h-4 w-4" />
                  Mantenimientos
                </TabsTrigger>
                <TabsTrigger value="historial">
                  <Calendar className="mr-2 h-4 w-4" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="documentos">
                  <Download className="mr-2 h-4 w-4" />
                  Documentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mantenimientos" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Historial de Mantenimientos</CardTitle>
                      <CardDescription>
                        {mantenimientos.length} mantenimiento(s) registrado(s)
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(`/mantenimientos?activo=${activo.id}`)
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      Programar Mantenimiento
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {mantenimientos.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                        <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Sin mantenimientos registrados
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Este activo aún no tiene mantenimientos programados o
                          realizados
                        </p>
                        <Button
                          onClick={() =>
                            router.push(`/mantenimientos?activo=${activo.id}`)
                          }
                          variant="outline"
                        >
                          <Wrench className="mr-2 h-4 w-4" />
                          Programar primer mantenimiento
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mantenimientos
                          .sort(
                            (a, b) =>
                              new Date(b.fecha).getTime() -
                              new Date(a.fecha).getTime()
                          )
                          .map((mant) => {
                            const getTipoBadge = (tipo: string) => {
                              switch (tipo) {
                                case "preventivo":
                                  return {
                                    variant: "default" as const,
                                    color:
                                      "bg-blue-100 text-blue-700 border-blue-200",
                                  };
                                case "correctivo":
                                  return {
                                    variant: "destructive" as const,
                                    color:
                                      "bg-red-100 text-red-700 border-red-200",
                                  };
                                case "predictivo":
                                  return {
                                    variant: "secondary" as const,
                                    color:
                                      "bg-purple-100 text-purple-700 border-purple-200",
                                  };
                                default:
                                  return {
                                    variant: "outline" as const,
                                    color: "",
                                  };
                              }
                            };

                            const tipoBadge = getTipoBadge(mant.tipo);

                            return (
                              <div
                                key={mant.id}
                                className="flex items-start gap-4 p-5 border-2 rounded-xl hover:border-orange-300 hover:shadow-md transition-all cursor-pointer bg-white"
                                onClick={() =>
                                  router.push(`/mantenimientos/${mant.id}`)
                                }
                              >
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${tipoBadge.color}`}
                                  >
                                    <Wrench className="h-6 w-6" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900 capitalize text-lg">
                                      Mantenimiento {mant.tipo}
                                    </h4>
                                    <Badge
                                      variant={tipoBadge.variant}
                                      className="capitalize"
                                    >
                                      {mant.tipo}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {format(
                                          new Date(mant.fecha),
                                          "d 'de' MMMM 'de' yyyy",
                                          { locale: es }
                                        )}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Técnico:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(mant.tecnico_id)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Creado por:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(mant.creado_por_id)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Cpu className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Hardware:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(
                                            mant.encargado_harware_id
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Monitor className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Software:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(
                                            mant.encargado_software_id
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180 flex-shrink-0 mt-2" />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historial" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Cambios</CardTitle>
                    <CardDescription>
                      Registro de modificaciones del activo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Historial disponible próximamente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos Adjuntos</CardTitle>
                    <CardDescription>
                      Facturas, garantías y otros documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No hay documentos adjuntos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActivoFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        activo={activo}
        onSuccess={loadData}
      />

      <DeleteActivoDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        activo={activo}
        onSuccess={handleDelete}
      />
    </div>
  );
}
