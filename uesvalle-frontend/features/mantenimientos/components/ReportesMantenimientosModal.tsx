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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { Activo } from "@/shared/types/inventario";
import { Usuario } from "@/shared/types/usuario";
import { reportesMantenimientosService } from "../services/reportes-mantenimientos-service";
import toast from "react-hot-toast";

interface ReportesMantenimientosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mantenimientos: Mantenimiento[];
  activos: Activo[];
  usuarios: Usuario[];
}

export function ReportesMantenimientosModal({
  open,
  onOpenChange,
  mantenimientos,
  activos,
  usuarios,
}: ReportesMantenimientosModalProps) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [generando, setGenerando] = useState(false);

  const handleGenerarPDF = () => {
    try {
      setGenerando(true);
      const mantenimientosFiltrados =
        reportesMantenimientosService.filtrarMantenimientos(
          mantenimientos,
          fechaInicio,
          fechaFin,
          tipoFiltro
        );

      if (mantenimientosFiltrados.length === 0) {
        toast.error("No hay mantenimientos con los filtros seleccionados");
        return;
      }

      reportesMantenimientosService.generarPDF(
        mantenimientosFiltrados,
        activos,
        usuarios,
        fechaInicio,
        fechaFin
      );
      toast.success(
        `Reporte PDF generado con ${mantenimientosFiltrados.length} mantenimientos`
      );
    } catch (error) {
      toast.error("Error al generar el reporte PDF");
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = () => {
    try {
      setGenerando(true);
      const mantenimientosFiltrados =
        reportesMantenimientosService.filtrarMantenimientos(
          mantenimientos,
          fechaInicio,
          fechaFin,
          tipoFiltro
        );

      if (mantenimientosFiltrados.length === 0) {
        toast.error("No hay mantenimientos con los filtros seleccionados");
        return;
      }

      reportesMantenimientosService.generarExcel(
        mantenimientosFiltrados,
        activos,
        usuarios,
        fechaInicio,
        fechaFin
      );
      toast.success(
        `Reporte Excel generado con ${mantenimientosFiltrados.length} mantenimientos`
      );
    } catch (error) {
      toast.error("Error al generar el reporte Excel");
    } finally {
      setGenerando(false);
    }
  };

  const mantenimientosFiltrados =
    reportesMantenimientosService.filtrarMantenimientos(
      mantenimientos,
      fechaInicio,
      fechaFin,
      tipoFiltro
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-orange-600" />
            Generar Reporte de Mantenimientos
          </DialogTitle>
          <DialogDescription>
            Aplica filtros y selecciona el formato del reporte
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filtros de fecha */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-orange-600" />
              Filtrar por Fecha de Mantenimiento
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filtro de tipo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4 text-orange-600" />
              Filtro Adicional
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoFiltro" className="text-sm font-medium">
                Tipo de Mantenimiento
              </Label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger id="tipoFiltro" className="w-full">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(fechaInicio || fechaFin || tipoFiltro) && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <span className="text-sm font-medium text-blue-900">
                  Mantenimientos que coinciden con los filtros:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {mantenimientosFiltrados.length}
                </span>
              </div>
            )}

            {!fechaInicio && !fechaFin && !tipoFiltro && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Sin filtros se incluirán todos los {mantenimientos.length}{" "}
                mantenimientos
              </p>
            )}
          </div>

          {/* Botones de descarga */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Formato del Reporte</div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleGenerarPDF}
                disabled={generando || mantenimientosFiltrados.length === 0}
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
                disabled={generando || mantenimientosFiltrados.length === 0}
                className="h-24 flex-col gap-2"
                variant="outline"
              >
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold">Descargar Excel</div>
                  <div className="text-xs text-muted-foreground">
                    Con resumen y estadísticas
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="text-sm font-medium">El reporte incluirá:</div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Información completa de cada mantenimiento</li>
              <li>• Fecha de generación del reporte</li>
              <li>• Rango de fechas aplicado (si existe)</li>
              <li>
                • Resumen estadístico (solo en Excel): distribución por tipo
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
