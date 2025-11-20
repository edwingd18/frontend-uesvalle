"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { trasladosService } from "../services/traslados-service";
import { Traslado } from "@/shared/types/traslado";
import { showToast } from "@/shared/lib/toast";

interface DeleteTrasladoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traslado: Traslado | null;
  onSuccess: () => void;
}

export function DeleteTrasladoDialog({
  open,
  onOpenChange,
  traslado,
  onSuccess,
}: DeleteTrasladoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!traslado) return;

    setIsDeleting(true);
    try {
      await trasladosService.deleteTraslado(traslado.id);
      showToast.success("Traslado eliminado correctamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error al eliminar traslado:", error);
      showToast.error(
        error instanceof Error ? error.message : "Error al eliminar el traslado"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            registro del traslado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
