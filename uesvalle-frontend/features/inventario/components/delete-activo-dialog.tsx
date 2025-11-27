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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { activosService } from '../services/activos-service'
import { Activo } from '@/shared/types/inventario'
import { showToast } from '@/shared/lib/toast'
import { useAuthStore } from '@/shared/store/auth-store'

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [motivo, setMotivo] = useState('')
  const usuario = useAuthStore((state) => state.usuario)

  const handleDarDeBaja = async () => {
    if (!activo || !motivo.trim() || !usuario?.id) return

    setIsProcessing(true)
    try {
      await activosService.darDeBajaActivo(activo.id, motivo.trim(), usuario.id)
      showToast.success('Activo dado de baja correctamente')
      onOpenChange(false)
      setMotivo('') // Limpiar el campo
      onSuccess()
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : 'Error al dar de baja el activo'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Limpiar el motivo cuando se cierra el modal
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setMotivo('')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Dar de baja activo?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción cambiará el estado del activo a "BAJA". 
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
            
            {/* Campo para el motivo */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="motivo" className="text-sm font-medium text-gray-700">
                Motivo de la baja <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo por el cual se da de baja este activo..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isProcessing}
              />
              {motivo.trim().length === 0 && (
                <p className="text-xs text-red-600">
                  * Este campo es obligatorio para proceder con la baja del activo
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDarDeBaja}
            disabled={isProcessing || !motivo.trim()}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Dar de baja
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
