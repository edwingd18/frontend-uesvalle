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
import { Activo } from "@/shared/types/inventario";
import { reportesService } from "../services/reportes-service";
import toast from "react-hot-toast";

interface ReportesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activos: Activo[];
}

export function ReportesModal({
  open,
  onOpenChange,
  activos,
}: ReportesModalProps) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [procesoFiltro, setProcesoFiltro] = useState("");
  const [generando, setGenerando] = useState(false);

  const handleGenerarPDF = () => {
    try {
      setGenerando(true);
      const activosFiltrados = reportesService.filtrarActivos(
        activos,
        fechaInicio,
        fechaFin,
        tipoFiltro,
        estadoFiltro,
        procesoFiltro
      );

      if (activosFiltrados.length === 0) {
        toast.error("No hay activos con los filtros seleccionados");
        return;
      }

      reportesService.generarPDF(activosFiltrados, fechaInicio, fechaFin);
      toast.success(
        `Reporte PDF generado con ${activosFiltrados.length} activos`
      );
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = () => {
    try {
      setGenerando(true);
      const activosFiltrados = reportesService.filtrarActivos(
        activos,
        fechaInicio,
        fechaFin,
        tipoFiltro,
        estadoFiltro,
        procesoFiltro
      );

      if (activosFiltrados.length === 0) {
        toast.error("No hay activos con los filtros seleccionados");
        return;
      }

      reportesService.generarExcel(activosFiltrados, fechaInicio, fechaFin);
      toast.success(
        `Reporte Excel generado con ${activosFiltrados.length} activos`
      );
    } catch (error) {
      console.error("Error al generar Excel:", error);
      toast.error("Error al generar el reporte Excel");
    } finally {
      setGenerando(false);
    }
  };

  const activosFiltrados = reportesService.filtrarActivos(
    activos,
    fechaInicio,
    fechaFin,
    tipoFiltro,
    estadoFiltro,
    procesoFiltro
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-orange-600" />
            Generar Reporte de Inventario
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
              Filtrar por Fecha de Adquisición
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

          {/* Filtros adicionales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4 text-orange-600" />
              Filtros Adicionales
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoFiltro" className="text-sm font-medium">
                  Tipo de Dispositivo
                </Label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger id="tipoFiltro" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="computador">Computador</SelectItem>
                    <SelectItem value="portatil">Portátil</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="impresora">Impresora</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="servidor">Servidor</SelectItem>
                    <SelectItem value="ups">UPS</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estadoFiltro" className="text-sm font-medium">
                  Estado
                </Label>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger id="estadoFiltro" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="bueno">Bueno</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="malo">Malo</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="procesoFiltro" className="text-sm font-medium">
                  Proceso
                </Label>
                <Select value={procesoFiltro} onValueChange={setProcesoFiltro}>
                  <SelectTrigger id="procesoFiltro" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los procesos</SelectItem>
                    <SelectItem value="sistemas">Sistemas</SelectItem>
                    <SelectItem value="contabilidad">Contabilidad</SelectItem>
                    <SelectItem value="administracion">
                      Administración
                    </SelectItem>
                    <SelectItem value="gerencia">Gerencia</SelectItem>
                    <SelectItem value="juridica">Jurídica</SelectItem>
                    <SelectItem value="financiera">Financiera</SelectItem>
                    <SelectItem value="tecnica">Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(fechaInicio ||
              fechaFin ||
              tipoFiltro ||
              estadoFiltro ||
              procesoFiltro) && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <span className="text-sm font-medium text-blue-900">
                  Activos que coinciden con los filtros:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {activosFiltrados.length}
                </span>
              </div>
            )}

            {!fechaInicio &&
              !fechaFin &&
              !tipoFiltro &&
              !estadoFiltro &&
              !procesoFiltro && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Sin filtros se incluirán todos los {activos.length} activos
                </p>
              )}
          </div>

          {/* Botones de descarga */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Formato del Reporte</div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleGenerarPDF}
                disabled={generando || activosFiltrados.length === 0}
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
                disabled={generando || activosFiltrados.length === 0}
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
              <li>• Información completa de cada activo</li>
              <li>• Fecha de generación del reporte</li>
              <li>• Rango de fechas aplicado (si existe)</li>
              <li>
                • Resumen estadístico (solo en Excel): distribución por tipo y
                estado
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
