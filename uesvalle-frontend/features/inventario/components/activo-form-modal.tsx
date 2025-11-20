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

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
}

// Schema de validación adaptado al backend
const activoFormSchema = z.object({
  serial: z.string().min(3, "El serial debe tener al menos 3 caracteres"),
  placa: z
    .string()
    .min(1, "La placa es obligatoria")
    .regex(/^UESV-[A-Z]+-\d{4}-\d+$/, "Formato: UESV-TIPO-AÑO-CONSECUTIVO"),
  tipo: z.enum(
    [
      "computador",
      "portatil",
      "tablet",
      "impresora",
      "router",
      "switch",
      "servidor",
      "ups",
      "monitor",
    ],
    { message: "Selecciona un tipo de activo" }
  ),
  marca: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
  modelo: z.string().min(2, "El modelo debe tener al menos 2 caracteres"),
  sede_id: z.number().min(1, "Selecciona una sede"),
  estado: z.enum(["bueno", "regular", "malo", "mantenimiento", "baja"], {
    message: "Selecciona un estado",
  }),
  proceso: z.enum(
    [
      "sistemas",
      "contabilidad",
      "administracion",
      "gerencia",
      "juridica",
      "financiera",
      "tecnica",
    ],
    {
      message: "Selecciona un proceso",
    }
  ),
  // Especificaciones técnicas (solo para PC y Portátil)
  procesador: z.string().optional(),
  ram_gb: z.number().optional(),
  almacenamiento_gb: z.number().optional(),
  so: z.string().optional(),
  tipo_disco: z.enum(["SSD", "HDD", "Híbrido"]).optional(),
  velocidad_cpu_ghz: z.number().optional(),
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
          tipo: activo.tipo.toLowerCase() as any,
          marca: activo.marca,
          modelo: activo.modelo,
          sede_id: activo.sede_id,
          estado: activo.estado.toLowerCase() as any,
          proceso: activo.proceso,
          procesador: undefined,
          ram_gb: undefined,
          almacenamiento_gb: undefined,
          so: undefined,
          tipo_disco: undefined,
          velocidad_cpu_ghz: undefined,
        }
      : {
          serial: "",
          placa: "",
          tipo: "computador",
          marca: "",
          modelo: "",
          sede_id: 1,
          estado: "bueno",
          proceso: "sistemas",
          procesador: "",
          ram_gb: undefined,
          almacenamiento_gb: undefined,
          so: "",
          tipo_disco: undefined,
          velocidad_cpu_ghz: undefined,
        },
  });

  // Reset form when activo changes
  useEffect(() => {
    if (activo) {
      form.reset({
        serial: activo.serial,
        placa: activo.placa,
        tipo: activo.tipo.toLowerCase() as any,
        marca: activo.marca,
        modelo: activo.modelo,
        sede_id: activo.sede_id,
        estado: activo.estado.toLowerCase() as any,
        proceso: activo.proceso,
        procesador: undefined,
        ram_gb: undefined,
        almacenamiento_gb: undefined,
        so: undefined,
        tipo_disco: undefined,
        velocidad_cpu_ghz: undefined,
      });
    } else {
      form.reset({
        serial: "",
        placa: "",
        tipo: "computador",
        marca: "",
        modelo: "",
        sede_id: 1,
        estado: "bueno",
        proceso: "sistemas",
        procesador: "",
        ram_gb: undefined,
        almacenamiento_gb: undefined,
        so: "",
        tipo_disco: undefined,
        velocidad_cpu_ghz: undefined,
      });
    }
    setCurrentStep(0);
  }, [activo, form, open]);

  const handleSubmit = async (data: ActivoFormValues) => {
    setIsSubmitting(true);
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
        estado: estadoUppercase,
        proceso: data.proceso,
      };

      if (isEditing && activo) {
        await activosService.updateActivo(
          activo.id,
          payload as UpdateActivoData
        );

        // Si es PC o Portátil y tiene especificaciones, actualizarlas
        if (
          (data.tipo === "computador" || data.tipo === "portatil") &&
          (data.procesador || data.ram_gb || data.almacenamiento_gb)
        ) {
          const especificaciones = {
            activo_id: activo.id,
            procesador: data.procesador || "",
            ram_gb: data.ram_gb || 0,
            almacenamiento_gb: data.almacenamiento_gb || 0,
            so: data.so || "",
            tipo_disco: data.tipo_disco || "SSD",
            velocidad_cpu_ghz: data.velocidad_cpu_ghz || 0,
          };

          const endpoint = data.tipo === "computador" ? "pcs" : "portatiles";
          await fetch(`http://localhost:3000/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(especificaciones),
          });
        }

        showToast.success("Activo actualizado correctamente");
      } else {
        const nuevoActivo = await activosService.createActivo(
          payload as CreateActivoData
        );

        // Si es PC o Portátil y tiene especificaciones, crearlas
        if (
          (data.tipo === "computador" || data.tipo === "portatil") &&
          (data.procesador || data.ram_gb || data.almacenamiento_gb)
        ) {
          const especificaciones = {
            activo_id: nuevoActivo.id,
            procesador: data.procesador || "",
            ram_gb: data.ram_gb || 0,
            almacenamiento_gb: data.almacenamiento_gb || 0,
            so: data.so || "",
            tipo_disco: data.tipo_disco || "SSD",
            velocidad_cpu_ghz: data.velocidad_cpu_ghz || 0,
          };

          const endpoint = data.tipo === "computador" ? "pcs" : "portatiles";
          await fetch(`http://localhost:3000/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(especificaciones),
          });
        }

        showToast.success("Activo creado exitosamente");
      }

      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error completo activo:", error);
      showToast.error(
        error instanceof Error ? error.message : "Error al guardar el activo"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePlaca = () => {
    const tipo = form.getValues("tipo");
    if (!tipo) return;

    const year = new Date().getFullYear();
    const consecutive = Math.floor(Math.random() * 999) + 1;
    const tipoMap: Record<string, string> = {
      computador: "PC",
      portatil: "LAP",
      tablet: "TAB",
      impresora: "IMP",
      router: "RTR",
      switch: "SW",
      servidor: "SRV",
      ups: "UPS",
      monitor: "MON",
    };
    const newPlaca = `UESV-${tipoMap[tipo] || "GEN"}-${year}-${consecutive
      .toString()
      .padStart(3, "0")}`;
    form.setValue("placa", newPlaca);
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
      <DialogContent className="!max-w-[1600px] w-[96vw] max-h-[92vh] p-0 gap-0 overflow-hidden sm:!max-w-[1600px]">
        {/* Header limpio */}
        <div className="bg-white border-b px-16 py-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              {isEditing ? "Editar Activo" : "Crear Nuevo Activo"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm mt-2 ml-14">
              {isEditing
                ? "Modifica los datos del activo tecnológico"
                : "Completa la información en 3 pasos sencillos"}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper mejorado con líneas separadas */}
          <div className="mt-8 px-32">
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

                  {/* Línea conectora */}
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
              {/* PASO 1: Información del Equipo */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-orange-600" />
                      Información del Dispositivo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ingresa los datos básicos del equipo tecnológico
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-16 gap-y-7">
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
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base w-full">
                                <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              <SelectItem value="computador">
                                Computador de Escritorio
                              </SelectItem>
                              <SelectItem value="portatil">Portátil</SelectItem>
                              <SelectItem value="tablet">Tablet</SelectItem>
                              <SelectItem value="impresora">
                                Impresora
                              </SelectItem>
                              <SelectItem value="router">Router</SelectItem>
                              <SelectItem value="switch">Switch</SelectItem>
                              <SelectItem value="servidor">Servidor</SelectItem>
                              <SelectItem value="ups">UPS</SelectItem>
                              <SelectItem value="monitor">Monitor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              placeholder="HP, Dell, Lenovo..."
                              className="h-12 text-base"
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
                              placeholder="ProDesk 600, ThinkPad E14..."
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              placeholder="ABC123456789"
                              className="h-12 text-base font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm">
                            Serial único del fabricante
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
                          <div className="flex gap-3">
                            <FormControl>
                              <Input
                                placeholder="UESV-PC-2025-001"
                                {...field}
                                className="font-mono text-lg h-12"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={generatePlaca}
                              disabled={isEditing}
                              className="whitespace-nowrap h-12 px-6"
                            >
                              <Tag className="mr-2 h-4 w-4" />
                              Generar
                            </Button>
                          </div>
                          <FormDescription className="text-sm mt-2">
                            Formato: UESV-TIPO-AÑO-CONSECUTIVO
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
                              <SelectTrigger className="h-12 text-base w-full">
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
                            getEstadoBadgeVariant(form.watch("estado")) as any
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
                      Define dónde se encuentra el activo y a qué proceso está
                      asignado
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
                              <SelectTrigger className="h-12 text-base w-full">
                                <SelectValue placeholder="Selecciona una sede" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1" className="text-base py-3">
                                Sede Principal
                              </SelectItem>
                              <SelectItem value="2" className="text-base py-3">
                                Aro Sur
                              </SelectItem>
                              <SelectItem value="3" className="text-base py-3">
                                Aro Cartago
                              </SelectItem>
                              <SelectItem value="4" className="text-base py-3">
                                Aro Tulua
                              </SelectItem>
                              <SelectItem value="5" className="text-base py-3">
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
                              <SelectTrigger className="h-12 text-base w-full">
                                <SelectValue placeholder="Selecciona un proceso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="sistemas"
                                className="text-base py-3"
                              >
                                Sistemas
                              </SelectItem>
                              <SelectItem
                                value="contabilidad"
                                className="text-base py-3"
                              >
                                Contabilidad
                              </SelectItem>
                              <SelectItem
                                value="administracion"
                                className="text-base py-3"
                              >
                                Administración
                              </SelectItem>
                              <SelectItem
                                value="gerencia"
                                className="text-base py-3"
                              >
                                Gerencia
                              </SelectItem>
                              <SelectItem
                                value="juridica"
                                className="text-base py-3"
                              >
                                Jurídica
                              </SelectItem>
                              <SelectItem
                                value="financiera"
                                className="text-base py-3"
                              >
                                Financiera
                              </SelectItem>
                              <SelectItem
                                value="tecnica"
                                className="text-base py-3"
                              >
                                Técnica
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm mt-2">
                            Departamento o área donde está asignado el activo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Especificaciones Técnicas - Solo para PC y Portátil */}
                    {(form.watch("tipo") === "computador" ||
                      form.watch("tipo") === "portatil") && (
                      <>
                        <div className="pt-6 border-t">
                          <h4 className="text-base font-semibold mb-4 text-gray-900">
                            Especificaciones Técnicas (Opcional)
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="procesador"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Procesador</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Intel Core i7-1255U"
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
                                  <FormLabel>RAM (GB)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="16"
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
                                  <FormLabel>Almacenamiento (GB)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="512"
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
                                  <FormLabel>Tipo de Disco</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="SSD">SSD</SelectItem>
                                      <SelectItem value="HDD">HDD</SelectItem>
                                      <SelectItem value="Híbrido">
                                        Híbrido
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
                                  <FormLabel>Sistema Operativo</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Windows 11 Pro"
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
                                  <FormLabel>Velocidad CPU (GHz)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      placeholder="3.7"
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
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Resumen antes de enviar */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      📋 Resumen del Activo
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
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
                            getEstadoBadgeVariant(form.watch("estado")) as any
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
                  {isEditing ? "Actualizar Activo" : "Crear Activo"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
