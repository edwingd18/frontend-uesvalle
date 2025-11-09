import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
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
import { Badge } from "@/components/ui/badge"

const ESTADOS_ACTIVO = [
  { value: "bueno", label: "Bueno", color: "bg-green-100 text-green-800" },
  { value: "regular", label: "Regular", color: "bg-orange-100 text-orange-800" },
  { value: "malo", label: "Malo", color: "bg-red-100 text-red-800" },
  { value: "mantenimiento", label: "En Mantenimiento", color: "bg-sky-100 text-sky-800" },
  { value: "baja", label: "Dado de Baja", color: "bg-slate-100 text-slate-800" },
]

interface EstadoFieldProps {
  form: UseFormReturn<any>
}

export function EstadoField({ form }: EstadoFieldProps) {
  const selectedValue = form.watch('estado')
  const selectedEstado = ESTADOS_ACTIVO.find(e => e.value === selectedValue)

  return (
    <FormField
      control={form.control}
      name="estado"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Estado *
            {selectedEstado && (
              <Badge className={`${selectedEstado.color} text-xs`}>
                {selectedEstado.label}
              </Badge>
            )}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={form.formState.errors.estado ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {ESTADOS_ACTIVO.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${estado.color.split(' ')[0]}`} />
                    {estado.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}