"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface CrearPlanificacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ano: number;
  onConfirm: (
    meses: Array<{ mes: number; planificados: number; realizados: number }>
  ) => void;
}

export function CrearPlanificacionModal({
  open,
  onOpenChange,
  ano,
  onConfirm,
}: CrearPlanificacionModalProps) {
  const [planificados, setPlanificados] = useState<number[]>(Array(12).fill(0));

  const handlePlanificadoChange = (index: number, value: string) => {
    const newPlanificados = [...planificados];
    newPlanificados[index] = Math.max(0, parseInt(value) || 0);
    setPlanificados(newPlanificados);
  };

  const handleConfirm = () => {
    const meses = planificados.map((planificado, index) => ({
      mes: index + 1,
      planificados: planificado,
      realizados: 0,
    }));
    onConfirm(meses);
  };

  const totalPlanificados = planificados.reduce((sum, val) => sum + val, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Planificación {ano}</DialogTitle>
          <DialogDescription>
            Ingresa la cantidad de mantenimientos planificados para cada mes.
            Los realizados se incrementarán automáticamente al completar
            mantenimientos.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {MESES.map((mes, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <Label htmlFor={`mes-${index}`} className="font-medium w-32">
                  {mes}
                </Label>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`mes-${index}`}
                    className="text-sm text-muted-foreground"
                  >
                    Planificados:
                  </Label>
                  <Input
                    id={`mes-${index}`}
                    type="number"
                    min="0"
                    value={planificados[index]}
                    onChange={(e) =>
                      handlePlanificadoChange(index, e.target.value)
                    }
                    className="w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-medium">Total Planificados:</span>
          <span className="text-2xl font-bold">{totalPlanificados}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Crear Planificación</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
