"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wrench,
  Calendar,
  User,
  Package,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mantenimientosService } from "@/features/mantenimientos/services/mantenimientos-service";
import { activosService } from "@/features/inventario/services/activos-service";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { Activo } from "@/shared/types/inventario";
import { showToast } from "@/shared/lib/toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsuarios } from "@/shared/hooks/use-usuarios";
import { MantenimientoFormModal } from "@/features/mantenimientos/components/mantenimiento-form-modal";
import { DeleteMantenimientoDialog } from "@/features/mantenimientos/components/delete-mantenimiento-dialog";

const getTipoBadge = (tipo: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    preventivo: { variant: "default", className: "bg-blue-600" },
    correctivo: { variant: "destructive", className: "" },
  };
  return variants[tipo.toLowerCase()] || variants.preventivo;
};

export default function MantenimientoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(
    null
  );
  const [activo, setActivo] = useState<Activo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { getUsuarioNombre } = useUsuarios();

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const id = Number(params.id);
      const mantData = await mantenimientosService.getMantenimiento(id);
      setMantenimiento(mantData);

      if (mantData.activo_id) {
        const activoData = await activosService.getActivo(mantData.activo_id);
        setActivo(activoData);
      }
    } catch (error) {
      showToast.error("Error al cargar los datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    router.push("/mantenimientos");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!mantenimiento) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Wrench className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mantenimiento no encontrado
        </h2>
        <Button
          onClick={() => router.push("/mantenimientos")}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mantenimientos
        </Button>
      </div>
    );
  }

  const tipoBadge = getTipoBadge(mantenimiento.tipo);

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
                onClick={() => router.push("/mantenimientos")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Mantenimiento #{mantenimiento.id}
                  </h1>
                  <Badge
                    variant={tipoBadge.variant}
                    className={`${tipoBadge.className} capitalize`}
                  >
                    {mantenimiento.tipo}
                  </Badge>
                </div>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(
                    new Date(mantenimiento.fecha_realizado),
                    "d 'de' MMMM 'de' yyyy",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
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
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Activo */}
            {activo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Activo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/inventario/${activo.id}`)}
                  >
                    <p className="font-semibold text-lg mb-1">{activo.placa}</p>
                    <p className="text-sm text-gray-600">
                      {activo.marca} {activo.modelo}
                    </p>
                    <p className="text-sm text-gray-500 capitalize mt-2">
                      {activo.tipo}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Personal Asignado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Técnico Responsable
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {getUsuarioNombre(mantenimiento.tecnico_id).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getUsuarioNombre(mantenimiento.tecnico_id)}
                      </p>
                      <p className="text-sm text-gray-500">Técnico principal</p>
                    </div>
                  </div>
                </div>

                {mantenimiento.encargado_harware_id && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Encargado Hardware
                      </label>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getUsuarioNombre(
                              mantenimiento.encargado_harware_id
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {getUsuarioNombre(
                              mantenimiento.encargado_harware_id
                            )}
                          </p>
                          <p className="text-sm text-gray-500">Hardware</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {mantenimiento.encargado_software_id && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Encargado Software
                      </label>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {getUsuarioNombre(
                              mantenimiento.encargado_software_id
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {getUsuarioNombre(
                              mantenimiento.encargado_software_id
                            )}
                          </p>
                          <p className="text-sm text-gray-500">Software</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Mantenimiento</CardTitle>
                <CardDescription>
                  Detalles generales del servicio realizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tipo de Mantenimiento
                    </label>
                    <p className="mt-1 text-base font-semibold capitalize">
                      {mantenimiento.tipo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fecha de Realización
                    </label>
                    <p className="mt-1 text-base font-semibold">
                      {format(
                        new Date(mantenimiento.fecha_realizado),
                        "d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </p>
                  </div>
                  {mantenimiento.fecha_creacion && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Fecha de Registro
                      </label>
                      <p className="mt-1 text-base">
                        {format(
                          new Date(mantenimiento.fecha_creacion),
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  )}
                  {mantenimiento.creado_por_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Registrado por
                      </label>
                      <p className="mt-1 text-base">
                        {getUsuarioNombre(mantenimiento.creado_por_id)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Observaciones */}
            {(mantenimiento.observacion_hardware ||
              mantenimiento.observacion_software) && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones del Mantenimiento</CardTitle>
                  <CardDescription>
                    Detalles y trabajos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mantenimiento.observacion_hardware && (
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Hardware
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                          {mantenimiento.observacion_hardware}
                        </pre>
                      </div>
                    </div>
                  )}

                  {mantenimiento.observacion_software && (
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Software
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                          {mantenimiento.observacion_software}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MantenimientoFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        mantenimiento={mantenimiento}
        onSuccess={loadData}
      />

      <DeleteMantenimientoDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        mantenimiento={mantenimiento}
        onSuccess={handleDelete}
        activoPlaca={activo?.placa}
        tecnicoNombre={
          mantenimiento ? getUsuarioNombre(mantenimiento.tecnico_id) : undefined
        }
      />
    </div>
  );
}
