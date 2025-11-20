import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Traslado } from "@/shared/types/traslado";
import { Activo } from "@/shared/types/inventario";
import { Sede, Usuario } from "@/shared/types/inventario";

export class ReportesTrasladosService {
  /**
   * Genera un reporte PDF de traslados
   */
  generarPDF(
    traslados: Traslado[],
    activos: Activo[],
    sedes: Sede[],
    usuarios: Usuario[],
    fechaInicio?: string,
    fechaFin?: string
  ): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(234, 88, 12);
    doc.text("Reporte de Traslados", 14, 20);

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 28);

    if (fechaInicio && fechaFin) {
      doc.text(
        `Período: ${new Date(fechaInicio).toLocaleDateString()} - ${new Date(
          fechaFin
        ).toLocaleDateString()}`,
        14,
        34
      );
    }

    doc.text(
      `Total de traslados: ${traslados.length}`,
      14,
      fechaInicio ? 40 : 34
    );

    // Funciones helper
    const getActivoInfo = (activoId: number) => {
      const activo = activos.find((a) => a.id === activoId);
      return activo ? activo.placa : `ID: ${activoId}`;
    };

    const getSedeNombre = (sedeId: number) => {
      const sede = sedes.find((s) => s.id === sedeId);
      return sede ? sede.nombre : `ID: ${sedeId}`;
    };

    const getUsuarioNombre = (usuarioId: number) => {
      const usuario = usuarios.find((u) => u.id === usuarioId);
      return usuario ? usuario.nombre : `ID: ${usuarioId}`;
    };

    // Tabla de traslados
    autoTable(doc, {
      startY: fechaInicio ? 45 : 40,
      head: [
        [
          "Activo",
          "Fecha",
          "Sede Origen",
          "Sede Destino",
          "Solicitado Por",
          "Motivo",
        ],
      ],
      body: traslados.map((tras) => [
        getActivoInfo(tras.activo_id),
        new Date(tras.fecha).toLocaleDateString(),
        getSedeNombre(tras.sede_origen_id),
        getSedeNombre(tras.sede_destino_id),
        getUsuarioNombre(tras.solicitado_por_id),
        tras.motivo.substring(0, 30) + (tras.motivo.length > 30 ? "..." : ""),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      margin: { top: 10 },
    });

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Descargar
    const fileName = `traslados_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera un reporte Excel de traslados
   */
  generarExcel(
    traslados: Traslado[],
    activos: Activo[],
    sedes: Sede[],
    usuarios: Usuario[],
    fechaInicio?: string,
    fechaFin?: string
  ): void {
    // Funciones helper
    const getActivoInfo = (activoId: number) => {
      const activo = activos.find((a) => a.id === activoId);
      return activo ? activo.placa : `ID: ${activoId}`;
    };

    const getActivoTipo = (activoId: number) => {
      const activo = activos.find((a) => a.id === activoId);
      return activo ? activo.tipo : "N/A";
    };

    const getSedeNombre = (sedeId: number) => {
      const sede = sedes.find((s) => s.id === sedeId);
      return sede ? sede.nombre : `ID: ${sedeId}`;
    };

    const getUsuarioNombre = (usuarioId: number) => {
      const usuario = usuarios.find((u) => u.id === usuarioId);
      return usuario ? usuario.nombre : `ID: ${usuarioId}`;
    };

    // Preparar datos
    const data = traslados.map((tras) => ({
      "ID Traslado": tras.id,
      "Placa Activo": getActivoInfo(tras.activo_id),
      "Tipo Activo": getActivoTipo(tras.activo_id),
      Fecha: new Date(tras.fecha).toLocaleDateString(),
      "Sede Origen": getSedeNombre(tras.sede_origen_id),
      "Sede Destino": getSedeNombre(tras.sede_destino_id),
      "Solicitado Por": getUsuarioNombre(tras.solicitado_por_id),
      Motivo: tras.motivo,
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja con los datos
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // ID Traslado
      { wch: 20 }, // Placa Activo
      { wch: 15 }, // Tipo Activo
      { wch: 15 }, // Fecha
      { wch: 25 }, // Sede Origen
      { wch: 25 }, // Sede Destino
      { wch: 25 }, // Solicitado Por
      { wch: 50 }, // Motivo
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Traslados");

    // Crear hoja de resumen
    const resumen = [
      ["RESUMEN DEL REPORTE"],
      [""],
      ["Fecha de generación:", new Date().toLocaleDateString()],
      [
        "Período:",
        fechaInicio && fechaFin
          ? `${new Date(fechaInicio).toLocaleDateString()} - ${new Date(
              fechaFin
            ).toLocaleDateString()}`
          : "Todos los registros",
      ],
      ["Total de traslados:", traslados.length],
      [""],
      ["DISTRIBUCIÓN POR SEDE DESTINO"],
    ];

    // Contar por sede destino
    const porSedeDestino = traslados.reduce((acc, tras) => {
      const key = `Sede ${tras.sede_destino_id}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(porSedeDestino).forEach(([sede, cantidad]) => {
      resumen.push([sede, cantidad]);
    });

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Descargar
    const fileName = `traslados_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Filtra traslados por múltiples criterios
   */
  filtrarTraslados(
    traslados: Traslado[],
    fechaInicio?: string,
    fechaFin?: string,
    sedeOrigenId?: number,
    sedeDestinoId?: number
  ): Traslado[] {
    let resultado = traslados;

    // Filtrar por fechas
    if (fechaInicio || fechaFin) {
      resultado = resultado.filter((tras) => {
        const fechaTras = new Date(tras.fecha);

        if (fechaInicio && fechaFin) {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59, 999);
          return fechaTras >= inicio && fechaTras <= fin;
        }

        if (fechaInicio) {
          return fechaTras >= new Date(fechaInicio);
        }

        if (fechaFin) {
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59, 999);
          return fechaTras <= fin;
        }

        return true;
      });
    }

    // Filtrar por sede origen
    if (sedeOrigenId && sedeOrigenId > 0) {
      resultado = resultado.filter(
        (tras) => tras.sede_origen_id === sedeOrigenId
      );
    }

    // Filtrar por sede destino
    if (sedeDestinoId && sedeDestinoId > 0) {
      resultado = resultado.filter(
        (tras) => tras.sede_destino_id === sedeDestinoId
      );
    }

    return resultado;
  }
}

export const reportesTrasladosService = new ReportesTrasladosService();
