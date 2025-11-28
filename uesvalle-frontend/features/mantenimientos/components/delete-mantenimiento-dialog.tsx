"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mantenimientosService } from "../services/mantenimientos-service";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { showToast } from "@/shared/lib/toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DeleteMantenimientoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mantenimiento: Mantenimiento | null;
  onSuccess: () => void;
  activoPlaca?: string;
  tecnicoNombre?: string;
}

const getTipoBadgeVariant = (tipo: string) => {
  switch (tipo) {
    case "preventivo":
      return "default";
    case "correctivo":
      return "destructive";
    default:
      return "outline";
  }
};

export function DeleteMantenimientoDialog({
  open,
  onOpenChange,
  mantenimiento,
  onSuccess,
  activoPlaca,
  tecnicoNombre,
}: DeleteMantenimientoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!mantenimiento) return;

    setIsDeleting(true);
    try {
      await mantenimientosService.deleteMantenimiento(mantenimiento.id);
      showToast.success("Mantenimiento eliminado correctamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar el mantenimiento"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: es,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar mantenimiento?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El mantenimiento será eliminado
            permanentemente del sistema.
          </AlertDialogDescription>
          {mantenimiento && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Tipo:
                </span>
                <Badge
                  variant={getTipoBadgeVariant(mantenimiento.tipo) as any}
                  className="capitalize"
                >
                  {mantenimiento.tipo}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Activo:
                </span>
                <span className="text-sm text-gray-900">
                  {activoPlaca || `#${mantenimiento.activo_id}`}
                </span>
              </div>
              {tecnicoNombre && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Técnico:
                  </span>
                  <span className="text-sm text-gray-900">{tecnicoNombre}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Fecha de realización:
                </span>
                <span className="text-sm text-gray-900">
                  {formatDate(mantenimiento.fecha_realizado)}
                </span>
              </div>
            </div>
          )}
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
  );
}
