"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface CrearPlanificacionPorTipoPageProps {
  ano: number;
  onConfirm: (planificacion: any) => void;
  onCancel: () => void;
}

export function CrearPlanificacionPorTipoPage({
  ano,
  onConfirm,
  onCancel,
}: CrearPlanificacionPorTipoPageProps) {
  const router = useRouter();

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Crear Planificación Anual {ano}
            </h1>
            <p className="text-muted-foreground mt-1">
              Define la cantidad de mantenimientos planificados por tipo de
              activo para cada mes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={limpiar}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleConfirm} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Guardar Planificación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calcularTotalGeneral()}</div>
          </CardContent>
        </Card>
        {TIPOS_ACTIVO.slice(0, 4).map((tipo) => (
          <Card key={tipo.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tipo.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calcularTotalTipo(tipo.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de Planificación */}
      <Card>
        <CardHeader>
          <CardTitle>Planificación Mensual por Tipo de Activo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-semibold text-left w-[10%]">
                    Tipo
                  </th>
                  {MESES.map((mes, index) => (
                    <th
                      key={index}
                      className="border p-1 bg-muted font-semibold text-center"
                    >
                      <span className="text-[10px]">{mes}</span>
                    </th>
                  ))}
                  <th className="border p-2 bg-muted font-semibold text-center w-[6%]">
                    <span className="text-xs">Total</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TIPOS_ACTIVO.map((tipo) => {
                  const totalTipo = calcularTotalTipo(tipo.value);
                  return (
                    <tr key={tipo.value} className="hover:bg-muted/50">
                      <td className="border p-1 font-medium bg-muted/30 text-xs">
                        {tipo.label}
                      </td>
                      {MESES.map((mes, index) => {
                        const mesNum = index + 1;
                        return (
                          <td key={mesNum} className="border p-0.5">
                            <Input
                              type="number"
                              min="0"
                              value={planificacion[mesNum][tipo.value]}
                              onChange={(e) =>
                                handleChange(mesNum, tipo.value, e.target.value)
                              }
                              className="w-full text-center h-8 text-xs border-0 focus-visible:ring-1"
                            />
                          </td>
                        );
                      })}
                      <td className="border p-1 text-center font-semibold bg-muted/30">
                        <Badge
                          variant={totalTipo > 0 ? "default" : "secondary"}
                          className="text-[10px] px-1 py-0"
                        >
                          {totalTipo}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-bold">
                  <td className="border p-1 text-xs">Total</td>
                  {MESES.map((mes, index) => {
                    const mesNum = index + 1;
                    const totalMes = calcularTotalMes(mesNum);
                    return (
                      <td key={mesNum} className="border p-1 text-center">
                        <Badge
                          variant="default"
                          className="text-[10px] px-1 py-0"
                        >
                          {totalMes}
                        </Badge>
                      </td>
                    );
                  })}
                  <td className="border p-2 text-center sticky right-0 z-10 bg-muted">
                    <Badge variant="default" className="text-sm">
                      {calcularTotalGeneral()}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumen por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Tipo de Activo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {TIPOS_ACTIVO.map((tipo) => {
              const total = calcularTotalTipo(tipo.value);
              return (
                <div
                  key={tipo.value}
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground mb-2">
                    {tipo.label}
                  </span>
                  <span className="text-2xl font-bold">{total}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {total > 0
                      ? `${(total / 12).toFixed(1)}/mes`
                      : "Sin planificar"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
