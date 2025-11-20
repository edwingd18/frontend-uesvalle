"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Loader2,
  ArrowLeftRight,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trasladosService } from "../services/traslados-service";
import { Traslado } from "@/shared/types/traslado";
import { showToast } from "@/shared/lib/toast";
import { useInventario } from "@/features/inventario/hooks/use-inventario";
import { useAuthStore } from "@/shared/store/auth-store";
import { sedes } from "@/mocks/inventario";

const trasladoFormSchema = z.object({
  activo_id: z.number().min(1, "Selecciona un activo"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  sede_origen_id: z.number().min(1, "Selecciona la sede de origen"),
  sede_destino_id: z.number().min(1, "Selecciona la sede de destino"),
  motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
});

type TrasladoFormValues = z.infer<typeof trasladoFormSchema>;

interface TrasladoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traslado?: Traslado | null;
  onSuccess: () => void;
}

export function TrasladoFormModal({
  open,
  onOpenChange,
  traslado,
  onSuccess,
}: TrasladoFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!traslado;
  const { data: activos } = useInventario();
  const usuario = useAuthStore((state) => state.usuario);

  const form = useForm<TrasladoFormValues>({
    resolver: zodResolver(trasladoFormSchema),
    defaultValues: traslado
      ? {
          activo_id: traslado.activo_id,
          fecha: traslado.fecha.split("T")[0],
          sede_origen_id: traslado.sede_origen_id,
          sede_destino_id: traslado.sede_destino_id,
          motivo: traslado.motivo,
        }
      : {
          activo_id: 0,
          fecha: new Date().toISOString().split("T")[0],
          sede_origen_id: 0,
          sede_destino_id: 0,
          motivo: "",
        },
  });

  // Actualizar sede de origen cuando se selecciona un activo
  const activoSeleccionado = activos.find(
    (a) => a.id === form.watch("activo_id")
  );

  useEffect(() => {
    if (activoSeleccionado && !isEditing) {
      form.setValue("sede_origen_id", activoSeleccionado.sede_id);
    }
  }, [activoSeleccionado, form, isEditing]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: TrasladoFormValues) => {
    // Prevenir múltiples envíos
    if (isSubmitting) return;

    if (!usuario) {
      showToast.error("Usuario no autenticado");
      return;
    }

    if (data.sede_origen_id === data.sede_destino_id) {
      showToast.error("La sede de origen y destino no pueden ser iguales");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convertir fecha a formato ISO con hora
      const fechaISO = new Date(data.fecha + "T00:00:00.000Z").toISOString();

      const payload = {
        ...data,
        fecha: fechaISO,
        solicitado_por_id: usuario.id,
      };

      if (isEditing && traslado) {
        await trasladosService.updateTraslado(traslado.id, {
          fecha: data.fecha,
          motivo: data.motivo,
          sede_destino_id: data.sede_destino_id,
        });
        showToast.success("Traslado actualizado correctamente");
      } else {
        await trasladosService.createTraslado(payload);
        showToast.success("Traslado creado exitosamente");
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error al guardar traslado:", error);
      showToast.error(
        error instanceof Error ? error.message : "Error al guardar el traslado"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-orange-600" />
            {isEditing ? "Editar Traslado" : "Nuevo Traslado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del traslado"
              : "Registra el traslado de un activo entre sedes"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Selección de Activo */}
            <FormField
              control={form.control}
              name="activo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activo *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un activo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {activos.map((activo) => (
                        <SelectItem key={activo.id} value={String(activo.id)}>
                          {activo.placa} - {activo.tipo} {activo.marca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha */}
            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha del Traslado *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sedes */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sede_origen_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Sede Origen *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ""}
                      disabled={isEditing || !!activoSeleccionado}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sede origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sedes.map((sede) => (
                          <SelectItem key={sede.id} value={String(sede.id)}>
                            {sede.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sede_destino_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Sede Destino *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sede destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sedes.map((sede) => (
                          <SelectItem key={sede.id} value={String(sede.id)}>
                            {sede.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Motivo */}
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Motivo del Traslado *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el motivo del traslado..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Actualizar" : "Crear Traslado"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
