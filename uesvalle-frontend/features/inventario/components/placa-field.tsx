import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RefreshCw } from "lucide-react"

interface PlacaFieldProps {
  form: UseFormReturn<any>
  canGenerate?: boolean
  onGenerate?: () => void
}

export function PlacaField({ form, canGenerate = false, onGenerate }: PlacaFieldProps) {
  return (
    <FormField
      control={form.control}
      name="placa"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Placa Institucional *</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input
                placeholder="UESV-PC-2024-001"
                {...field}
                className={form.formState.errors.placa ? "border-red-500" : ""}
              />
              {canGenerate && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onGenerate}
                  disabled={!form.getValues('tipo')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </FormControl>
          <FormDescription>
            Formato: UESV-TIPO-AÑO-CONSECUTIVO
            {canGenerate && " • Se genera automáticamente al seleccionar tipo"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}