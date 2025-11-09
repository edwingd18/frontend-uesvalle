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

const SEDES_UESVALLE = [
  "Sede Principal",
  "Aro Sur",
  "Aro Cartago",
  "Aro Tulua",
  "Sede Yumbo"
]

interface SedeFieldProps {
  form: UseFormReturn<any>
}

export function SedeField({ form }: SedeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="sede"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sede *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={form.formState.errors.sede ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona la sede" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {SEDES_UESVALLE.map((sede) => (
                <SelectItem key={sede} value={sede}>
                  {sede}
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