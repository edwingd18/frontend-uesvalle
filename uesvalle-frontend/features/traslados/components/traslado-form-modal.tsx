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
  User,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  ChevronsUpDown,
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
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { trasladosService } from "../services/traslados-service";
import { Traslado } from "@/shared/types/traslado";
import { showToast } from "@/shared/lib/toast";
import { useInventario } from "@/features/inventario/hooks/use-inventario";
import { useAuthStore } from "@/shared/store/auth-store";
import { sedes } from "@/mocks/inventario";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Tipo y Activo",
    description: "Selecciona el tipo de traslado y el activo",
    icon: Package,
  },
  {
    id: 2,
    title: "Detalles",
    description: "Configura los detalles del traslado",
    icon: ArrowLeftRight,
  },
  {
    id: 3,
    title: "Motivo",
    description: "Describe el motivo del traslado",
    icon: FileText,
  },
];

const trasladoFormSchema = z
  .object({
    tipo_traslado: z.enum(["sede", "usuario", "ambos"], {
      message: "Selecciona el tipo de traslado",
    }),
    activo_id: z.number().min(1, "Selecciona un activo"),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    sede_origen_id: z.number().optional(),
    sede_destino_id: z.number().optional(),
    usuario_uso_origen: z.string().optional(),
    usuario_sysman_origen: z.string().optional(),
    usuario_uso_destino: z.string().optional(),
    usuario_sysman_destino: z.string().optional(),
    motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
  })
  .refine(
    (data) => {
      if (data.tipo_traslado === "sede" || data.tipo_traslado === "ambos") {
        return data.sede_destino_id && data.sede_destino_id > 0;
      }
      return true;
    },
    {
      message: "Debes seleccionar una sede de destino",
      path: ["sede_destino_id"],
    }
  )
  .refine(
    (data) => {
      if (data.tipo_traslado === "usuario" || data.tipo_traslado === "ambos") {
        return data.usuario_uso_destino || data.usuario_sysman_destino;
      }
      return true;
    },
    {
      message: "Debes especificar al menos un usuario destino",
      path: ["usuario_uso_destino"],
    }
  );

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
  const [currentStep, setCurrentStep] = useState(1);
  const [searchActivo, setSearchActivo] = useState("");
  const [showActivoDropdown, setShowActivoDropdown] = useState(false);
  const isEditing = !!traslado;
  const { data: activos, loading: loadingActivos } = useInventario();
  const usuario = useAuthStore((state) => state.usuario);

  // Detectar tipo de traslado automáticamente
  const detectarTipoTraslado = (traslado: Traslado) => {
    const tieneUsuarios =
      (traslado.usuario_uso_destino &&
        traslado.usuario_uso_destino.trim() !== "") ||
      (traslado.usuario_sysman_destino &&
        traslado.usuario_sysman_destino.trim() !== "");
    const cambioSede = traslado.sede_origen_id !== traslado.sede_destino_id;

    if (tieneUsuarios && cambioSede) return "ambos";
    if (tieneUsuarios) return "usuario";
    return "sede";
  };

  const form = useForm<TrasladoFormValues>({
    resolver: zodResolver(trasladoFormSchema),
    defaultValues: traslado
      ? {
          tipo_traslado: detectarTipoTraslado(traslado),
          activo_id: traslado.activo_id,
          fecha: traslado.fecha.split("T")[0],
          sede_origen_id: traslado.sede_origen_id,
          sede_destino_id: traslado.sede_destino_id,
          usuario_uso_origen: traslado.usuario_uso_origen || "",
          usuario_sysman_origen: traslado.usuario_sysman_origen || "",
          usuario_uso_destino: traslado.usuario_uso_destino || "",
          usuario_sysman_destino: traslado.usuario_sysman_destino || "",
          motivo: traslado.motivo,
        }
      : {
          tipo_traslado: "sede",
          activo_id: 0,
          fecha: new Date().toISOString().split("T")[0],
          sede_origen_id: 0,
          sede_destino_id: 0,
          usuario_uso_origen: "",
          usuario_sysman_origen: "",
          usuario_uso_destino: "",
          usuario_sysman_destino: "",
          motivo: "",
        },
  });

  const selectedActivo = activos.find((a) => a.id === form.watch("activo_id"));

  const filteredActivos = activos.filter((activo) => {
    if (!searchActivo) return true;
    const searchLower = searchActivo.toLowerCase();
    return (
      activo.placa.toLowerCase().includes(searchLower) ||
      activo.marca.toLowerCase().includes(searchLower) ||
      activo.modelo.toLowerCase().includes(searchLower) ||
      activo.serial.toLowerCase().includes(searchLower) ||
      activo.tipo.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-activo-dropdown]")) {
        setShowActivoDropdown(false);
      }
    };

    if (showActivoDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showActivoDropdown]);

  useEffect(() => {
    if (selectedActivo && !isEditing) {
      form.setValue("sede_origen_id", selectedActivo.sede_id);
    }
  }, [selectedActivo, form, isEditing]);

  useEffect(() => {
    if (open && traslado) {
      // Resetear el formulario con los valores del traslado cuando se abre en modo edición
      form.reset({
        tipo_traslado: detectarTipoTraslado(traslado),
        activo_id: traslado.activo_id,
        fecha: traslado.fecha.split("T")[0],
        sede_origen_id: traslado.sede_origen_id,
        sede_destino_id: traslado.sede_destino_id,
        usuario_uso_origen: traslado.usuario_uso_origen || "",
        usuario_sysman_origen: traslado.usuario_sysman_origen || "",
        usuario_uso_destino: traslado.usuario_uso_destino || "",
        usuario_sysman_destino: traslado.usuario_sysman_destino || "",
        motivo: traslado.motivo,
      });
    } else if (!open) {
      form.reset();
      setCurrentStep(1);
      setSearchActivo("");
      setShowActivoDropdown(false);
    }
  }, [open, traslado, form]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof TrasladoFormValues)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["tipo_traslado", "activo_id", "fecha"];
    } else if (currentStep === 2) {
      const tipoTraslado = form.getValues("tipo_traslado");
      if (tipoTraslado === "sede" || tipoTraslado === "ambos") {
        fieldsToValidate.push("sede_origen_id", "sede_destino_id");
      }
      if (tipoTraslado === "usuario" || tipoTraslado === "ambos") {
        fieldsToValidate.push("usuario_uso_destino", "usuario_sysman_destino");
      }
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (data: TrasladoFormValues) => {
    if (isSubmitting) return;

    if (!usuario) {
      showToast.error("Usuario no autenticado");
      return;
    }

    if (data.tipo_traslado === "sede" || data.tipo_traslado === "ambos") {
      if (data.sede_origen_id === data.sede_destino_id) {
        showToast.error("La sede de origen y destino no pueden ser iguales");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const fechaISO = new Date(data.fecha + "T00:00:00.000Z").toISOString();

      const payload: any = {
        activo_id: data.activo_id,
        fecha: fechaISO,
        motivo: data.motivo,
        solicitado_por_id: usuario.id,
      };

      if (data.tipo_traslado === "sede") {
        payload.sede_destino_id = data.sede_destino_id;
        payload.usuario_uso_origen = "";
        payload.usuario_sysman_origen = "";
        payload.usuario_uso_destino = "";
        payload.usuario_sysman_destino = "";
      } else if (data.tipo_traslado === "usuario") {
        payload.sede_destino_id =
          selectedActivo?.sede_id || data.sede_origen_id;
        payload.usuario_uso_destino = data.usuario_uso_destino?.trim() || "";
        payload.usuario_sysman_destino =
          data.usuario_sysman_destino?.trim() || "";
      } else {
        payload.sede_destino_id = data.sede_destino_id;
        payload.usuario_uso_destino = data.usuario_uso_destino?.trim() || "";
        payload.usuario_sysman_destino =
          data.usuario_sysman_destino?.trim() || "";
      }

      if (isEditing && traslado) {
        await trasladosService.updateTraslado(traslado.id, payload);
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

  const renderStepContent = () => {
    const tipoTraslado = form.watch("tipo_traslado");

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tipo de Traslado */}
            <FormField
              control={form.control}
              name="tipo_traslado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Tipo de Traslado *
                  </FormLabel>
                  <FormDescription>
                    {isEditing
                      ? "El tipo de traslado no puede modificarse"
                      : "Selecciona qué deseas trasladar"}
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div
                      onClick={() => !isEditing && field.onChange("sede")}
                      className={cn(
                        "relative flex flex-col items-center p-4 border-2 rounded-lg transition-all",
                        isEditing
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:border-blue-500",
                        field.value === "sede"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      )}
                    >
                      <MapPin
                        className={cn(
                          "h-8 w-8 mb-2",
                          field.value === "sede"
                            ? "text-blue-600"
                            : "text-gray-400"
                        )}
                      />
                      <span className="font-medium text-sm text-center">
                        Solo Ubicación
                      </span>
                      {field.value === "sede" && (
                        <Check className="absolute top-2 right-2 h-5 w-5 text-blue-600" />
                      )}
                    </div>

                    <div
                      onClick={() => !isEditing && field.onChange("usuario")}
                      className={cn(
                        "relative flex flex-col items-center p-4 border-2 rounded-lg transition-all",
                        isEditing
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:border-purple-500",
                        field.value === "usuario"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200"
                      )}
                    >
                      <User
                        className={cn(
                          "h-8 w-8 mb-2",
                          field.value === "usuario"
                            ? "text-purple-600"
                            : "text-gray-400"
                        )}
                      />
                      <span className="font-medium text-sm text-center">
                        Solo Usuarios
                      </span>
                      {field.value === "usuario" && (
                        <Check className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
                      )}
                    </div>

                    <div
                      onClick={() => !isEditing && field.onChange("ambos")}
                      className={cn(
                        "relative flex flex-col items-center p-4 border-2 rounded-lg transition-all",
                        isEditing
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:border-green-500",
                        field.value === "ambos"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200"
                      )}
                    >
                      <ArrowLeftRight
                        className={cn(
                          "h-8 w-8 mb-2",
                          field.value === "ambos"
                            ? "text-green-600"
                            : "text-gray-400"
                        )}
                      />
                      <span className="font-medium text-sm text-center">
                        Ubicación y Usuarios
                      </span>
                      {field.value === "ambos" && (
                        <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Activo con buscador */}
            <FormField
              control={form.control}
              name="activo_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base font-semibold">
                    Activo *
                  </FormLabel>
                  <FormDescription>
                    Busca y selecciona el activo que deseas trasladar
                  </FormDescription>
                  <div className="relative" data-activo-dropdown>
                    {!field.value ? (
                      <>
                        <FormControl>
                          <Input
                            placeholder="Buscar por placa, marca, modelo o serial..."
                            value={searchActivo}
                            onChange={(e) => {
                              setSearchActivo(e.target.value);
                              setShowActivoDropdown(true);
                            }}
                            onFocus={() => setShowActivoDropdown(true)}
                            disabled={isEditing || loadingActivos}
                            className="h-12 text-base"
                          />
                        </FormControl>
                        {showActivoDropdown && filteredActivos.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                            {filteredActivos.map((activo) => (
                              <button
                                key={activo.id}
                                type="button"
                                onClick={() => {
                                  field.onChange(activo.id);
                                  setSearchActivo("");
                                  setShowActivoDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Package className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="outline"
                                        className="font-mono text-xs"
                                      >
                                        {activo.placa}
                                      </Badge>
                                      <span className="text-xs text-gray-500 capitalize">
                                        {activo.tipo}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {activo.marca} {activo.modelo}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      Serial: {activo.serial}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <FormControl>
                        <div className="h-12 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="font-mono text-sm font-semibold truncate">
                              {selectedActivo?.placa}
                            </span>
                            <span className="text-sm text-gray-600 truncate">
                              - {selectedActivo?.marca} {selectedActivo?.modelo}
                            </span>
                          </div>
                          {!isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                field.onChange(0);
                                setSearchActivo("");
                              }}
                              className="flex-shrink-0"
                            >
                              Cambiar
                            </Button>
                          )}
                        </div>
                      </FormControl>
                    )}
                  </div>
                  {selectedActivo && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Ubicación actual:</span>{" "}
                        {sedes.find((s) => s.id === selectedActivo.sede_id)
                          ?.nombre || "N/A"}
                      </p>
                    </div>
                  )}
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
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha del Traslado *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Sedes */}
            {(tipoTraslado === "sede" || tipoTraslado === "ambos") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold">
                    Cambio de Ubicación
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sede_origen_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sede Origen *</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value ? String(field.value) : ""}
                          disabled={isEditing || !!selectedActivo}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                        <FormLabel>Sede Destino *</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
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
              </div>
            )}

            {/* Usuarios */}
            {(tipoTraslado === "usuario" || tipoTraslado === "ambos") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base font-semibold">
                    Cambio de Responsables
                  </h3>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Los usuarios actuales se obtendrán automáticamente del
                    activo. Solo ingresa los nuevos responsables.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="usuario_uso_destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuevo Usuario de Uso</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del nuevo usuario de uso"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usuario_sysman_destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuevo Usuario Sysman</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del nuevo usuario sysman"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Motivo del Traslado *
                  </FormLabel>
                  <FormDescription>
                    Describe detalladamente el motivo de este traslado
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Reorganización de equipos por cambio de área, necesidad de actualización de responsables..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resumen */}
            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">
                Resumen del Traslado
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <Badge
                    variant="secondary"
                    className={
                      tipoTraslado === "ambos"
                        ? "bg-green-100 text-green-800"
                        : tipoTraslado === "usuario"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {tipoTraslado === "sede"
                      ? "Solo Ubicación"
                      : tipoTraslado === "usuario"
                      ? "Solo Usuarios"
                      : "Ubicación y Usuarios"}
                  </Badge>
                </div>
                {selectedActivo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activo:</span>
                    <span className="font-medium">{selectedActivo.placa}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {form.watch("fecha")
                      ? new Date(form.watch("fecha")).toLocaleDateString(
                          "es-ES"
                        )
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ArrowLeftRight className="h-6 w-6 text-orange-600" />
            {isEditing ? "Editar Traslado" : "Nuevo Traslado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del traslado"
              : "Completa los siguientes pasos para registrar el traslado"}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper mejorado - Solo mostrar si NO es edición */}
        {!isEditing && (
          <div className="py-6 px-4 sm:px-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center"
                  style={{ flex: index < steps.length - 1 ? 1 : "none" }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold transition-all",
                        currentStep === step.id
                          ? "bg-orange-600 text-white ring-4 ring-orange-100 scale-110"
                          : currentStep > step.id
                          ? "bg-orange-600 text-white"
                          : "bg-white border-2 border-gray-300 text-gray-500"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <step.icon
                          className={cn(
                            "h-5 w-5 sm:h-6 sm:w-6",
                            currentStep === step.id
                              ? "text-white"
                              : "text-gray-400"
                          )}
                        />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-medium mt-3 whitespace-nowrap text-center",
                        currentStep === step.id
                          ? "text-orange-600"
                          : currentStep > step.id
                          ? "text-gray-700"
                          : "text-gray-400"
                      )}
                    >
                      {step.title}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-3 sm:mx-4 transition-all duration-500",
                        currentStep > step.id ? "bg-orange-600" : "bg-gray-300"
                      )}
                      style={{ marginTop: "-20px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Content */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {isEditing ? (
              // Modo edición: Mostrar todo en una sola vista
              <div className="space-y-6 px-6">
                {/* Mostrar tipo de traslado como badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Tipo de traslado:
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      form.watch("tipo_traslado") === "ambos"
                        ? "bg-green-100 text-green-800"
                        : form.watch("tipo_traslado") === "usuario"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {form.watch("tipo_traslado") === "sede"
                      ? "Solo Ubicación"
                      : form.watch("tipo_traslado") === "usuario"
                      ? "Solo Usuarios"
                      : "Ubicación y Usuarios"}
                  </Badge>
                </div>

                {/* Mostrar activo seleccionado */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Activo
                  </p>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <span className="font-mono font-semibold">
                      {selectedActivo?.placa}
                    </span>
                    <span className="text-gray-600">
                      - {selectedActivo?.marca} {selectedActivo?.modelo}
                    </span>
                  </div>
                </div>

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
                        <Input type="date" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sedes si aplica */}
                {(form.watch("tipo_traslado") === "sede" ||
                  form.watch("tipo_traslado") === "ambos") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-semibold">Ubicación</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="sede_destino_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sede Destino *</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value ? String(field.value) : ""}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Seleccionar sede" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sedes.map((sede) => (
                                <SelectItem
                                  key={sede.id}
                                  value={String(sede.id)}
                                >
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
                )}

                {/* Usuarios si aplica */}
                {(form.watch("tipo_traslado") === "usuario" ||
                  form.watch("tipo_traslado") === "ambos") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-purple-600" />
                      <h3 className="text-base font-semibold">Responsables</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="usuario_uso_destino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario de Uso</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre del usuario de uso"
                              className="h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usuario_sysman_destino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario Sysman</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre del usuario sysman"
                              className="h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

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
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              // Modo creación: Mostrar con stepper
              <div className="py-2">{renderStepContent()}</div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t px-6">
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}

              <div className={cn("flex gap-2", isEditing && "ml-auto")}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                {!isEditing && currentStep < steps.length ? (
                  <Button type="button" onClick={handleNext}>
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? "Actualizar Traslado" : "Crear Traslado"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
