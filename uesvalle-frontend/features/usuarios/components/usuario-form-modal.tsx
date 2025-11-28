"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, User, Mail, Lock, Phone, UserPlus } from "lucide-react";

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
import { usuarioService } from "@/shared/services/usuario-service";
import { showToast } from "@/shared/lib/toast";

// Schema de validación
const usuarioFormSchema = z.object({
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username no puede tener más de 20 caracteres")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Solo se permiten letras, números, guiones, puntos y guiones bajos"
    ),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  correo: z.string().email("Debe ser un correo válido"),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(50, "La contraseña no puede tener más de 50 caracteres"),
  celular: z
    .string()
    .min(10, "El celular debe tener al menos 10 dígitos")
    .max(15, "El celular no puede tener más de 15 dígitos")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Solo se permiten números, +, -, espacios y paréntesis"
    ),
});

type UsuarioFormValues = z.infer<typeof usuarioFormSchema>;

interface UsuarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UsuarioFormModal({
  open,
  onOpenChange,
  onSuccess,
}: UsuarioFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      username: "",
      nombre: "",
      correo: "",
      contrasena: "",
      celular: "",
    },
  });

  const onSubmit = async (values: UsuarioFormValues) => {
    try {
      setIsSubmitting(true);

      // Preparar data con valores hardcodeados
      const registroData = {
        ...values,
        rol: "TECNICO" as const,
        sede_id: 1,
      };

      await usuarioService.registerUsuario(registroData);

      showToast.success(
        `El usuario ${values.nombre} ha sido registrado exitosamente`
      );

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : "Error al crear el usuario"
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
              <UserPlus className="h-5 w-5 text-orange-600" />
            </div>
            Nuevo Usuario
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Registra un nuevo usuario en el sistema UESVALLE
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-600" />
                    Nombre de Usuario
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ej: juan.moreno"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="ej: juan_dav.moreno@gmail.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contraseña */}
            <FormField
              control={form.control}
              name="contrasena"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-600" />
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Celular */}
            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    Número de Celular
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ej: 3009182120"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
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
