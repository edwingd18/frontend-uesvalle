"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activo } from "@/shared/types/inventario"
import { Calendar, MapPin, User, Package, DollarSign, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ActivoDetailsModalProps {
  activo: Activo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'bueno':
      return 'default'
    case 'regular':
      return 'secondary'
    case 'malo':
    case 'baja':
      return 'destructive'
    case 'mantenimiento':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function ActivoDetailsModal({ activo, open, onOpenChange }: ActivoDetailsModalProps) {
  if (!activo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-600" />
            Detalles del Activo
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="mantenimientos">Mantenimientos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Placa</label>
                  <p className="text-lg font-semibold">{activo.placa}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Serial</label>
                  <p className="text-base">{activo.serial}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <p className="text-base capitalize">{activo.tipo}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <Badge variant={getEstadoBadgeVariant(activo.estado)}>
                      {activo.estado.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Marca</label>
                  <p className="text-base">{activo.marca}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Modelo</label>
                  <p className="text-base">{activo.modelo}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Proceso</label>
                  <p className="text-base capitalize">{activo.proceso.replace('_', ' ')}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Sede</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    <p className="text-base">Sede {activo.sede_id}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activo.fechaAdquisicion && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Adquisición
                  </label>
                  <p className="text-base mt-1">
                    {format(new Date(activo.fechaAdquisicion), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              )}

              {activo.valor && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor
                  </label>
                  <p className="text-base mt-1">
                    ${activo.valor.toLocaleString('es-CO')}
                  </p>
                </div>
              )}

              {activo.usuario_sysman_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sysman Responsable
                  </label>
                  <p className="text-base mt-1">Usuario ID: {activo.usuario_sysman_id}</p>
                </div>
              )}

              {activo.usuario_uso_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Usuario en Uso
                  </label>
                  <p className="text-base mt-1">Usuario ID: {activo.usuario_uso_id}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mantenimientos" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Historial de Mantenimientos
              </h3>
              <p className="text-sm text-gray-500">
                El historial de mantenimientos estará disponible próximamente
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
