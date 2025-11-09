"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mantenimiento } from '@/shared/types/mantenimiento'
import {
  Wrench,
  Calendar,
  User,
  Package
} from "lucide-react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useUsuarios } from '@/shared/hooks/use-usuarios'
import { useInventario } from '@/features/inventario/hooks/use-inventario'

interface MantenimientoDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento: Mantenimiento | null
}

const getTipoBadgeVariant = (tipo: string) => {
  switch (tipo) {
    case 'preventivo':
      return 'default'
    case 'correctivo':
      return 'destructive'
    case 'predictivo':
      return 'secondary'
    default:
      return 'outline'
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateString
  }
}

export function MantenimientoDetailsModal({
  open,
  onOpenChange,
  mantenimiento,
}: MantenimientoDetailsModalProps) {
  const { getUsuarioNombre } = useUsuarios()
  const { data: activos } = useInventario()

  if (!mantenimiento) return null

  const activo = activos.find(a => a.id === mantenimiento.activo_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Detalles del Mantenimiento #{mantenimiento.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Activo */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              Activo
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {activo ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Placa:</span>
                    <span className="text-sm font-medium">{activo.placa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Equipo:</span>
                    <span className="text-sm font-medium capitalize">
                      {activo.marca} {activo.modelo} ({activo.tipo})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Serial:</span>
                    <span className="text-sm font-medium">{activo.serial}</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Activo #{mantenimiento.activo_id}</div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tipo */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Tipo de Mantenimiento</span>
            </div>
            <Badge variant={getTipoBadgeVariant(mantenimiento.tipo) as any} className="text-sm capitalize">
              {mantenimiento.tipo}
            </Badge>
          </div>

          <Separator />

          {/* Fecha */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Fecha</span>
            </div>
            <p className="text-sm text-gray-900">
              {formatDate(mantenimiento.fecha)}
            </p>
          </div>

          <Separator />

          {/* Personal Asignado */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-orange-600" />
              Personal Asignado
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Técnico:</span>
                <span className="text-sm font-medium">
                  {getUsuarioNombre(mantenimiento.tecnico_id)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Encargado Hardware:</span>
                <span className="text-sm font-medium">
                  {getUsuarioNombre(mantenimiento.encargado_harware_id)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Encargado Software:</span>
                <span className="text-sm font-medium">
                  {getUsuarioNombre(mantenimiento.encargado_software_id)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Creado Por:</span>
                <span className="text-sm font-medium">
                  {getUsuarioNombre(mantenimiento.creado_por_id)}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas del sistema */}
          {(mantenimiento.createdAt || mantenimiento.updatedAt) && (
            <>
              <Separator />
              <div className="text-xs text-gray-500 space-y-1">
                {mantenimiento.createdAt && (
                  <div>Creado: {formatDate(mantenimiento.createdAt)}</div>
                )}
                {mantenimiento.updatedAt && (
                  <div>Última actualización: {formatDate(mantenimiento.updatedAt)}</div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
