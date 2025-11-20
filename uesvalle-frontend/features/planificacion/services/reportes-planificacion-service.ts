import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  PlanificacionAnual,
  MesPlanificacion,
} from "@/shared/types/planificacion";

export class ReportesPlanificacionService {
  private readonly mesesNombres = [
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

  /**
   * Genera un reporte PDF de planificación anual
   */
  generarPDF(planificacion: PlanificacionAnual): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(234, 88, 12);
    doc.text(`Reporte de Planificación Anual ${planificacion.ano}`, 14, 20);

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 28);

    // Calcular totales
    const totalPlanificado = planificacion.meses.reduce(
      (sum, mes) => sum + mes.planificados,
      0
    );
    const totalRealizado = planificacion.meses.reduce(
      (sum, mes) => sum + mes.realizados,
      0
    );
    const porcentajeCumplimiento =
      totalPlanificado > 0
        ? ((totalRealizado / totalPlanificado) * 100).toFixed(1)
        : "0";

    doc.text(`Total Planificado: ${totalPlanificado}`, 14, 34);
    doc.text(`Total Realizado: ${totalRealizado}`, 14, 40);
    doc.text(`Cumplimiento: ${porcentajeCumplimiento}%`, 14, 46);

    // Tabla de planificación mensual
    autoTable(doc, {
      startY: 52,
      head: [["Mes", "Planificados", "Realizados", "Cumplimiento %"]],
      body: planificacion.meses.map((mes) => {
        const cumplimiento =
          mes.planificados > 0
            ? ((mes.realizados / mes.planificados) * 100).toFixed(1)
            : "0";
        return [
          this.mesesNombres[mes.mes - 1],
          mes.planificados,
          mes.realizados,
          `${cumplimiento}%`,
        ];
      }),
      foot: [
        [
          "TOTAL",
          totalPlanificado.toString(),
          totalRealizado.toString(),
          `${porcentajeCumplimiento}%`,
        ],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      footStyles: {
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
    const fileName = `planificacion_${
      planificacion.ano
    }_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera un reporte Excel de planificación anual
   */
  generarExcel(planificacion: PlanificacionAnual): void {
    // Calcular totales
    const totalPlanificado = planificacion.meses.reduce(
      (sum, mes) => sum + mes.planificados,
      0
    );
    const totalRealizado = planificacion.meses.reduce(
      (sum, mes) => sum + mes.realizados,
      0
    );
    const porcentajeCumplimiento =
      totalPlanificado > 0
        ? ((totalRealizado / totalPlanificado) * 100).toFixed(1)
        : "0";

    // Preparar datos mensuales
    const dataMensual = planificacion.meses.map((mes) => {
      const cumplimiento =
        mes.planificados > 0
          ? ((mes.realizados / mes.planificados) * 100).toFixed(1)
          : "0";
      return {
        Mes: this.mesesNombres[mes.mes - 1],
        Planificados: mes.planificados,
        Realizados: mes.realizados,
        Diferencia: mes.realizados - mes.planificados,
        "Cumplimiento %": `${cumplimiento}%`,
      };
    });

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja con datos mensuales
    const ws = XLSX.utils.json_to_sheet(dataMensual);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Planificación Mensual");

    // Crear hoja de resumen
    const resumen = [
      [`PLANIFICACIÓN ANUAL ${planificacion.ano}`],
      [""],
      ["Fecha de generación:", new Date().toLocaleDateString()],
      [""],
      ["RESUMEN GENERAL"],
      ["Total Planificado:", totalPlanificado],
      ["Total Realizado:", totalRealizado],
      ["Diferencia:", totalRealizado - totalPlanificado],
      ["Porcentaje de Cumplimiento:", `${porcentajeCumplimiento}%`],
      [""],
      ["ANÁLISIS POR TRIMESTRE"],
    ];

    // Calcular por trimestres
    const trimestres = [
      { nombre: "Q1 (Ene-Mar)", meses: [1, 2, 3] },
      { nombre: "Q2 (Abr-Jun)", meses: [4, 5, 6] },
      { nombre: "Q3 (Jul-Sep)", meses: [7, 8, 9] },
      { nombre: "Q4 (Oct-Dic)", meses: [10, 11, 12] },
    ];

    trimestres.forEach((trimestre) => {
      const mesesTrimestre = planificacion.meses.filter((m) =>
        trimestre.meses.includes(m.mes)
      );
      const planificadoTrim = mesesTrimestre.reduce(
        (sum, m) => sum + m.planificados,
        0
      );
      const realizadoTrim = mesesTrimestre.reduce(
        (sum, m) => sum + m.realizados,
        0
      );
      const cumplimientoTrim =
        planificadoTrim > 0
          ? ((realizadoTrim / planificadoTrim) * 100).toFixed(1)
          : "0";

      resumen.push([
        trimestre.nombre,
        `Planificado: ${planificadoTrim}, Realizado: ${realizadoTrim}, Cumplimiento: ${cumplimientoTrim}%`,
      ]);
    });

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen["!cols"] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Descargar
    const fileName = `planificacion_${
      planificacion.ano
    }_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Filtra meses por rango
   */
  filtrarPorMeses(
    planificacion: PlanificacionAnual,
    mesInicio?: number,
    mesFin?: number
  ): PlanificacionAnual {
    if (!mesInicio && !mesFin) {
      return planificacion;
    }

    const mesesFiltrados = planificacion.meses.filter((mes) => {
      if (mesInicio && mesFin) {
        return mes.mes >= mesInicio && mes.mes <= mesFin;
      }
      if (mesInicio) {
        return mes.mes >= mesInicio;
      }
      if (mesFin) {
        return mes.mes <= mesFin;
      }
      return true;
    });

    return {
      ...planificacion,
      meses: mesesFiltrados,
    };
  }
}

export const reportesPlanificacionService = new ReportesPlanificacionService();
