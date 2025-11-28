"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, User, Mail, Shield, Edit, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usuarioService } from "@/shared/services/usuario-service";
import { Usuario } from "@/shared/types/auth";
import { showToast } from "@/shared/lib/toast";

// Schema de validación para edición
const editUsuarioFormSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  correo: z.string().email("Debe ser un correo válido"),
  sede_id: z.number().min(1, "Debe seleccionar una sede"),
});

type EditUsuarioFormValues = z.infer<typeof editUsuarioFormSchema>;

const SEDES = [
  { id: 1, nombre: "Cali - Sede Principal" },
  { id: 2, nombre: "Palmira" },
  { id: 3, nombre: "Tuluá" },
  { id: 4, nombre: "Buga" },
  { id: 5, nombre: "Cartago" },
];

interface EditUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export function EditUsuarioModal({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: EditUsuarioModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditUsuarioFormValues>({
    resolver: zodResolver(editUsuarioFormSchema),
    defaultValues: {
      nombre: "",
      correo: "",
      sede_id: 1,
    },
  });

  // Actualizar el formulario cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      form.reset({
        nombre: usuario.nombre,
        correo: usuario.correo,
        sede_id: usuario.sede_id,
      });
    }
  }, [usuario, form]);

  const onSubmit = async (values: EditUsuarioFormValues) => {
    if (!usuario) return;

    try {
      setIsSubmitting(true);

      await usuarioService.actualizarUsuario(usuario.id, {
        nombre: values.nombre,
        correo: values.correo,
        sede_id: values.sede_id,
      });

      showToast.success(
        `El usuario ${values.nombre} ha sido actualizado exitosamente`
      );

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Edit className="h-5 w-5 text-orange-600" />
            </div>
            Editar Usuario
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Modifica la información del usuario
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre completo */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-600" />
                    Nombre Completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ej: Juan Moreno"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Correo */}
            <FormField
              control={form.control}
              name="correo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    Correo Electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ej: juan@uesvalle.edu"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sede */}
            <FormField
              control={form.control}
              name="sede_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    Sede
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sede" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEDES.map((sede) => (
                        <SelectItem key={sede.id} value={sede.id.toString()}>
                          {sede.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rol (solo lectura) */}
            {usuario && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Rol
                </label>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <Badge
                    variant={
                      usuario.rol === "ADMIN"
                        ? "default"
                        : usuario.rol === "SYSMAN"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      usuario.rol === "ADMIN"
                        ? "bg-red-600"
                        : usuario.rol === "SYSMAN"
                        ? "bg-orange-600"
                        : ""
                    }
                  >
                    {usuario.rol}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    El rol no puede ser modificado
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
