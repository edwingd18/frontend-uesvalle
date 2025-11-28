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
import { usuarioService } from "@/shared/services/usuario-service";
import { Usuario } from "@/shared/types/auth";
import { showToast } from "@/shared/lib/toast";

interface DeleteUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

const getRolBadgeVariant = (rol: string) => {
  switch (rol) {
    case "ADMIN":
      return { variant: "default" as const, className: "bg-red-600" };
    case "SYSMAN":
      return { variant: "default" as const, className: "bg-orange-600" };
    case "TECNICO":
      return { variant: "secondary" as const, className: "" };
    default:
      return { variant: "outline" as const, className: "" };
  }
};

export function DeleteUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: DeleteUsuarioDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!usuario) return;

    setIsDeleting(true);
    try {
      await usuarioService.eliminarUsuario(usuario.id);
      showToast.success("Usuario desactivado correctamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Error al desactivar el usuario"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Desactivar usuario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El usuario será marcado como inactivo y no podrá acceder al sistema.
            Esta acción se puede revertir posteriormente.
          </AlertDialogDescription>
          {usuario && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Nombre:
                </span>
                <span className="text-sm text-gray-900">{usuario.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Correo:
                </span>
                <span className="text-sm text-gray-900">{usuario.correo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Rol:
                </span>
                <Badge
                  variant={getRolBadgeVariant(usuario.rol).variant}
                  className={getRolBadgeVariant(usuario.rol).className}
                >
                  {usuario.rol}
                </Badge>
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
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Desactivar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
