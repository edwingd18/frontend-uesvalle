"use client"

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { activosService } from '../services/activos-service'
import { Activo } from '@/shared/types/inventario'
import { showToast } from '@/shared/lib/toast'

interface DeleteActivoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activo: Activo | null
  onSuccess: () => void
}

export function DeleteActivoDialog({
  open,
  onOpenChange,
  activo,
  onSuccess,
}: DeleteActivoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!activo) return

    setIsDeleting(true)
    try {
      await activosService.deleteActivo(activo.id)
      showToast.success('Activo eliminado correctamente')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : 'Error al eliminar el activo'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar activo?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción no se puede deshacer. El activo será eliminado
              permanentemente del sistema.
            </p>
            {activo && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Placa:</span> {activo.placa}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Tipo:</span> {activo.tipo}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Marca:</span> {activo.marca} {activo.modelo}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
