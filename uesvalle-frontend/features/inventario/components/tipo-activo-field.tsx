import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TIPOS_ACTIVOS = [
  { value: "computador", label: "Computador" },
  { value: "portatil", label: "Portátil" },
  { value: "tablet", label: "Tablet" },
  { value: "impresora", label: "Impresora" },
  { value: "router", label: "Router" },
  { value: "switch", label: "Switch" },
  { value: "servidor", label: "Servidor" },
  { value: "ups", label: "UPS" },
  { value: "monitor", label: "Monitor" },
]

interface TipoActivoFieldProps {
  form: UseFormReturn<any>
  onTipoChange?: (tipo: string) => void
}

export function TipoActivoField({ form, onTipoChange }: TipoActivoFieldProps) {
  return (
    <FormField
      control={form.control}
      name="tipo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Activo *</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value)
              onTipoChange?.(value)
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className={form.formState.errors.tipo ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {TIPOS_ACTIVOS.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Tipo de equipo tecnológico
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}