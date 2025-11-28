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
import { Textarea } from "@/components/ui/textarea";
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

const mantenimientoFormSchema = z
  .object({
    alcance: z.enum(["hardware", "software", "ambos"], {
      message: "Selecciona el alcance del mantenimiento",
    }),
    activo_id: z.number().min(1, "Selecciona un activo"),
    fecha_realizado: z.string().min(1, "La fecha es obligatoria"),
    tipo: z.enum(["preventivo", "correctivo"], {
      message: "Selecciona un tipo de mantenimiento",
    }),
    tecnico_id: z.number().min(1, "Selecciona un técnico"),
    encargado_harware_id: z.number().optional(),
    encargado_software_id: z.number().optional(),
    arreglos_hardware: z.array(z.string()).optional(),
    arreglos_software: z.array(z.string()).optional(),
    observacion_hardware: z.string().optional(),
    observacion_software: z.string().optional(),
  })
  .refine(
    (data) => {
      // Si el alcance es hardware o ambos, el encargado de hardware es obligatorio
      if (data.alcance === "hardware" || data.alcance === "ambos") {
        return data.encargado_harware_id && data.encargado_harware_id > 0;
      }
      return true;
    },
    {
      message: "Selecciona un encargado de hardware",
      path: ["encargado_harware_id"],
    }
  )
  .refine(
    (data) => {
      // Si el alcance es software o ambos, el encargado de software es obligatorio
      if (data.alcance === "software" || data.alcance === "ambos") {
        return data.encargado_software_id && data.encargado_software_id > 0;
      }
      return true;
    },
    {
      message: "Selecciona un encargado de software",
      path: ["encargado_software_id"],
    }
  );

type MantenimientoFormValues = z.infer<typeof mantenimientoFormSchema>;

interface MantenimientoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mantenimiento?: Mantenimiento | null;
  onSuccess: () => void;
}

// Arreglos comunes
const ARREGLOS_HARDWARE = [
  "Limpieza interna del equipo",
  "Cambio de pasta térmica",
  "Limpieza de ventiladores",
  "Revisión de conexiones",
  "Cambio de disco duro",
  "Ampliación de RAM",
  "Cambio de fuente de poder",
  "Reparación de teclado",
  "Cambio de batería",
  "Revisión de puertos USB",
  "Otros",
];

const ARREGLOS_SOFTWARE = [
  "Actualización de sistema operativo",
  "Instalación de antivirus",
  "Limpieza de archivos temporales",
  "Optimización de inicio",
  "Actualización de drivers",
  "Instalación de software requerido",
  "Configuración de red",
  "Respaldo de información",
  "Formateo y reinstalación",
  "Eliminación de malware",
  "Otros",
];

const steps: Step[] = [
  {
    id: 0,
    title: "Alcance",
    description: "Tipo de servicio",
    icon: Wrench,
  },
  {
    id: 1,
    title: "Detalles",
    description: "Activo y tipo",
    icon: Package,
  },
  {
    id: 2,
    title: "Arreglos",
    description: "Trabajos realizados",
    icon: Wrench,
  },
  {
    id: 3,
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
  const showStepper = !isEditing; // Solo mostrar stepper en modo crear

  const { data: activos, loading: loadingActivos } = useInventario();
  const {
    usuarios,
    loading: loadingUsuarios,
    getUsuarioNombre,
  } = useUsuarios();
  const usuario = useAuthStore((state) => state.usuario);

  // Detectar el alcance del mantenimiento basándose en los datos existentes
  const detectarAlcance = (
    mant: Mantenimiento
  ): "hardware" | "software" | "ambos" => {
    const tieneHardware =
      mant.encargado_harware_id > 0 || !!mant.observacion_hardware;
    const tieneSoftware =
      mant.encargado_software_id > 0 || !!mant.observacion_software;

    if (tieneHardware && tieneSoftware) return "ambos";
    if (tieneHardware) return "hardware";
    if (tieneSoftware) return "software";
    return "ambos"; // Por defecto
  };

  // Extraer los arreglos de la observación guardada
  const extraerArreglos = (
    observacion: string | null | undefined
  ): string[] => {
    if (!observacion) return [];

    // Buscar la sección "Arreglos realizados:" hasta "Observaciones adicionales:" o fin
    const match = observacion.match(
      /Arreglos realizados:\s*\n([\s\S]*?)(?:\n\nObservaciones adicionales:|$)/
    );
    if (match && match[1]) {
      // Extraer cada línea que empiece con "- "
      const arreglos = match[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("- "))
        .map((line) => line.trim().substring(2).trim())
        .filter((arreglo) => arreglo.length > 0);
      return arreglos;
    }

    return [];
  };

  // Extraer solo las observaciones adicionales (sin los arreglos comunes)
  const extraerObservacionesAdicionales = (
    observacion: string | null | undefined
  ): string => {
    if (!observacion) return "";

    // Buscar la sección "Observaciones adicionales:"
    const match = observacion.match(/Observaciones adicionales:\s*\n([\s\S]*)/);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Si no tiene el formato esperado, devolver todo (es observación manual antigua)
    if (!observacion.includes("Arreglos realizados:")) {
      return observacion;
    }

    return "";
  };

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
          alcance: detectarAlcance(mantenimiento),
          activo_id: mantenimiento.activo_id,
          fecha_realizado: mantenimiento.fecha_realizado.split("T")[0],
          tipo: mantenimiento.tipo,
          tecnico_id: mantenimiento.tecnico_id,
          encargado_harware_id: mantenimiento.encargado_harware_id || 0,
          encargado_software_id: mantenimiento.encargado_software_id || 0,
          arreglos_hardware: extraerArreglos(
            mantenimiento.observacion_hardware
          ),
          arreglos_software: extraerArreglos(
            mantenimiento.observacion_software
          ),
          observacion_hardware: extraerObservacionesAdicionales(
            mantenimiento.observacion_hardware
          ),
          observacion_software: extraerObservacionesAdicionales(
            mantenimiento.observacion_software
          ),
        }
      : {
          alcance: "ambos",
          activo_id: 0,
          fecha_realizado: "",
          tipo: "preventivo",
          tecnico_id: 0,
          encargado_harware_id: 0,
          encargado_software_id: 0,
          arreglos_hardware: [],
          arreglos_software: [],
          observacion_hardware: "",
          observacion_software: "",
        },
  });

  // Reset form when mantenimiento changes
  useEffect(() => {
    if (mantenimiento) {
      const alcanceDetectado = detectarAlcance(mantenimiento);

      form.reset({
        alcance: alcanceDetectado,
        activo_id: mantenimiento.activo_id,
        fecha_realizado: mantenimiento.fecha_realizado.split("T")[0],
        tipo: mantenimiento.tipo,
        tecnico_id: mantenimiento.tecnico_id,
        encargado_harware_id: mantenimiento.encargado_harware_id || 0,
        encargado_software_id: mantenimiento.encargado_software_id || 0,
        arreglos_hardware: extraerArreglos(mantenimiento.observacion_hardware),
        arreglos_software: extraerArreglos(mantenimiento.observacion_software),
        observacion_hardware: extraerObservacionesAdicionales(
          mantenimiento.observacion_hardware
        ),
        observacion_software: extraerObservacionesAdicionales(
          mantenimiento.observacion_software
        ),
      });
    } else {
      form.reset({
        alcance: "ambos",
        activo_id: 0,
        fecha_realizado: "",
        tipo: "preventivo",
        tecnico_id: 0,
        encargado_harware_id: 0,
        encargado_software_id: 0,
        arreglos_hardware: [],
        arreglos_software: [],
        observacion_hardware: "",
        observacion_software: "",
      });
    }
    setCurrentStep(0);
  }, [mantenimiento, form, open]);

  const handleSubmit = async (data: MantenimientoFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && mantenimiento) {
        // MODO EDITAR: Enviar solo los campos según el alcance
        const updatePayload: UpdateMantenimientoData = {
          activo_id: data.activo_id,
          fecha_realizado: new Date(data.fecha_realizado).toISOString(),
          tipo: data.tipo,
          tecnico_id: data.tecnico_id,
          actualizado_por_id: usuario?.id || 1,
        };

        // Agregar campos según el alcance seleccionado
        if (data.alcance === "hardware" || data.alcance === "ambos") {
          updatePayload.encargado_harware_id = data.encargado_harware_id;

          // Construir observación de hardware con arreglos + texto adicional
          let observacionHardware = "";
          if (data.arreglos_hardware && data.arreglos_hardware.length > 0) {
            observacionHardware =
              "Arreglos realizados:\n" +
              data.arreglos_hardware.map((a) => `- ${a}`).join("\n");
          }
          if (data.observacion_hardware) {
            if (observacionHardware)
              observacionHardware += "\n\nObservaciones adicionales:\n";
            observacionHardware += data.observacion_hardware;
          }
          updatePayload.observacion_hardware = observacionHardware || null;
        }

        if (data.alcance === "software" || data.alcance === "ambos") {
          updatePayload.encargado_software_id = data.encargado_software_id;

          // Construir observación de software con arreglos + texto adicional
          let observacionSoftware = "";
          if (data.arreglos_software && data.arreglos_software.length > 0) {
            observacionSoftware =
              "Arreglos realizados:\n" +
              data.arreglos_software.map((a) => `- ${a}`).join("\n");
          }
          if (data.observacion_software) {
            if (observacionSoftware)
              observacionSoftware += "\n\nObservaciones adicionales:\n";
            observacionSoftware += data.observacion_software;
          }
          updatePayload.observacion_software = observacionSoftware || null;
        }

        await mantenimientosService.updateMantenimiento(
          mantenimiento.id,
          updatePayload
        );
        showToast.success("Mantenimiento actualizado correctamente");
      } else {
        // MODO CREAR: Construir payload con arreglos
        const basePayload: any = {
          activo_id: data.activo_id,
          fecha_realizado: new Date(data.fecha_realizado).toISOString(),
          tipo: data.tipo,
          tecnico_id: data.tecnico_id,
        };

        // Agregar encargados según el alcance
        if (data.alcance === "hardware" || data.alcance === "ambos") {
          basePayload.encargado_harware_id = data.encargado_harware_id;

          // Construir observación de hardware con arreglos + texto adicional
          let observacionHardware = "";
          if (data.arreglos_hardware && data.arreglos_hardware.length > 0) {
            observacionHardware =
              "Arreglos realizados:\n" +
              data.arreglos_hardware.map((a) => `- ${a}`).join("\n");
          }
          if (data.observacion_hardware) {
            if (observacionHardware)
              observacionHardware += "\n\nObservaciones adicionales:\n";
            observacionHardware += data.observacion_hardware;
          }
          if (observacionHardware) {
            basePayload.observacion_hardware = observacionHardware;
          }
        }

        if (data.alcance === "software" || data.alcance === "ambos") {
          basePayload.encargado_software_id = data.encargado_software_id;

          // Construir observación de software con arreglos + texto adicional
          let observacionSoftware = "";
          if (data.arreglos_software && data.arreglos_software.length > 0) {
            observacionSoftware =
              "Arreglos realizados:\n" +
              data.arreglos_software.map((a) => `- ${a}`).join("\n");
          }
          if (data.observacion_software) {
            if (observacionSoftware)
              observacionSoftware += "\n\nObservaciones adicionales:\n";
            observacionSoftware += data.observacion_software;
          }
          if (observacionSoftware) {
            basePayload.observacion_software = observacionSoftware;
          }
        }

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
      fieldsToValidate = ["alcance"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["activo_id", "tipo", "fecha_realizado"];
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

  // Filtrar usuarios que pueden realizar mantenimientos (todos los roles)
  const tecnicos = usuarios.filter(
    (u) => u.rol === "ADMIN" || u.rol === "SYSMAN" || u.rol === "TECNICO"
  );

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
      <DialogContent className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header limpio */}
        <div className="bg-white border-b px-4 sm:px-8 lg:px-16 py-4 sm:py-6 flex-none">
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
                : "Completa la información en 4 pasos sencillos"}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper personalizado - Solo en modo crear */}
          {showStepper && (
            <div className="mt-4 sm:mt-6 lg:mt-8 px-0 sm:px-8 lg:px-24">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center"
                    style={{ flex: index < steps.length - 1 ? 1 : "none" }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all ${
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
                        className={`h-0.5 flex-1 mx-4 sm:mx-6 transition-all duration-500 ${
                          index < currentStep ? "bg-orange-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8 bg-gray-50">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* MODO EDITAR: Vista simple con todos los campos */}
              {isEditing && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  {/* Información del Activo */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      Información del Activo
                    </h3>

                    <FormField
                      control={form.control}
                      name="activo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Activo *
                          </FormLabel>
                          <FormControl>
                            <div className="h-12 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="font-mono text-sm font-semibold">
                                {selectedActivo?.placa}
                              </span>
                              <span className="text-gray-600">-</span>
                              <span className="text-sm">
                                {selectedActivo?.marca} {selectedActivo?.modelo}
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm">
                            No se puede cambiar el activo en modo edición
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Alcance del Mantenimiento */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      Alcance del Mantenimiento
                    </h3>

                    <FormField
                      control={form.control}
                      name="alcance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Tipo de Servicio *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Selecciona el alcance" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="hardware"
                                className="text-base py-3"
                              >
                                Hardware - Mantenimiento físico del equipo
                              </SelectItem>
                              <SelectItem
                                value="software"
                                className="text-base py-3"
                              >
                                Software - Configuración y programas
                              </SelectItem>
                              <SelectItem
                                value="ambos"
                                className="text-base py-3"
                              >
                                Ambos - Hardware y Software
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm">
                            Cambia el alcance si necesitas agregar más servicios
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Detalles del Mantenimiento */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      Detalles del Mantenimiento
                    </h3>

                    <div className="space-y-6">
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
                                <SelectTrigger className="h-12 text-base">
                                  <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fecha_realizado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              Fecha de Realización *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                max={new Date().toISOString().split("T")[0]}
                                disabled={isSubmitting}
                                className="h-12 text-base"
                              />
                            </FormControl>
                            <FormDescription className="text-sm">
                              Fecha en la que se realizó el mantenimiento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Arreglos y Observaciones - Mostrar según alcance */}
                  {(form.watch("alcance") === "hardware" ||
                    form.watch("alcance") === "ambos") && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-600" />
                        Trabajos de Hardware
                      </h3>

                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="arreglos_hardware"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Arreglos Comunes de Hardware
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    const current = field.value || [];
                                    if (!current.includes(value)) {
                                      field.onChange([...current, value]);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Selecciona arreglos realizados" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ARREGLOS_HARDWARE.map((arreglo) => (
                                      <SelectItem key={arreglo} value={arreglo}>
                                        {arreglo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {field.value.map((arreglo) => (
                                    <Badge
                                      key={arreglo}
                                      variant="secondary"
                                      className="gap-1 pr-1"
                                    >
                                      {arreglo}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(
                                            field.value?.filter(
                                              (a) => a !== arreglo
                                            )
                                          );
                                        }}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        ✕
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="observacion_hardware"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Observaciones Adicionales de Hardware
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe otros trabajos de hardware o detalles adicionales..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm">
                                Opcional: Agrega detalles que no estén en la
                                lista de arreglos comunes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {(form.watch("alcance") === "software" ||
                    form.watch("alcance") === "ambos") && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Trabajos de Software
                      </h3>

                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="arreglos_software"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Arreglos Comunes de Software
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    const current = field.value || [];
                                    if (!current.includes(value)) {
                                      field.onChange([...current, value]);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Selecciona arreglos realizados" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ARREGLOS_SOFTWARE.map((arreglo) => (
                                      <SelectItem key={arreglo} value={arreglo}>
                                        {arreglo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {field.value.map((arreglo) => (
                                    <Badge
                                      key={arreglo}
                                      variant="secondary"
                                      className="gap-1 pr-1"
                                    >
                                      {arreglo}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(
                                            field.value?.filter(
                                              (a) => a !== arreglo
                                            )
                                          );
                                        }}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        ✕
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="observacion_software"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Observaciones Adicionales de Software
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe otros trabajos de software o detalles adicionales..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm">
                                Opcional: Agrega detalles que no estén en la
                                lista de arreglos comunes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Personal Asignado */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      Personal Asignado
                    </h3>

                    <div className="space-y-6">
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
                                <SelectTrigger className="h-12 text-base">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(form.watch("alcance") === "hardware" ||
                        form.watch("alcance") === "ambos") && (
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
                                  <SelectTrigger className="h-12 text-base">
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
                      )}

                      {(form.watch("alcance") === "software" ||
                        form.watch("alcance") === "ambos") && (
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
                                  <SelectTrigger className="h-12 text-base">
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
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MODO CREAR: Stepper con pasos */}
              {/* PASO 0: Alcance del Mantenimiento */}
              {!isEditing && currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-3">
                      <div className="bg-orange-200 p-3 rounded-lg">
                        <Wrench className="h-6 w-6 text-orange-700" />
                      </div>
                      ¿Qué tipo de mantenimiento realizarás?
                    </h3>
                    <p className="text-sm text-orange-700 ml-14 mb-6">
                      Selecciona el alcance del servicio que se realizará
                    </p>

                    <FormField
                      control={form.control}
                      name="alcance"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormControl>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <button
                                type="button"
                                onClick={() => field.onChange("hardware")}
                                className={cn(
                                  "relative p-6 rounded-xl border-2 transition-all hover:scale-105",
                                  field.value === "hardware"
                                    ? "border-orange-600 bg-orange-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-orange-300"
                                )}
                              >
                                {field.value === "hardware" && (
                                  <div className="absolute top-3 right-3">
                                    <Check className="h-6 w-6 text-orange-600" />
                                  </div>
                                )}
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-4 rounded-full bg-blue-100">
                                    <Wrench className="h-8 w-8 text-blue-600" />
                                  </div>
                                  <h4 className="text-lg font-bold">
                                    Hardware
                                  </h4>
                                  <p className="text-sm text-gray-600 text-center">
                                    Mantenimiento físico del equipo
                                  </p>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => field.onChange("software")}
                                className={cn(
                                  "relative p-6 rounded-xl border-2 transition-all hover:scale-105",
                                  field.value === "software"
                                    ? "border-orange-600 bg-orange-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-orange-300"
                                )}
                              >
                                {field.value === "software" && (
                                  <div className="absolute top-3 right-3">
                                    <Check className="h-6 w-6 text-orange-600" />
                                  </div>
                                )}
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-4 rounded-full bg-green-100">
                                    <Package className="h-8 w-8 text-green-600" />
                                  </div>
                                  <h4 className="text-lg font-bold">
                                    Software
                                  </h4>
                                  <p className="text-sm text-gray-600 text-center">
                                    Configuración y programas
                                  </p>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => field.onChange("ambos")}
                                className={cn(
                                  "relative p-6 rounded-xl border-2 transition-all hover:scale-105",
                                  field.value === "ambos"
                                    ? "border-orange-600 bg-orange-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-orange-300"
                                )}
                              >
                                {field.value === "ambos" && (
                                  <div className="absolute top-3 right-3">
                                    <Check className="h-6 w-6 text-orange-600" />
                                  </div>
                                )}
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-4 rounded-full bg-purple-100">
                                    <Wrench className="h-8 w-8 text-purple-600" />
                                  </div>
                                  <h4 className="text-lg font-bold">Ambos</h4>
                                  <p className="text-sm text-gray-600 text-center">
                                    Hardware y Software
                                  </p>
                                </div>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* PASO 1: Información del Mantenimiento */}
              {!isEditing && currentStep === 1 && (
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

                    <div className="space-y-6">
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
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fecha_realizado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              Fecha de Realización *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                max={new Date().toISOString().split("T")[0]}
                                disabled={isSubmitting}
                                className="h-12 text-base"
                              />
                            </FormControl>
                            <FormDescription className="text-sm">
                              Fecha en la que se realizó el mantenimiento (no
                              puede ser futura)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Arreglos Realizados */}
              {!isEditing && currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      Trabajos Realizados
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Selecciona los arreglos comunes realizados
                    </p>

                    <div className="space-y-6">
                      {(form.watch("alcance") === "hardware" ||
                        form.watch("alcance") === "ambos") && (
                        <FormField
                          control={form.control}
                          name="arreglos_hardware"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Arreglos de Hardware
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    const current = field.value || [];
                                    if (!current.includes(value)) {
                                      field.onChange([...current, value]);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Selecciona arreglos realizados" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ARREGLOS_HARDWARE.map((arreglo) => (
                                      <SelectItem key={arreglo} value={arreglo}>
                                        {arreglo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {field.value.map((arreglo) => (
                                    <Badge
                                      key={arreglo}
                                      variant="secondary"
                                      className="gap-1 pr-1"
                                    >
                                      {arreglo}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(
                                            field.value?.filter(
                                              (a) => a !== arreglo
                                            )
                                          );
                                        }}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        ✕
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(form.watch("alcance") === "software" ||
                        form.watch("alcance") === "ambos") && (
                        <FormField
                          control={form.control}
                          name="arreglos_software"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Arreglos de Software
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    const current = field.value || [];
                                    if (!current.includes(value)) {
                                      field.onChange([...current, value]);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Selecciona arreglos realizados" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ARREGLOS_SOFTWARE.map((arreglo) => (
                                      <SelectItem key={arreglo} value={arreglo}>
                                        {arreglo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {field.value.map((arreglo) => (
                                    <Badge
                                      key={arreglo}
                                      variant="secondary"
                                      className="gap-1 pr-1"
                                    >
                                      {arreglo}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(
                                            field.value?.filter(
                                              (a) => a !== arreglo
                                            )
                                          );
                                        }}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        ✕
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Observaciones adicionales */}
                      <div className="space-y-6 pt-4 border-t">
                        {(form.watch("alcance") === "hardware" ||
                          form.watch("alcance") === "ambos") && (
                          <FormField
                            control={form.control}
                            name="observacion_hardware"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">
                                  Observaciones de Hardware
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe otros trabajos de hardware realizados o detalles adicionales..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-sm">
                                  Opcional: Agrega detalles adicionales sobre el
                                  mantenimiento de hardware
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {(form.watch("alcance") === "software" ||
                          form.watch("alcance") === "ambos") && (
                          <FormField
                            control={form.control}
                            name="observacion_software"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">
                                  Observaciones de Software
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe otros trabajos de software realizados o detalles adicionales..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-sm">
                                  Opcional: Agrega detalles adicionales sobre el
                                  mantenimiento de software
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: Asignación de Personal */}
              {!isEditing && currentStep === 3 && (
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

                    {(form.watch("alcance") === "hardware" ||
                      form.watch("alcance") === "ambos") && (
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
                    )}

                    {(form.watch("alcance") === "software" ||
                      form.watch("alcance") === "ambos") && (
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
                    )}
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
                          {form.watch("fecha_realizado")
                            ? new Date(
                                form.watch("fecha_realizado")
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
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
        <div className="border-t bg-white px-4 sm:px-8 lg:px-16 py-4 sm:py-6 flex-none">
          {isEditing ? (
            // Modo editar: Solo botones de cancelar y guardar
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-12 px-6 font-medium text-base"
              >
                Cancelar
              </Button>
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
                Actualizar Mantenimiento
              </Button>
            </div>
          ) : (
            // Modo crear: Navegación del stepper
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
                    Programar Mantenimiento
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
