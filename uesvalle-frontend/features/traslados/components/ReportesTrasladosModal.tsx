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
import { Traslado } from "@/shared/types/traslado";
import { Activo, Sede, Usuario } from "@/shared/types/inventario";
import { reportesTrasladosService } from "../services/reportes-traslados-service";
import toast from "react-hot-toast";

interface ReportesTrasladosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traslados: Traslado[];
  activos: Activo[];
  sedes: Sede[];
  usuarios: Usuario[];
}

export function ReportesTrasladosModal({
  open,
  onOpenChange,
  traslados,
  activos,
  sedes,
  usuarios,
}: ReportesTrasladosModalProps) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sedeOrigenFiltro, setSedeOrigenFiltro] = useState("");
  const [sedeDestinoFiltro, setSedeDestinoFiltro] = useState("");
  const [generando, setGenerando] = useState(false);

  const handleGenerarPDF = () => {
    try {
      setGenerando(true);
      const trasladosFiltrados = reportesTrasladosService.filtrarTraslados(
        traslados,
        fechaInicio,
        fechaFin,
        sedeOrigenFiltro ? Number(sedeOrigenFiltro) : undefined,
        sedeDestinoFiltro ? Number(sedeDestinoFiltro) : undefined
      );

      if (trasladosFiltrados.length === 0) {
        toast.error("No hay traslados con los filtros seleccionados");
        return;
      }

      reportesTrasladosService.generarPDF(
        trasladosFiltrados,
        activos,
        sedes,
        usuarios,
        fechaInicio,
        fechaFin
      );
      toast.success(
        `Reporte PDF generado con ${trasladosFiltrados.length} traslados`
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
      const trasladosFiltrados = reportesTrasladosService.filtrarTraslados(
        traslados,
        fechaInicio,
        fechaFin,
        sedeOrigenFiltro ? Number(sedeOrigenFiltro) : undefined,
        sedeDestinoFiltro ? Number(sedeDestinoFiltro) : undefined
      );

      if (trasladosFiltrados.length === 0) {
        toast.error("No hay traslados con los filtros seleccionados");
        return;
      }

      reportesTrasladosService.generarExcel(
        trasladosFiltrados,
        activos,
        sedes,
        usuarios,
        fechaInicio,
        fechaFin
      );
      toast.success(
        `Reporte Excel generado con ${trasladosFiltrados.length} traslados`
      );
    } catch (error) {
      toast.error("Error al generar el reporte Excel");
    } finally {
      setGenerando(false);
    }
  };

  const trasladosFiltrados = reportesTrasladosService.filtrarTraslados(
    traslados,
    fechaInicio,
    fechaFin,
    sedeOrigenFiltro ? Number(sedeOrigenFiltro) : undefined,
    sedeDestinoFiltro ? Number(sedeDestinoFiltro) : undefined
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-orange-600" />
            Generar Reporte de Traslados
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
              Filtrar por Fecha de Traslado
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

          {/* Filtros de sedes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4 text-orange-600" />
              Filtros Adicionales
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="sedeOrigenFiltro"
                  className="text-sm font-medium"
                >
                  Sede Origen
                </Label>
                <Select
                  value={sedeOrigenFiltro}
                  onValueChange={setSedeOrigenFiltro}
                >
                  <SelectTrigger id="sedeOrigenFiltro" className="w-full">
                    <SelectValue placeholder="Todas las sedes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todas las sedes</SelectItem>
                    <SelectItem value="1">Sede Principal</SelectItem>
                    <SelectItem value="2">Aro Sur</SelectItem>
                    <SelectItem value="3">Aro Cartago</SelectItem>
                    <SelectItem value="4">Aro Tuluá</SelectItem>
                    <SelectItem value="5">Sede Yumbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sedeDestinoFiltro"
                  className="text-sm font-medium"
                >
                  Sede Destino
                </Label>
                <Select
                  value={sedeDestinoFiltro}
                  onValueChange={setSedeDestinoFiltro}
                >
                  <SelectTrigger id="sedeDestinoFiltro" className="w-full">
                    <SelectValue placeholder="Todas las sedes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todas las sedes</SelectItem>
                    <SelectItem value="1">Sede Principal</SelectItem>
                    <SelectItem value="2">Aro Sur</SelectItem>
                    <SelectItem value="3">Aro Cartago</SelectItem>
                    <SelectItem value="4">Aro Tuluá</SelectItem>
                    <SelectItem value="5">Sede Yumbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(fechaInicio ||
              fechaFin ||
              sedeOrigenFiltro ||
              sedeDestinoFiltro) && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <span className="text-sm font-medium text-blue-900">
                  Traslados que coinciden con los filtros:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {trasladosFiltrados.length}
                </span>
              </div>
            )}

            {!fechaInicio &&
              !fechaFin &&
              !sedeOrigenFiltro &&
              !sedeDestinoFiltro && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Sin filtros se incluirán todos los {traslados.length}{" "}
                  traslados
                </p>
              )}
          </div>

          {/* Botones de descarga */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Formato del Reporte</div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleGenerarPDF}
                disabled={generando || trasladosFiltrados.length === 0}
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
                disabled={generando || trasladosFiltrados.length === 0}
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
              <li>• Información completa de cada traslado</li>
              <li>• Fecha de generación del reporte</li>
              <li>• Rango de fechas aplicado (si existe)</li>
              <li>
                • Resumen estadístico (solo en Excel): distribución por sede
                destino
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
