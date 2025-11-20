"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, FileSpreadsheet, Download, Calendar } from "lucide-react";
import { PlanificacionAnual } from "@/shared/types/planificacion";
import { reportesPlanificacionService } from "../services/reportes-planificacion-service";
import toast from "react-hot-toast";

interface ReportesPlanificacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planificacion: PlanificacionAnual | null;
}

export function ReportesPlanificacionModal({
  open,
  onOpenChange,
  planificacion,
}: ReportesPlanificacionModalProps) {
  const [generando, setGenerando] = useState(false);

  // Obtener el mes actual automáticamente
  const mesActual = new Date().getMonth() + 1; // 1-12
  const mesInicio = 1; // Siempre desde Enero
  const mesFin = mesActual; // Hasta el mes actual

  const mesesNombres = [
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

  const handleGenerarPDF = () => {
    if (!planificacion) {
      toast.error("No hay datos de planificación disponibles");
      return;
    }

    try {
      setGenerando(true);
      const planificacionFiltrada =
        reportesPlanificacionService.filtrarPorMeses(
          planificacion,
          mesInicio,
          mesFin
        );

      if (planificacionFiltrada.meses.length === 0) {
        toast.error("No hay meses en el rango seleccionado");
        return;
      }

      reportesPlanificacionService.generarPDF(planificacionFiltrada);
      toast.success("Reporte PDF generado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = () => {
    if (!planificacion) {
      toast.error("No hay datos de planificación disponibles");
      return;
    }

    try {
      setGenerando(true);
      const planificacionFiltrada =
        reportesPlanificacionService.filtrarPorMeses(
          planificacion,
          mesInicio,
          mesFin
        );

      if (planificacionFiltrada.meses.length === 0) {
        toast.error("No hay meses en el rango seleccionado");
        return;
      }

      reportesPlanificacionService.generarExcel(planificacionFiltrada);
      toast.success("Reporte Excel generado exitosamente");
    } catch (error) {
      console.error("Error al generar Excel:", error);
      toast.error("Error al generar el reporte Excel");
    } finally {
      setGenerando(false);
    }
  };

  const planificacionFiltrada = planificacion
    ? reportesPlanificacionService.filtrarPorMeses(
        planificacion,
        mesInicio,
        mesFin
      )
    : null;

  const totalPlanificado =
    planificacionFiltrada?.meses.reduce(
      (sum, mes) => sum + mes.planificados,
      0
    ) || 0;

  const totalRealizado =
    planificacionFiltrada?.meses.reduce(
      (sum, mes) => sum + mes.realizados,
      0
    ) || 0;

  const porcentajeCumplimiento =
    totalPlanificado > 0
      ? ((totalRealizado / totalPlanificado) * 100).toFixed(1)
      : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-orange-600" />
            Generar Reporte de Planificación Anual
          </DialogTitle>
          <DialogDescription>
            Reporte de mantenimientos planificados vs realizados{" "}
            {planificacion?.ano && `- Año ${planificacion.ano}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del período */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-orange-600" />
              Período del Reporte
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">
                    Rango de meses incluidos:
                  </p>
                  <p className="text-lg font-bold text-orange-900">
                    {mesesNombres[mesInicio - 1]} - {mesesNombres[mesFin - 1]}{" "}
                    {planificacion?.ano}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    El reporte incluye desde el inicio del año hasta el mes
                    actual
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-orange-700 font-medium">
                    Meses incluidos
                  </p>
                  <p className="text-3xl font-bold text-orange-900">{mesFin}</p>
                </div>
              </div>
            </div>

            {planificacionFiltrada && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-green-700 font-medium">
                      Total Planificado
                    </div>
                    <div className="text-xl font-bold text-green-900">
                      {totalPlanificado}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium">
                      Total Realizado
                    </div>
                    <div className="text-xl font-bold text-blue-900">
                      {totalRealizado}
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-700 font-medium">
                      Cumplimiento
                    </div>
                    <div className="text-xl font-bold text-orange-900">
                      {porcentajeCumplimiento}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de descarga */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Formato del Reporte</div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleGenerarPDF}
                disabled={generando || !planificacion}
                className="h-24 flex-col gap-2"
                variant="outline"
              >
                <FileText className="h-8 w-8 text-red-600" />
                <div className="text-center">
                  <div className="font-semibold">Descargar PDF</div>
                  <div className="text-xs text-muted-foreground">
                    Formato compacto
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleGenerarExcel}
                disabled={generando || !planificacion}
                className="h-24 flex-col gap-2"
                variant="outline"
              >
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold">Descargar Excel</div>
                  <div className="text-xs text-muted-foreground">
                    Con análisis trimestral
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="text-sm font-medium">El reporte incluirá:</div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Planificación mensual detallada</li>
              <li>• Comparativa planificado vs realizado</li>
              <li>• Porcentaje de cumplimiento por mes</li>
              <li>• Totales anuales y estadísticas</li>
              <li>• Análisis por trimestres (solo en Excel)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
