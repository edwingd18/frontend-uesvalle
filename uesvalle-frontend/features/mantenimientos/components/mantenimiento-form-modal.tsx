"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Loader2,
  Wrench,
  Calendar,
  Users,
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
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { mantenimientosService } from "../services/mantenimientos-service";
import {
  Mantenimiento,
  CreateMantenimientoData,
  UpdateMantenimientoData,
} from "@/shared/types/mantenimiento";
import { showToast } from "@/shared/lib/toast";
import { useInventario } from "@/features/inventario/hooks/use-inventario";
import { useUsuarios } from "@/shared/hooks/use-usuarios";
import { useAuthStore } from "@/shared/store/auth-store";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const mantenimientoFormSchema = z.object({
  activo_id: z.number().min(1, "Selecciona un activo"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  tipo: z.enum(["preventivo", "correctivo", "predictivo"], {
    message: "Selecciona un tipo de mantenimiento",
  }),
  tecnico_id: z.number().min(1, "Selecciona un técnico"),
  encargado_harware_id: z
    .number()
    .min(1, "Selecciona un encargado de hardware"),
  encargado_software_id: z
    .number()
    .min(1, "Selecciona un encargado de software"),
});

type MantenimientoFormValues = z.infer<typeof mantenimientoFormSchema>;

interface MantenimientoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mantenimiento?: Mantenimiento | null;
  onSuccess: () => void;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Detalles",
    description: "Activo y tipo",
    icon: Wrench,
  },
  {
    id: 2,
    title: "Personal",
    description: "Responsables",
    icon: Users,
  },
];

export function MantenimientoFormModal({
  open,
  onOpenChange,
  mantenimiento,
  onSuccess,
}: MantenimientoFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchActivo, setSearchActivo] = useState("");
  const [showActivoDropdown, setShowActivoDropdown] = useState(false);
  const isEditing = !!mantenimiento;

  const { data: activos, loading: loadingActivos } = useInventario();
  const {
    usuarios,
    loading: loadingUsuarios,
    getUsuarioNombre,
  } = useUsuarios();
  const usuario = useAuthStore((state) => state.usuario);

  // Cerrar dropdown al hacer click fuera
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

  const form = useForm<MantenimientoFormValues>({
    resolver: zodResolver(mantenimientoFormSchema),
    defaultValues: mantenimiento
      ? {
          activo_id: mantenimiento.activo_id,
          fecha: mantenimiento.fecha.split("T")[0],
          tipo: mantenimiento.tipo,
          tecnico_id: mantenimiento.tecnico_id,
          encargado_harware_id: mantenimiento.encargado_harware_id,
          encargado_software_id: mantenimiento.encargado_software_id,
        }
      : {
          activo_id: 0,
          fecha: "",
          tipo: "preventivo",
          tecnico_id: 0,
          encargado_harware_id: 0,
          encargado_software_id: 0,
        },
  });

  // Reset form when mantenimiento changes
  useEffect(() => {
    if (mantenimiento) {
      form.reset({
        activo_id: mantenimiento.activo_id,
        fecha: mantenimiento.fecha.split("T")[0],
        tipo: mantenimiento.tipo,
        tecnico_id: mantenimiento.tecnico_id,
        encargado_harware_id: mantenimiento.encargado_harware_id,
        encargado_software_id: mantenimiento.encargado_software_id,
      });
    } else {
      form.reset({
        activo_id: 0,
        fecha: "",
        tipo: "preventivo",
        tecnico_id: 0,
        encargado_harware_id: 0,
        encargado_software_id: 0,
      });
    }
    setCurrentStep(0);
  }, [mantenimiento, form, open]);

  const handleSubmit = async (data: MantenimientoFormValues) => {
    setIsSubmitting(true);
    try {
      // Construir payload según si es creación o edición
      const basePayload = {
        activo_id: data.activo_id,
        fecha: new Date(data.fecha).toISOString(),
        tipo: data.tipo,
        tecnico_id: data.tecnico_id,
        encargado_harware_id: data.encargado_harware_id,
        encargado_software_id: data.encargado_software_id,
      };

      if (isEditing && mantenimiento) {
        // Al editar, incluir actualizado_por_id
        const updatePayload: UpdateMantenimientoData = {
          ...basePayload,
          actualizado_por_id: usuario?.id || 1,
        };
        await mantenimientosService.updateMantenimiento(
          mantenimiento.id,
          updatePayload
        );
        showToast.success("Mantenimiento actualizado correctamente");
      } else {
        // Al crear, incluir creado_por_id
        const createPayload: CreateMantenimientoData = {
          ...basePayload,
          creado_por_id: usuario?.id || 1,
        };
        await mantenimientosService.createMantenimiento(createPayload);
        showToast.success("Mantenimiento creado exitosamente");
      }

      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error completo:", error);
      showToast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar el mantenimiento"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof MantenimientoFormValues)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["activo_id", "tipo", "fecha"];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Filtrar solo usuarios técnicos (SYSMAN) para el técnico
  const tecnicos = usuarios.filter(
    (u) => u.rol === "SYSMAN" || u.rol === "ADMIN"
  );

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "preventivo":
        return "default";
      case "correctivo":
        return "destructive";
      case "predictivo":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Obtener info del activo seleccionado
  const selectedActivo = activos.find((a) => a.id === form.watch("activo_id"));

  // Filtrar activos por búsqueda
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1600px] w-[96vw] max-h-[92vh] p-0 gap-0 overflow-hidden sm:!max-w-[1600px]">
        {/* Header limpio */}
        <div className="bg-white border-b px-16 py-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              {isEditing
                ? "Editar Mantenimiento"
                : "Programar Nuevo Mantenimiento"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm mt-2 ml-14">
              {isEditing
                ? "Modifica los detalles del mantenimiento programado"
                : "Completa la información en 2 pasos sencillos"}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper personalizado */}
          <div className="mt-8 px-32">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center"
                  style={{ flex: index < steps.length - 1 ? 1 : "none" }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all ${
                        index === currentStep
                          ? "bg-orange-600 text-white ring-4 ring-orange-100 scale-110"
                          : index < currentStep
                          ? "bg-orange-600 text-white"
                          : "bg-white border-2 border-gray-300 text-gray-500"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium mt-3 whitespace-nowrap ${
                        index === currentStep
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-6 transition-all duration-500 ${
                        index < currentStep ? "bg-orange-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div
          className="overflow-y-auto px-16 py-8 bg-gray-50"
          style={{ maxHeight: "calc(92vh - 320px)", minHeight: "400px" }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* PASO 1: Información del Mantenimiento */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      Detalles del Mantenimiento
                    </h3>
                    <p className="text-sm text-gray-600">
                      Selecciona el activo y define el tipo de mantenimiento
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-7">
                    <FormField
                      control={form.control}
                      name="activo_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-base font-semibold">
                            Activo a Mantener *
                          </FormLabel>
                          <div className="relative">
                            {!field.value ? (
                              // Modo búsqueda: input editable
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
                                    className="h-12 text-base pr-10"
                                  />
                                </FormControl>
                                <ChevronsUpDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                              </>
                            ) : (
                              // Modo seleccionado: mostrar activo con opción de cambiar
                              <>
                                <FormControl>
                                  <div className="h-12 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                      <span className="font-mono text-sm font-semibold truncate">
                                        {selectedActivo?.placa}
                                      </span>
                                      <span className="text-gray-600">-</span>
                                      <span className="text-sm truncate">
                                        {selectedActivo?.marca}{" "}
                                        {selectedActivo?.modelo}
                                      </span>
                                    </div>
                                    {!isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(0);
                                          setSearchActivo("");
                                          setShowActivoDropdown(false);
                                        }}
                                        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </FormControl>
                              </>
                            )}

                            {/* Dropdown de resultados */}
                            {showActivoDropdown && !isEditing && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-auto">
                                {filteredActivos.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    No se encontraron activos
                                  </div>
                                ) : (
                                  <div className="p-2">
                                    {filteredActivos.map((activo) => (
                                      <div
                                        key={activo.id}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          field.onChange(activo.id);
                                          setSearchActivo(
                                            `${activo.placa} - ${activo.marca} ${activo.modelo}`
                                          );
                                          setShowActivoDropdown(false);
                                        }}
                                        className={cn(
                                          "flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
                                          activo.id === field.value &&
                                            "bg-orange-50"
                                        )}
                                      >
                                        <Check
                                          className={cn(
                                            "h-4 w-4 text-orange-600 flex-shrink-0",
                                            activo.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-semibold">
                                              {activo.placa}
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {activo.tipo}
                                            </Badge>
                                          </div>
                                          <span className="text-xs text-gray-600 truncate">
                                            {activo.marca} {activo.modelo} •
                                            Serial: {activo.serial}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <FormDescription className="text-sm">
                            {isEditing
                              ? "No se puede cambiar el activo en modo edición"
                              : "Escribe para filtrar y seleccionar el equipo que recibirá mantenimiento"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Info del activo seleccionado */}
                    {selectedActivo && (
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl shadow-sm">
                        <h4 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <div className="bg-blue-200 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-blue-700" />
                          </div>
                          Información del Activo Seleccionado
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Placa:
                            </span>
                            <p className="text-base font-semibold font-mono mt-1">
                              {selectedActivo.placa}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Tipo:
                            </span>
                            <p className="text-base font-semibold capitalize mt-1">
                              {selectedActivo.tipo}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Estado:
                            </span>
                            <Badge className="mt-2 text-sm px-3 py-1">
                              {selectedActivo.estado}
                            </Badge>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Serial:
                            </span>
                            <p className="text-base font-semibold mt-1">
                              {selectedActivo.serial}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm col-span-2">
                            <span className="text-sm text-gray-600 font-medium">
                              Equipo:
                            </span>
                            <p className="text-base font-semibold mt-1">
                              {selectedActivo.marca} {selectedActivo.modelo}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-16 gap-y-7">
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              Tipo de Mantenimiento *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 text-base w-full">
                                  <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                <SelectItem
                                  value="preventivo"
                                  className="text-base py-3"
                                >
                                  Preventivo - Mantenimiento rutinario
                                  programado
                                </SelectItem>
                                <SelectItem
                                  value="correctivo"
                                  className="text-base py-3"
                                >
                                  Correctivo - Reparación de fallas
                                </SelectItem>
                                <SelectItem
                                  value="predictivo"
                                  className="text-base py-3"
                                >
                                  Predictivo - Diagnóstico preventivo
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              Fecha Programada *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="date"
                                  {...field}
                                  className="h-12 text-base"
                                />
                                <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-sm">
                              Fecha en la que se realizará el mantenimiento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Asignación de Personal */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in-50 slide-in-from-right-5 duration-300">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-3">
                      <div className="bg-orange-200 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-orange-700" />
                      </div>
                      Asignación de Personal
                    </h3>
                    <p className="text-sm text-orange-700 ml-11">
                      Designa a los responsables técnicos del mantenimiento
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="tecnico_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Técnico Responsable *
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={String(field.value)}
                            disabled={loadingUsuarios}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full">
                                <SelectValue placeholder="Selecciona un técnico" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {tecnicos.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={String(user.id)}
                                  className="text-base py-3"
                                >
                                  {user.nombre} - {user.correo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm">
                            Principal encargado del mantenimiento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="encargado_harware_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Encargado Hardware *
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={String(field.value)}
                            disabled={loadingUsuarios}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full">
                                <SelectValue placeholder="Selecciona un encargado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {tecnicos.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={String(user.id)}
                                  className="text-base py-3"
                                >
                                  {user.nombre} - {user.correo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm">
                            Responsable de componentes físicos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="encargado_software_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Encargado Software *
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={String(field.value)}
                            disabled={loadingUsuarios}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full">
                                <SelectValue placeholder="Selecciona un encargado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {tecnicos.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={String(user.id)}
                                  className="text-base py-3"
                                >
                                  {user.nombre} - {user.correo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm">
                            Responsable de sistemas y aplicaciones
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Resumen antes de enviar */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      📋 Resumen del Mantenimiento
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedActivo && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-600 font-medium">
                            Activo:
                          </span>
                          <p className="text-base font-semibold font-mono mt-1">
                            {selectedActivo.placa}
                          </p>
                        </div>
                      )}
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-600 font-medium">
                          Tipo:
                        </span>
                        <Badge
                          variant={
                            getTipoBadgeVariant(form.watch("tipo")) as any
                          }
                          className="mt-2 text-sm px-3 py-1 capitalize"
                        >
                          {form.watch("tipo")}
                        </Badge>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-600 font-medium">
                          Fecha:
                        </span>
                        <p className="text-base font-semibold mt-1">
                          {form.watch("fecha")
                            ? new Date(form.watch("fecha")).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "No definida"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-600 font-medium">
                          Técnico:
                        </span>
                        <p className="text-base font-semibold mt-1">
                          {getUsuarioNombre(form.watch("tecnico_id"))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t bg-white px-16 py-6">
          <div className="flex gap-4 justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="h-12 px-6 font-medium text-base"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-12 px-6 font-medium text-base"
              >
                Cancelar
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 px-8 font-medium text-base bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30"
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSubmitting}
                  className="h-12 px-8 font-medium text-base bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!isSubmitting && <Check className="mr-2 h-4 w-4" />}
                  {isEditing
                    ? "Actualizar Mantenimiento"
                    : "Programar Mantenimiento"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
