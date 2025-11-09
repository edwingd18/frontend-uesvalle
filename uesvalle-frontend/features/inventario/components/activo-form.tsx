"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { z } from "zod"
import { useState } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Componentes modulares
import { FormSection } from "./form-section"
import { TipoActivoField } from "./tipo-activo-field"
import { PlacaField } from "./placa-field"
import { SedeField } from "./sede-field"
import { EstadoField } from "./estado-field"

// Schema de validación con mensajes en español
const ActivoFormSchema = z.object({
  placa: z.string().min(1, "La placa es obligatoria")
    .regex(/^UESV-[A-Z]+-\d{4}-\d+$/, "Formato: UESV-TIPO-AÑO-CONSECUTIVO"),

  tipo: z.enum([
    'computador', 'portatil', 'tablet', 'impresora',
    'router', 'switch', 'servidor', 'ups', 'monitor'
  ], { message: "Selecciona un tipo de activo" }),

  marca: z.string().min(1, "La marca es obligatoria")
    .min(2, "La marca debe tener al menos 2 caracteres"),

  modelo: z.string().min(1, "El modelo es obligatorio")
    .min(2, "El modelo debe tener al menos 2 caracteres"),

  serial: z.string().min(1, "El serial es obligatorio")
    .min(3, "El serial debe tener al menos 3 caracteres"),

  estado: z.enum(['bueno', 'regular', 'malo', 'mantenimiento', 'baja'], {
    message: "Selecciona un estado"
  }),

  responsable: z.string().min(1, "El responsable es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  sede: z.enum([
    'Sede Principal', 'Aro Sur', 'Aro Cartago', 'Aro Tulua', 'Sede Yumbo'
  ], { message: "Selecciona una sede" }),

  valor: z.number().min(1, "El valor debe ser mayor a $1")
    .max(999999999, "El valor es demasiado alto"),

  garantiaHasta: z.string().optional(),
})

type ActivoFormValues = z.infer<typeof ActivoFormSchema>

interface ActivoFormProps {
  defaultValues?: Partial<ActivoFormValues>
  onSubmit: (data: ActivoFormValues) => Promise<void>
  isEditing?: boolean
}

export function ActivoForm({ defaultValues, onSubmit, isEditing = false }: ActivoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ActivoFormValues>({
    resolver: zodResolver(ActivoFormSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      serial: "",
      responsable: "",
      valor: 0,
      garantiaHasta: "",
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: ActivoFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)

      if (!isEditing) {
        form.reset()
      }

      toast.success(
        isEditing
          ? "Activo actualizado correctamente"
          : "Activo creado exitosamente",
        {
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 4000,
        }
      )
    } catch (error) {
      toast.error("Error al guardar el activo", {
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePlaca = () => {
    const tipo = form.getValues('tipo')
    if (!tipo) return

    const year = new Date().getFullYear()
    const consecutive = Math.floor(Math.random() * 999) + 1
    const tipoMap: Record<string, string> = {
      computador: 'PC',
      portatil: 'LAP',
      tablet: 'TAB',
      impresora: 'IMP',
      router: 'RTR',
      switch: 'SW',
      servidor: 'SRV',
      ups: 'UPS',
      monitor: 'MON'
    }
    const newPlaca = `UESV-${tipoMap[tipo] || 'GEN'}-${year}-${consecutive.toString().padStart(3, '0')}`
    form.setValue('placa', newPlaca)
  }

  const handleTipoChange = (tipo: string) => {
    if (!form.getValues('placa') && tipo) {
      generatePlaca()
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? "Editar Activo" : "Registrar Nuevo Activo"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica los datos del activo tecnológico"
            : "Completa la información del nuevo activo tecnológico"
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Información básica */}
            <FormSection
              title="Información Básica"
              description="Datos técnicos del activo"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TipoActivoField form={form} onTipoChange={handleTipoChange} />

                <PlacaField
                  form={form}
                  canGenerate={true}
                  onGenerate={generatePlaca}
                />

                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="HP, Dell, Lenovo..."
                          {...field}
                          className={form.formState.errors.marca ? "border-red-500" : ""}
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
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ProDesk 600, ThinkPad E14..."
                          {...field}
                          className={form.formState.errors.modelo ? "border-red-500" : ""}
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
                      <FormLabel>Número de Serie *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC123456789"
                          {...field}
                          className={form.formState.errors.serial ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Serial único del fabricante
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <EstadoField form={form} />
              </div>
            </FormSection>

            {/* Información de asignación */}
            <FormSection
              title="Asignación"
              description="Responsable y ubicación del activo"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del responsable"
                          {...field}
                          className={form.formState.errors.responsable ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Persona a cargo del activo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SedeField form={form} />
              </div>
            </FormSection>

            {/* Información financiera */}
            <FormSection
              title="Información Financiera"
              description="Costos y garantía"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Adquisición (COP) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1500000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={form.formState.errors.valor ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor en pesos colombianos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="garantiaHasta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garantía Hasta</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={form.formState.errors.garantiaHasta ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Fecha de vencimiento de garantía (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Botones de acción */}
            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Actualizar Activo" : "Crear Activo"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}