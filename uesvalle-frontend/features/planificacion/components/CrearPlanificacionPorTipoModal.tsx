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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const TIPOS_ACTIVO = [
  { value: "ACCESS POINT", label: "Access Point" },
  { value: "BIOMETRICO", label: "Biométrico" },
  { value: "CAMARA", label: "Cámara" },
  { value: "CELULAR", label: "Celular" },
  { value: "COMPUTADOR", label: "Computador" },
  { value: "DISCO EXTERNO", label: "Disco Externo" },
  { value: "PATCHPANEL", label: "Patchpanel" },
  { value: "DVR", label: "DVR" },
  { value: "ESCANER", label: "Escáner" },
  { value: "IMPRESORA", label: "Impresora" },
  { value: "IPAD", label: "iPad" },
  { value: "MONITOR", label: "Monitor" },
  { value: "PLANTA TELEFONICA", label: "Planta Telefónica" },
  { value: "PORTATIL", label: "Portátil" },
  { value: "RACK", label: "Rack" },
  { value: "ROUTER", label: "Router" },
  { value: "SERVIDOR", label: "Servidor" },
  { value: "SWITCH", label: "Switch" },
  { value: "TABLET", label: "Tablet" },
  { value: "TELEFONO", label: "Teléfono" },
  { value: "TELEVISOR", label: "Televisor" },
  { value: "TODO EN UNO", label: "Todo en Uno" },
  { value: "UPS", label: "UPS" },
  { value: "XVR", label: "XVR" },
  { value: "VIDEO BEAM", label: "Video Beam" },
];

interface CrearPlanificacionPorTipoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ano: number;
  onConfirm: (planificacion: any) => void;
}

export function CrearPlanificacionPorTipoModal({
  open,
  onOpenChange,
  ano,
  onConfirm,
}: CrearPlanificacionPorTipoModalProps) {
  // Estado: [mes][tipo] = cantidad
  const [planificacion, setPlanificacion] = useState<
    Record<number, Record<string, number>>
  >(() => {
    const initial: Record<number, Record<string, number>> = {};
    for (let mes = 1; mes <= 12; mes++) {
      initial[mes] = {};
      TIPOS_ACTIVO.forEach((tipo) => {
        initial[mes][tipo.value] = 0;
      });
    }
    return initial;
  });

  const handleChange = (mes: number, tipo: string, value: string) => {
    const cantidad = Math.max(0, parseInt(value) || 0);
    setPlanificacion((prev) => ({
      ...prev,
      [mes]: {
        ...prev[mes],
        [tipo]: cantidad,
      },
    }));
  };

  const calcularTotalMes = (mes: number) => {
    return Object.values(planificacion[mes]).reduce((sum, val) => sum + val, 0);
  };

  const calcularTotalTipo = (tipo: string) => {
    let total = 0;
    for (let mes = 1; mes <= 12; mes++) {
      total += planificacion[mes][tipo] || 0;
    }
    return total;
  };

  const calcularTotalGeneral = () => {
    let total = 0;
    for (let mes = 1; mes <= 12; mes++) {
      total += calcularTotalMes(mes);
    }
    return total;
  };

  const handleConfirm = () => {
    const planificacionArray = [];
    for (let mes = 1; mes <= 12; mes++) {
      // Incluir TODOS los tipos de activos, incluso con valor 0
      const cuotas = TIPOS_ACTIVO.map((tipo) => ({
        tipo: tipo.value,
        planificado: planificacion[mes][tipo.value] || 0,
        realizados: 0,
      }));

      planificacionArray.push({
        mes,
        cuotas,
      });
    }

    onConfirm({
      ano,
      planificacion: planificacionArray,
    });
  };

  const limpiar = () => {
    const nuevaPlanificacion: Record<number, Record<string, number>> = {};
    for (let mes = 1; mes <= 12; mes++) {
      nuevaPlanificacion[mes] = {};
      TIPOS_ACTIVO.forEach((tipo) => {
        nuevaPlanificacion[mes][tipo.value] = 0;
      });
    }
    setPlanificacion(nuevaPlanificacion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Crear Planificación Anual {ano}
          </DialogTitle>
          <DialogDescription>
            Define la cantidad de mantenimientos planificados por tipo de activo
            para cada mes del año.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={limpiar}>
            Limpiar todo
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-background z-10">
                <tr>
                  <th className="border p-2 bg-muted font-semibold text-left min-w-[80px]">
                    Mes
                  </th>
                  {TIPOS_ACTIVO.map((tipo) => (
                    <th
                      key={tipo.value}
                      className="border p-2 bg-muted font-semibold text-center min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{tipo.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {calcularTotalTipo(tipo.value)}
                        </Badge>
                      </div>
                    </th>
                  ))}
                  <th className="border p-2 bg-muted font-semibold text-center min-w-[80px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((mes, index) => {
                  const mesNum = index + 1;
                  const totalMes = calcularTotalMes(mesNum);
                  return (
                    <tr key={mesNum} className="hover:bg-muted/50">
                      <td className="border p-2 font-medium">{mes}</td>
                      {TIPOS_ACTIVO.map((tipo) => (
                        <td key={tipo.value} className="border p-1">
                          <Input
                            type="number"
                            min="0"
                            value={planificacion[mesNum][tipo.value]}
                            onChange={(e) =>
                              handleChange(mesNum, tipo.value, e.target.value)
                            }
                            className="w-full text-center h-9"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-center font-semibold">
                        <Badge variant={totalMes > 0 ? "default" : "secondary"}>
                          {totalMes}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-bold">
                  <td className="border p-2">Total Anual</td>
                  {TIPOS_ACTIVO.map((tipo) => (
                    <td key={tipo.value} className="border p-2 text-center">
                      <Badge variant="default" className="text-sm">
                        {calcularTotalTipo(tipo.value)}
                      </Badge>
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    <Badge variant="default" className="text-lg">
                      {calcularTotalGeneral()}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Total de mantenimientos planificados
            </span>
            <span className="text-3xl font-bold">{calcularTotalGeneral()}</span>
          </div>
          <div className="flex gap-4 text-sm flex-wrap">
            {TIPOS_ACTIVO.map((tipo) => (
              <div key={tipo.value} className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs">
                  {tipo.label}
                </span>
                <span className="font-semibold">
                  {calcularTotalTipo(tipo.value)}
                </span>
              </div>
            ))}
          </div>
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
