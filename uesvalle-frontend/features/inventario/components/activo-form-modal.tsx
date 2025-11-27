"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Loader2,
  Package,
  Monitor,
  Tag,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
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
import {
  activosService,
  CreateActivoData,
  UpdateActivoData,
} from "../services/activos-service";
import { Activo } from "@/shared/types/inventario";
import { showToast } from "@/shared/lib/toast";
import toast from "react-hot-toast";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
}

// Schema de validación adaptado al backend
const activoFormSchema = z.object({
  serial: z.string().min(3, "El serial debe tener al menos 3 caracteres"),
  placa: z.string().min(1, "La placa es obligatoria"),
  tipo: z.enum(
    [
      "ACCESS POINT",
      "BIOMETRICO",
      "CAMARA",
      "CELULAR",
      "COMPUTADOR",
      "DISCO EXTERNO",
      "PATCHPANEL",
      "DVR",
      "ESCANER",
      "IMPRESORA",
      "IPAD",
      "MONITOR",
      "PLANTA TELEFONICA",
      "PORTATIL",
      "RACK",
      "ROUTER",
      "SERVIDOR",
      "SWITCH",
      "TABLET",
      "TELEFONO",
      "TELEVISOR",
      "TODO EN UNO",
      "UPS",
      "XVR",
      "VIDEO BEAM",
    ],
    { message: "Selecciona un tipo de activo" }
  ),
  marca: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
  modelo: z.string().min(2, "El modelo debe tener al menos 2 caracteres"),
  sede_id: z.number().min(1, "Selecciona una sede"),
  usuario_sysman_nombre: z.string().optional(),
  usuario_uso_nombre: z.string().optional(),
  estado: z.enum(["bueno", "regular", "malo", "mantenimiento", "baja"], {
    message: "Selecciona un estado",
  }),
  proceso: z.enum(
    [
      "DIRECCIONAMIENTO ESTRATEGICO",
      "PLANEACIÓN E INFORMACIÓN INSTITUCIONAL",
      "GESTIÓN DE CALIDAD",
      "AGUA PARA CONSUMO HUMANO Y SANEAMIENTO BÁSICO",
      "ALIMENTOS Y MEDICAMENTOS",
      "ESTABLECIMIENTO DE INTERÉS SANITARIO",
      "ZOONOSIS Y ENFERMEDADES DE TRANSMISIÓN VECTORIAL",
      "GESTIÓN FINANCIERA",
      "GESTIÓN DE RECURSOS FÍSICOS",
      "GESTIÓN DEL TALENTO HUMANO",
      "GESTIÓN INFORMÁTICA",
      "GESTIÓN DOCUMENTAL Y ATENCIÓN AL CIUDADANO",
      "GESTIÓN DE CONTRATACIÓN",
      "GESTIÓN JURÍDICA Y DISCIPLINARIA",
      "CONTROL INTERNO A LA GESTIÓN",
    ],
    {
      message: "Selecciona un proceso",
    }
  ),
  fecha_instalacion: z.string().optional(),
  // Especificaciones técnicas (solo para PC y Portátil)
  procesador: z.string().optional(),
  ram_gb: z.number().optional(),
  almacenamiento_gb: z.number().optional(),
  so: z.string().optional(),
  tipo_disco: z.enum(["SSD", "HDD", "NVME"]).optional(),
  velocidad_cpu_ghz: z.number().optional(),
  licencia: z.string().optional(),
});

type ActivoFormValues = z.infer<typeof activoFormSchema>;

interface ActivoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activo?: Activo | null;
  onSuccess: () => void;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Equipo",
    description: "Información del dispositivo",
    icon: Monitor,
  },
  {
    id: 2,
    title: "Identificación",
    description: "Placa y estado",
    icon: Tag,
  },
  {
    id: 3,
    title: "Ubicación",
    description: "Sede y asignación",
    icon: MapPin,
  },
];

export function ActivoFormModal({
  open,
  onOpenChange,
  activo,
  onSuccess,
}: ActivoFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isEditing = !!activo;

  const form = useForm<ActivoFormValues>({
    resolver: zodResolver(activoFormSchema),
    defaultValues: activo
      ? {
          serial: activo.serial,
          placa: activo.placa,
          tipo: activo.tipo,
          marca: activo.marca,
          modelo: activo.modelo,
          sede_id: activo.sede_id,
          usuario_sysman_nombre: activo.usuario_sysman_nombre || "",
          usuario_uso_nombre: activo.usuario_uso_nombre || "",
          estado: activo.estado.toLowerCase() as any,
          proceso: activo.proceso,
          fecha_instalacion: activo.fecha_instalacion || undefined,
          procesador: activo.especificaciones?.procesador || "",
          ram_gb: activo.especificaciones?.ram_gb || undefined,
          almacenamiento_gb:
            activo.especificaciones?.almacenamiento_gb || undefined,
          so: activo.especificaciones?.so || "",
          tipo_disco: (activo.especificaciones?.tipo_disco as any) || undefined,
          velocidad_cpu_ghz:
            activo.especificaciones?.velocidad_cpu_ghz || undefined,
          licencia: activo.especificaciones?.licencia || "",
        }
      : {
          serial: "",
          placa: "",
          tipo: "COMPUTADOR",
          marca: "",
          modelo: "",
          sede_id: 1,
          estado: "bueno",
          proceso: "GESTIÓN INFORMÁTICA",
          procesador: "",
          ram_gb: undefined,
          almacenamiento_gb: undefined,
          so: "",
          tipo_disco: undefined,
          velocidad_cpu_ghz: undefined,
          licencia: "",
        },
  });

  // Reset form when activo changes
  useEffect(() => {
    if (activo) {
      form.reset({
        serial: activo.serial,
        placa: activo.placa,
        tipo: activo.tipo,
        marca: activo.marca,
        modelo: activo.modelo,
        sede_id: activo.sede_id,
        usuario_sysman_nombre: activo.usuario_sysman_nombre || "",
        usuario_uso_nombre: activo.usuario_uso_nombre || "",
        estado: activo.estado.toLowerCase() as any,
        proceso: activo.proceso,
        fecha_instalacion: activo.fecha_instalacion || undefined,
        procesador: activo.especificaciones?.procesador || "",
        ram_gb: activo.especificaciones?.ram_gb || undefined,
        almacenamiento_gb:
          activo.especificaciones?.almacenamiento_gb || undefined,
        so: activo.especificaciones?.so || "",
        tipo_disco: (activo.especificaciones?.tipo_disco as any) || undefined,
        velocidad_cpu_ghz:
          activo.especificaciones?.velocidad_cpu_ghz || undefined,
        licencia: activo.especificaciones?.licencia || "",
      });
    } else {
      form.reset({
        serial: "",
        placa: "",
        tipo: "COMPUTADOR",
        marca: "",
        modelo: "",
        sede_id: 1,
        usuario_sysman_nombre: "",
        usuario_uso_nombre: "",
        estado: "bueno",
        proceso: "GESTIÓN INFORMÁTICA",
        fecha_instalacion: undefined,
        procesador: "",
        ram_gb: undefined,
        almacenamiento_gb: undefined,
        so: "",
        tipo_disco: undefined,
        velocidad_cpu_ghz: undefined,
        licencia: "",
      });
    }
    setCurrentStep(0);
  }, [activo, form, open]);

  const handleSubmit = async (data: ActivoFormValues) => {
    setIsSubmitting(true);

    // Mostrar toast de carga
    const loadingToast = showToast.loading(
      isEditing ? "Actualizando activo..." : "Creando activo..."
    );

    try {
      // El backend espera tipos y estados en MAYÚSCULAS
      const tipoUppercase = data.tipo.toUpperCase();
      const estadoUppercase = data.estado.toUpperCase();

      const payload = {
        serial: data.serial,
        placa: data.placa,
        tipo: tipoUppercase,
        marca: data.marca,
        modelo: data.modelo,
        sede_id: data.sede_id,
        usuario_sysman_nombre: data.usuario_sysman_nombre || "",
        usuario_uso_nombre: data.usuario_uso_nombre || "",
        estado: estadoUppercase,
        proceso: data.proceso,
        fecha_instalacion: data.fecha_instalacion || null,
      };

      if (isEditing && activo) {
        await activosService.updateActivo(
          activo.id,
          payload as UpdateActivoData
        );

        // Si es PC o Portátil y tiene especificaciones, actualizarlas
        const tipoUpper = data.tipo.toUpperCase();
        if (
          (tipoUpper === "COMPUTADOR" || tipoUpper === "PORTATIL") &&
          (data.procesador || data.ram_gb || data.almacenamiento_gb)
        ) {
          try {
            const especificaciones = {
              procesador: data.procesador || "",
              ram_gb: data.ram_gb || 0,
              almacenamiento_gb: data.almacenamiento_gb || 0,
              so: data.so || "",
              tipo_disco: data.tipo_disco || "SSD",
              velocidad_cpu_ghz: data.velocidad_cpu_ghz || 0,
              licencia: data.licencia || "",
            };

            const endpoint = tipoUpper === "COMPUTADOR" ? "pcs" : "portatiles";

            // Si ya tiene especificaciones, usar PATCH para actualizar
            if (activo.especificaciones) {
              // Obtener el ID de las especificaciones
              const especificacionesResponse = await fetch(
                `http://localhost:3000/${endpoint}/activo/${activo.id}`,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }
              );

              if (especificacionesResponse.ok) {
                const especificacionesData =
                  await especificacionesResponse.json();
                const especificacionId = especificacionesData.id;

                // Actualizar con PATCH
                const response = await fetch(
                  `http://localhost:3000/${endpoint}/${especificacionId}`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(especificaciones),
                  }
                );

                if (!response.ok) {
                  console.warn(
                    "No se pudieron actualizar las especificaciones técnicas"
                  );
                }
              }
            } else {
              // Si no tiene especificaciones, crear nuevas con POST
              const response = await fetch(
                `http://localhost:3000/${endpoint}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    activo_id: activo.id,
                    ...especificaciones,
                  }),
                }
              );

              if (!response.ok) {
                console.warn(
                  "No se pudieron crear las especificaciones técnicas"
                );
              }
            }
          } catch (error) {
            console.warn("Error al guardar especificaciones:", error);
          }
        }

        toast.dismiss(loadingToast);
        showToast.success("Activo actualizado correctamente");
      } else {
        const nuevoActivo = await activosService.createActivo(
          payload as CreateActivoData
        );

        // Si es PC o Portátil y tiene especificaciones, crearlas
        const tipoUpper = data.tipo.toUpperCase();
        if (
          (tipoUpper === "COMPUTADOR" || tipoUpper === "PORTATIL") &&
          (data.procesador || data.ram_gb || data.almacenamiento_gb)
        ) {
          try {
            const especificaciones = {
              activo_id: nuevoActivo.id,
              procesador: data.procesador || "",
              ram_gb: data.ram_gb || 0,
              almacenamiento_gb: data.almacenamiento_gb || 0,
              so: data.so || "",
              tipo_disco: data.tipo_disco || "SSD",
              velocidad_cpu_ghz: data.velocidad_cpu_ghz || 0,
              licencia: data.licencia || "",
            };

            const endpoint = tipoUpper === "COMPUTADOR" ? "pcs" : "portatiles";
            const response = await fetch(`http://localhost:3000/${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(especificaciones),
            });

            if (!response.ok) {
              console.warn(
                "No se pudieron guardar las especificaciones técnicas"
              );
            }
          } catch (error) {
            console.warn("Error al guardar especificaciones:", error);
          }
        }

        toast.dismiss(loadingToast);
        showToast.success("Activo creado exitosamente");
      }

      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.dismiss(loadingToast);

      // Log completo del error para debugging
      console.error("Error completo al guardar activo:", {
        error,
        message: error?.message,
        response: error?.response,
        stack: error?.stack,
      });

      // Manejar diferentes tipos de errores
      let errorMessage = "Error desconocido al guardar el activo";

      // Intentar obtener el mensaje del error
      if (error?.message) {
        const msg = error.message.toLowerCase();

        // Errores específicos del backend
        if (
          msg.includes("placa") &&
          (msg.includes("existe") ||
            msg.includes("ya existe") ||
            msg.includes("duplicate") ||
            msg.includes("unique"))
        ) {
          errorMessage = "Esta placa ya existe. Por favor usa una placa única.";
        } else if (
          msg.includes("serial") &&
          (msg.includes("existe") ||
            msg.includes("ya existe") ||
            msg.includes("duplicate") ||
            msg.includes("unique"))
        ) {
          errorMessage = "Este serial ya existe en el sistema.";
        } else if (
          msg.includes("obligatorio") ||
          msg.includes("requerido") ||
          msg.includes("required") ||
          msg.includes("cannot be null") ||
          msg.includes("must be")
        ) {
          errorMessage =
            "Por favor completa todos los campos obligatorios marcados con *.";
        } else if (
          msg.includes("token") ||
          msg.includes("autenticación") ||
          msg.includes("unauthorized") ||
          msg.includes("sesión")
        ) {
          errorMessage = "Sesión expirada. Por favor inicia sesión nuevamente.";
        } else if (
          msg.includes("network") ||
          msg.includes("fetch") ||
          msg.includes("conexión")
        ) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet.";
        } else if (msg.includes("error en la petición")) {
          // Si es el mensaje genérico del api-client, mostrar más detalles
          errorMessage = `Error del servidor. Por favor intenta nuevamente.`;
        } else {
          // Mostrar el mensaje original del error
          errorMessage = ` ${error.message}`;
        }
      } else if (error?.error) {
        // Si el error tiene una propiedad 'error'
        errorMessage = ` ${error.error}`;
      } else if (typeof error === "string") {
        // Si el error es un string
        errorMessage = ` ${error}`;
      }

      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ActivoFormValues)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["tipo", "marca", "modelo", "serial"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["placa", "estado"];
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

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "bueno":
        return "default";
      case "regular":
        return "secondary";
      case "malo":
        return "destructive";
      case "mantenimiento":
        return "outline";
      case "baja":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header limpio */}
        <div className="bg-white border-b px-4 sm:px-8 lg:px-16 py-4 sm:py-6 flex-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <span className="truncate">
                {isEditing ? "Editar Activo" : "Crear Nuevo Activo"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-xs sm:text-sm mt-2 ml-0 sm:ml-14">
              {isEditing
                ? "Modifica los datos del activo tecnológico"
                : "Completa la información en 3 pasos sencillos"}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper solo para crear (no para editar) */}
          {!isEditing && (
            <div className="mt-4 sm:mt-6 lg:mt-8 px-0 sm:px-8 lg:px-32">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center"
                    style={{ flex: index < steps.length - 1 ? 1 : "none" }}
                  >
                    {/* Paso */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all ${
                          index === currentStep
                            ? "bg-orange-600 text-white ring-2 sm:ring-4 ring-orange-100 scale-110"
                            : index < currentStep
                            ? "bg-orange-600 text-white"
                            : "bg-white border-2 border-gray-300 text-gray-500"
                        }`}
                      >
                        {index < currentStep ? (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p
                        className={`text-xs sm:text-sm font-medium mt-2 sm:mt-3 whitespace-nowrap ${
                          index === currentStep
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>

                    {/* Línea conectora */}
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 sm:mx-4 lg:mx-6 transition-all duration-500 ${
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
              {/* Modo Edición: Todo en una vista */}
              {isEditing ? (
                <div className="space-y-6">
                  {/* Información del Equipo */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-3">
                      <div className="bg-orange-200 p-2 rounded-lg">
                        <Monitor className="h-5 w-5 text-orange-700" />
                      </div>
                      Información del Dispositivo
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo */}
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Tipo de Activo *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isEditing}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[400px] overflow-y-auto">
                              <SelectItem value="ACCESS POINT">
                                Access Point
                              </SelectItem>
                              <SelectItem value="BIOMETRICO">
                                Biométrico
                              </SelectItem>
                              <SelectItem value="CAMARA">Cámara</SelectItem>
                              <SelectItem value="CELULAR">Celular</SelectItem>
                              <SelectItem value="COMPUTADOR">
                                Computador
                              </SelectItem>
                              <SelectItem value="DISCO EXTERNO">
                                Disco Externo
                              </SelectItem>
                              <SelectItem value="PATCHPANEL">
                                Patchpanel
                              </SelectItem>
                              <SelectItem value="DVR">DVR</SelectItem>
                              <SelectItem value="ESCANER">Escáner</SelectItem>
                              <SelectItem value="IMPRESORA">
                                Impresora
                              </SelectItem>
                              <SelectItem value="IPAD">iPad</SelectItem>
                              <SelectItem value="MONITOR">Monitor</SelectItem>
                              <SelectItem value="PLANTA TELEFONICA">
                                Planta Telefónica
                              </SelectItem>
                              <SelectItem value="PORTATIL">Portátil</SelectItem>
                              <SelectItem value="RACK">Rack</SelectItem>
                              <SelectItem value="ROUTER">Router</SelectItem>
                              <SelectItem value="SERVIDOR">Servidor</SelectItem>
                              <SelectItem value="SWITCH">Switch</SelectItem>
                              <SelectItem value="TABLET">Tablet</SelectItem>
                              <SelectItem value="TELEFONO">Teléfono</SelectItem>
                              <SelectItem value="TELEVISOR">
                                Televisor
                              </SelectItem>
                              <SelectItem value="TODO EN UNO">
                                Todo en Uno
                              </SelectItem>
                              <SelectItem value="UPS">UPS</SelectItem>
                              <SelectItem value="XVR">XVR</SelectItem>
                              <SelectItem value="VIDEO BEAM">
                                Video Beam
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Serial */}
                    <FormField
                      control={form.control}
                      name="serial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Número de Serie *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: ABC123456789"
                              className="h-12 text-base font-mono text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Marca */}
                    <FormField
                      control={form.control}
                      name="marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Marca *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: HP, Dell, Lenovo"
                              className="h-12 text-base text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Modelo */}
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Modelo *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: ProDesk 600"
                              className="h-12 text-base text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Placa */}
                    <FormField
                      control={form.control}
                      name="placa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Placa de Identificación *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: UESV-001"
                              className="font-mono text-lg h-12"
                              disabled={isEditing}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Estado */}
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Estado Físico *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bueno">Bueno</SelectItem>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="malo">Malo</SelectItem>
                              <SelectItem value="mantenimiento">
                                En Mantenimiento
                              </SelectItem>
                              <SelectItem value="baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <FormLabel className="text-base font-semibold">
                            Sede *
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Sede Principal</SelectItem>
                              <SelectItem value="2">Aro Sur</SelectItem>
                              <SelectItem value="3">Aro Cartago</SelectItem>
                              <SelectItem value="4">Aro Tulua</SelectItem>
                              <SelectItem value="5">Sede Yumbo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Proceso */}
                    <FormField
                      control={form.control}
                      name="proceso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Proceso *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[400px] overflow-y-auto">
                              <SelectItem value="DIRECCIONAMIENTO ESTRATEGICO">
                                Direccionamiento Estratégico
                              </SelectItem>
                              <SelectItem value="PLANEACIÓN E INFORMACIÓN INSTITUCIONAL">
                                Planeación e Información Institucional
                              </SelectItem>
                              <SelectItem value="GESTIÓN DE CALIDAD">
                                Gestión de Calidad
                              </SelectItem>
                              <SelectItem value="AGUA PARA CONSUMO HUMANO Y SANEAMIENTO BÁSICO">
                                Agua para Consumo Humano y Saneamiento Básico
                              </SelectItem>
                              <SelectItem value="ALIMENTOS Y MEDICAMENTOS">
                                Alimentos y Medicamentos
                              </SelectItem>
                              <SelectItem value="ESTABLECIMIENTO DE INTERÉS SANITARIO">
                                Establecimiento de Interés Sanitario
                              </SelectItem>
                              <SelectItem value="ZOONOSIS Y ENFERMEDADES DE TRANSMISIÓN VECTORIAL">
                                Zoonosis y Enfermedades de Transmisión Vectorial
                              </SelectItem>
                              <SelectItem value="GESTIÓN FINANCIERA">
                                Gestión Financiera
                              </SelectItem>
                              <SelectItem value="GESTIÓN DE RECURSOS FÍSICOS">
                                Gestión de Recursos Físicos
                              </SelectItem>
                              <SelectItem value="GESTIÓN DEL TALENTO HUMANO">
                                Gestión del Talento Humano
                              </SelectItem>
                              <SelectItem value="GESTIÓN INFORMÁTICA">
                                Gestión Informática
                              </SelectItem>
                              <SelectItem value="GESTIÓN DOCUMENTAL Y ATENCIÓN AL CIUDADANO">
                                Gestión Documental y Atención al Ciudadano
                              </SelectItem>
                              <SelectItem value="GESTIÓN DE CONTRATACIÓN">
                                Gestión de Contratación
                              </SelectItem>
                              <SelectItem value="GESTIÓN JURÍDICA Y DISCIPLINARIA">
                                Gestión Jurídica y Disciplinaria
                              </SelectItem>
                              <SelectItem value="CONTROL INTERNO A LA GESTIÓN">
                                Control Interno a la Gestión
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Usuario en Uso */}
                    <FormField
                      control={form.control}
                      name="usuario_uso_nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Usuario en Uso
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre del usuario"
                              className="h-12 text-base text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Usuario Sysman */}
                    <FormField
                      control={form.control}
                      name="usuario_sysman_nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            Usuario Sysman
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Responsable técnico"
                              className="h-12 text-base text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Fecha de Instalación */}
                    <FormField
                      control={form.control}
                      name="fecha_instalacion"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-semibold">
                            Fecha de Instalación
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-12 text-base text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Especificaciones Técnicas para PC/Portátil */}
                  {(form.watch("tipo") === "COMPUTADOR" ||
                    form.watch("tipo") === "PORTATIL") && (
                    <div className="mt-6">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
                        <h4 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-3">
                          <div className="bg-purple-200 p-2 rounded-lg">
                            <Monitor className="h-5 w-5 text-purple-700" />
                          </div>
                          Especificaciones Técnicas
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="procesador"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Procesador
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Intel Core i7-1255U"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ram_gb"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Memoria RAM (GB)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ej: 16"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : undefined
                                    )
                                  }
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="almacenamiento_gb"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Almacenamiento (GB)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ej: 512"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : undefined
                                    )
                                  }
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tipo_disco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Tipo de Disco
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                    <SelectValue placeholder="Selecciona el tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="SSD">
                                    SSD (Solid State Drive)
                                  </SelectItem>
                                  <SelectItem value="HDD">
                                    HDD (Hard Disk Drive)
                                  </SelectItem>
                                  <SelectItem value="NVME">
                                    NVMe (M.2 SSD)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="so"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Sistema Operativo
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Windows 11 Pro"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="velocidad_cpu_ghz"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Velocidad CPU (GHz)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Ej: 3.7"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : undefined
                                    )
                                  }
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licencia"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-base font-semibold">
                                Licencia de Software
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Windows 11 Pro - Licencia OEM"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Modo Crear: Con Stepper */}
                  {/* PASO 1: Información del Equipo */}
                  {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in-50 duration-300">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-3">
                          <div className="bg-orange-200 p-2 rounded-lg">
                            <Monitor className="h-5 w-5 text-orange-700" />
                          </div>
                          Información del Dispositivo
                        </h3>
                        <p className="text-sm text-orange-700 ml-11">
                          Ingresa los datos básicos del equipo tecnológico
                        </p>
                      </div>

                      {/* Tipo de Activo - Campo destacado */}
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <FormField
                          control={form.control}
                          name="tipo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg font-bold text-gray-900">
                                ¿Qué tipo de activo deseas registrar? *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-14 text-lg w-full text-gray-900 font-medium">
                                    <SelectValue placeholder="Selecciona el tipo de equipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[400px] overflow-y-auto">
                                  <SelectItem
                                    value="ACCESS POINT"
                                    className="text-base py-3"
                                  >
                                    Access Point
                                  </SelectItem>
                                  <SelectItem
                                    value="BIOMETRICO"
                                    className="text-base py-3"
                                  >
                                    Biométrico
                                  </SelectItem>
                                  <SelectItem
                                    value="CAMARA"
                                    className="text-base py-3"
                                  >
                                    Cámara
                                  </SelectItem>
                                  <SelectItem
                                    value="CELULAR"
                                    className="text-base py-3"
                                  >
                                    Celular
                                  </SelectItem>
                                  <SelectItem
                                    value="COMPUTADOR"
                                    className="text-base py-3"
                                  >
                                    Computador
                                  </SelectItem>
                                  <SelectItem
                                    value="DISCO EXTERNO"
                                    className="text-base py-3"
                                  >
                                    Disco Externo
                                  </SelectItem>
                                  <SelectItem
                                    value="PATCHPANEL"
                                    className="text-base py-3"
                                  >
                                    Patchpanel
                                  </SelectItem>
                                  <SelectItem
                                    value="DVR"
                                    className="text-base py-3"
                                  >
                                    DVR
                                  </SelectItem>
                                  <SelectItem
                                    value="ESCANER"
                                    className="text-base py-3"
                                  >
                                    Escáner
                                  </SelectItem>
                                  <SelectItem
                                    value="IMPRESORA"
                                    className="text-base py-3"
                                  >
                                    Impresora
                                  </SelectItem>
                                  <SelectItem
                                    value="IPAD"
                                    className="text-base py-3"
                                  >
                                    iPad
                                  </SelectItem>
                                  <SelectItem
                                    value="MONITOR"
                                    className="text-base py-3"
                                  >
                                    Monitor
                                  </SelectItem>
                                  <SelectItem
                                    value="PLANTA TELEFONICA"
                                    className="text-base py-3"
                                  >
                                    Planta Telefónica
                                  </SelectItem>
                                  <SelectItem
                                    value="PORTATIL"
                                    className="text-base py-3"
                                  >
                                    Portátil
                                  </SelectItem>
                                  <SelectItem
                                    value="RACK"
                                    className="text-base py-3"
                                  >
                                    Rack
                                  </SelectItem>
                                  <SelectItem
                                    value="ROUTER"
                                    className="text-base py-3"
                                  >
                                    Router
                                  </SelectItem>
                                  <SelectItem
                                    value="SERVIDOR"
                                    className="text-base py-3"
                                  >
                                    Servidor
                                  </SelectItem>
                                  <SelectItem
                                    value="SWITCH"
                                    className="text-base py-3"
                                  >
                                    Switch
                                  </SelectItem>
                                  <SelectItem
                                    value="TABLET"
                                    className="text-base py-3"
                                  >
                                    Tablet
                                  </SelectItem>
                                  <SelectItem
                                    value="TELEFONO"
                                    className="text-base py-3"
                                  >
                                    Teléfono
                                  </SelectItem>
                                  <SelectItem
                                    value="TELEVISOR"
                                    className="text-base py-3"
                                  >
                                    Televisor
                                  </SelectItem>
                                  <SelectItem
                                    value="TODO EN UNO"
                                    className="text-base py-3"
                                  >
                                    Todo en Uno
                                  </SelectItem>
                                  <SelectItem
                                    value="UPS"
                                    className="text-base py-3"
                                  >
                                    UPS
                                  </SelectItem>
                                  <SelectItem
                                    value="XVR"
                                    className="text-base py-3"
                                  >
                                    XVR
                                  </SelectItem>
                                  <SelectItem
                                    value="VIDEO BEAM"
                                    className="text-base py-3"
                                  >
                                    Video Beam
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-sm mt-2">
                                Selecciona la categoría que mejor describe el
                                equipo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Detalles del Equipo */}
                      <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-600" />
                          Detalles del Equipo
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="marca"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">
                                  Marca *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ej: HP, Dell, Lenovo"
                                    className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="modelo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">
                                  Modelo *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ej: ProDesk 600, ThinkPad E14"
                                    className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="serial"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Número de Serie *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: ABC123456789"
                                  className="h-12 text-base font-mono text-gray-900 placeholder:text-gray-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm">
                                Serial único del fabricante (generalmente en una
                                etiqueta del equipo)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* PASO 2: Identificación */}
                  {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in-50 slide-in-from-right-5 duration-300">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-3">
                          <div className="bg-orange-200 p-2 rounded-lg">
                            <Tag className="h-5 w-5 text-orange-700" />
                          </div>
                          Identificación y Estado
                        </h3>
                        <p className="text-sm text-orange-700 ml-11">
                          Asigna una placa única y define el estado físico del
                          activo
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="placa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Placa de Identificación *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: UESV-001, PC-2025-001, etc."
                                  {...field}
                                  className="font-mono text-lg h-12"
                                />
                              </FormControl>
                              <FormDescription className="text-sm mt-2">
                                Ingresa una placa única para identificar el
                                activo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Estado Físico del Activo *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                    <SelectValue placeholder="Selecciona un estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    value="bueno"
                                    className="text-base py-3"
                                  >
                                    Bueno
                                  </SelectItem>
                                  <SelectItem
                                    value="regular"
                                    className="text-base py-3"
                                  >
                                    Regular
                                  </SelectItem>
                                  <SelectItem
                                    value="malo"
                                    className="text-base py-3"
                                  >
                                    Malo
                                  </SelectItem>
                                  <SelectItem
                                    value="mantenimiento"
                                    className="text-base py-3"
                                  >
                                    En Mantenimiento
                                  </SelectItem>
                                  <SelectItem
                                    value="baja"
                                    className="text-base py-3"
                                  >
                                    Baja
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Preview del estado seleccionado */}
                        {form.watch("estado") && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">
                              Estado seleccionado:
                            </p>
                            <Badge
                              variant={
                                getEstadoBadgeVariant(
                                  form.watch("estado")
                                ) as any
                              }
                              className="text-sm"
                            >
                              {form.watch("estado").toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PASO 3: Asignación y Ubicación */}
                  {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in-50 slide-in-from-right-5 duration-300">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-3">
                          <div className="bg-orange-200 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-orange-700" />
                          </div>
                          Asignación y Ubicación
                        </h3>
                        <p className="text-sm text-orange-700 ml-11">
                          Define dónde se encuentra el activo y a qué proceso
                          está asignado
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="sede_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Sede de Ubicación *
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(Number(value))
                                }
                                defaultValue={String(field.value)}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                    <SelectValue placeholder="Selecciona una sede" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    value="1"
                                    className="text-base py-3"
                                  >
                                    Sede Principal
                                  </SelectItem>
                                  <SelectItem
                                    value="2"
                                    className="text-base py-3"
                                  >
                                    Aro Sur
                                  </SelectItem>
                                  <SelectItem
                                    value="3"
                                    className="text-base py-3"
                                  >
                                    Aro Cartago
                                  </SelectItem>
                                  <SelectItem
                                    value="4"
                                    className="text-base py-3"
                                  >
                                    Aro Tulua
                                  </SelectItem>
                                  <SelectItem
                                    value="5"
                                    className="text-base py-3"
                                  >
                                    Sede Yumbo
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="proceso"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Proceso o Departamento *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                    <SelectValue placeholder="Selecciona un proceso" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[400px] overflow-y-auto">
                                  <SelectItem
                                    value="DIRECCIONAMIENTO ESTRATEGICO"
                                    className="text-sm py-2"
                                  >
                                    Direccionamiento Estratégico
                                  </SelectItem>
                                  <SelectItem
                                    value="PLANEACIÓN E INFORMACIÓN INSTITUCIONAL"
                                    className="text-sm py-2"
                                  >
                                    Planeación e Información Institucional
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN DE CALIDAD"
                                    className="text-sm py-2"
                                  >
                                    Gestión de Calidad
                                  </SelectItem>
                                  <SelectItem
                                    value="AGUA PARA CONSUMO HUMANO Y SANEAMIENTO BÁSICO"
                                    className="text-sm py-2"
                                  >
                                    Agua para Consumo Humano y Saneamiento
                                    Básico
                                  </SelectItem>
                                  <SelectItem
                                    value="ALIMENTOS Y MEDICAMENTOS"
                                    className="text-sm py-2"
                                  >
                                    Alimentos y Medicamentos
                                  </SelectItem>
                                  <SelectItem
                                    value="ESTABLECIMIENTO DE INTERÉS SANITARIO"
                                    className="text-sm py-2"
                                  >
                                    Establecimiento de Interés Sanitario
                                  </SelectItem>
                                  <SelectItem
                                    value="ZOONOSIS Y ENFERMEDADES DE TRANSMISIÓN VECTORIAL"
                                    className="text-sm py-2"
                                  >
                                    Zoonosis y Enfermedades de Transmisión
                                    Vectorial
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN FINANCIERA"
                                    className="text-sm py-2"
                                  >
                                    Gestión Financiera
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN DE RECURSOS FÍSICOS"
                                    className="text-sm py-2"
                                  >
                                    Gestión de Recursos Físicos
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN DEL TALENTO HUMANO"
                                    className="text-sm py-2"
                                  >
                                    Gestión del Talento Humano
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN INFORMÁTICA"
                                    className="text-sm py-2"
                                  >
                                    Gestión Informática
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN DOCUMENTAL Y ATENCIÓN AL CIUDADANO"
                                    className="text-sm py-2"
                                  >
                                    Gestión Documental y Atención al Ciudadano
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN DE CONTRATACIÓN"
                                    className="text-sm py-2"
                                  >
                                    Gestión de Contratación
                                  </SelectItem>
                                  <SelectItem
                                    value="GESTIÓN JURÍDICA Y DISCIPLINARIA"
                                    className="text-sm py-2"
                                  >
                                    Gestión Jurídica y Disciplinaria
                                  </SelectItem>
                                  <SelectItem
                                    value="CONTROL INTERNO A LA GESTIÓN"
                                    className="text-sm py-2"
                                  >
                                    Control Interno a la Gestión
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-sm mt-2">
                                Departamento o área donde está asignado el
                                activo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="usuario_uso_nombre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Usuario en Uso (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre del usuario que usa el equipo"
                                  className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm mt-2">
                                Persona que utiliza el activo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="usuario_sysman_nombre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Usuario Sysman (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre del responsable técnico"
                                  className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm mt-2">
                                Responsable técnico del activo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fecha_instalacion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">
                                Fecha de Instalación (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  className="h-12 text-base text-gray-900"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm mt-2">
                                Fecha y hora de instalación del activo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Especificaciones Técnicas - Solo para PC y Portátil */}
                        {(form.watch("tipo") === "COMPUTADOR" ||
                          form.watch("tipo") === "PORTATIL") && (
                          <>
                            <div className="pt-6 mt-6 border-t-2 border-gray-200">
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
                                <h4 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-3">
                                  <div className="bg-purple-200 p-2 rounded-lg">
                                    <Monitor className="h-5 w-5 text-purple-700" />
                                  </div>
                                  Especificaciones Técnicas
                                </h4>
                                <p className="text-sm text-purple-700 ml-11">
                                  Detalles de hardware y software del equipo
                                  (opcional pero recomendado)
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="procesador"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base font-semibold">
                                        Procesador
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Ej: Intel Core i7-1255U"
                                          className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="ram_gb"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base font-semibold">
                                        Memoria RAM (GB)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Ej: 16"
                                          className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                            )
                                          }
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="almacenamiento_gb"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base font-semibold">
                                        Almacenamiento (GB)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Ej: 512"
                                          className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                            )
                                          }
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="tipo_disco"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base font-semibold">
                                        Tipo de Disco
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-12 text-base w-full text-gray-900">
                                            <SelectValue placeholder="Selecciona el tipo" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem
                                            value="SSD"
                                            className="text-base py-3"
                                          >
                                            SSD (Solid State Drive)
                                          </SelectItem>
                                          <SelectItem
                                            value="HDD"
                                            className="text-base py-3"
                                          >
                                            HDD (Hard Disk Drive)
                                          </SelectItem>
                                          <SelectItem
                                            value="NVME"
                                            className="text-base py-3"
                                          >
                                            NVMe (M.2 SSD)
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="so"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base font-semibold">
                                        Sistema Operativo
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Ej: Windows 11 Pro"
                                          className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="velocidad_cpu_ghz"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base font-semibold">
                                        Velocidad CPU (GHz)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          placeholder="Ej: 3.7"
                                          className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                            )
                                          }
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="licencia"
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel className="text-base font-semibold">
                                        Licencia de Software
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Ej: Windows 11 Pro - Licencia OEM"
                                          className="h-12 text-base text-gray-900 placeholder:text-gray-400"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormDescription className="text-sm mt-2">
                                        Información sobre la licencia del
                                        sistema operativo o software instalado
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Resumen antes de enviar */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 space-y-4 shadow-sm">
                        <h4 className="text-base sm:text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                          📋 Resumen del Activo
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Tipo:
                            </span>
                            <p className="text-base font-semibold capitalize mt-1">
                              {form.watch("tipo")}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Marca:
                            </span>
                            <p className="text-base font-semibold mt-1">
                              {form.watch("marca")}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Placa:
                            </span>
                            <p className="text-base font-semibold font-mono mt-1">
                              {form.watch("placa")}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-600 font-medium">
                              Estado:
                            </span>
                            <Badge
                              variant={
                                getEstadoBadgeVariant(
                                  form.watch("estado")
                                ) as any
                              }
                              className="mt-2 text-sm px-3 py-1"
                            >
                              {form.watch("estado")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>
          </Form>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t bg-white px-4 sm:px-8 lg:px-16 py-4 sm:py-6 flex-none">
          {isEditing ? (
            /* Botones para modo edición */
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-12 px-6 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSubmitting}
                className="h-12 px-8 font-medium bg-green-600 hover:bg-green-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!isSubmitting && <Check className="mr-2 h-4 w-4" />}
                Actualizar Activo
              </Button>
            </div>
          ) : (
            /* Botones para modo crear con stepper */
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between">
              <div className="flex gap-2 order-2 sm:order-1">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="h-10 sm:h-12 px-4 sm:px-6 font-medium text-sm sm:text-base flex-1 sm:flex-none"
                  >
                    <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Atrás</span>
                  </Button>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-10 sm:h-12 px-4 sm:px-6 font-medium text-sm sm:text-base flex-1 sm:flex-none"
                >
                  Cancelar
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-10 sm:h-12 px-4 sm:px-8 font-medium text-sm sm:text-base bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 flex-1 sm:flex-none"
                  >
                    Siguiente
                    <ChevronRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={isSubmitting}
                    className="h-10 sm:h-12 px-4 sm:px-8 font-medium text-sm sm:text-base bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 flex-1 sm:flex-none"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    )}
                    {!isSubmitting && (
                      <Check className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="hidden sm:inline">Crear Activo</span>
                    <span className="sm:hidden">Crear</span>
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
