import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Activo } from "@/shared/types/inventario";

export class ReportesService {
  /**
   * Genera un reporte PDF de activos
   */
  generarPDF(activos: Activo[], fechaInicio?: string, fechaFin?: string): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.text("Reporte de Inventario", 14, 20);

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

    doc.text(`Total de activos: ${activos.length}`, 14, fechaInicio ? 40 : 34);

    // Tabla de activos
    autoTable(doc, {
      startY: fechaInicio ? 45 : 40,
      head: [
        [
          "Placa",
          "Tipo",
          "Marca",
          "Modelo",
          "Serial",
          "Estado",
          "Fecha Instalación",
        ],
      ],
      body: activos.map((activo) => {
        const fechaStr = activo.fecha_instalacion;
        return [
          activo.placa,
          activo.tipo,
          activo.marca,
          activo.modelo,
          activo.serial,
          activo.estado,
          fechaStr ? new Date(fechaStr).toLocaleDateString() : "N/A",
        ];
      }),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [234, 88, 12], // Orange-600
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Gray-50
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
    const fileName = `inventario_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera un reporte Excel de activos
   */
  generarExcel(
    activos: Activo[],
    fechaInicio?: string,
    fechaFin?: string
  ): void {
    // Preparar datos
    const data = activos.map((activo) => {
      const fechaStr = activo.fecha_instalacion;
      return {
        Placa: activo.placa,
        Tipo: activo.tipo,
        Marca: activo.marca,
        Modelo: activo.modelo,
        Serial: activo.serial,
        Estado: activo.estado,
        Proceso: activo.proceso,
        "Sede ID": activo.sede_id,
        "Fecha Instalación": fechaStr
          ? new Date(fechaStr).toLocaleDateString()
          : "N/A",
      };
    });

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja con los datos
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 18 }, // Placa
      { wch: 12 }, // Tipo
      { wch: 15 }, // Marca
      { wch: 20 }, // Modelo
      { wch: 20 }, // Serial
      { wch: 12 }, // Estado
      { wch: 15 }, // Proceso
      { wch: 10 }, // Sede ID
      { wch: 18 }, // Fecha Instalación
    ];
    ws["!cols"] = colWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");

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
      ["Total de activos:", activos.length],
      [""],
      ["DISTRIBUCIÓN POR TIPO"],
    ];

    // Contar por tipo
    const porTipo = activos.reduce((acc, activo) => {
      acc[activo.tipo] = (acc[activo.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      resumen.push([tipo, cantidad]);
    });

    resumen.push([""], ["DISTRIBUCIÓN POR ESTADO"]);

    // Contar por estado
    const porEstado = activos.reduce((acc, activo) => {
      acc[activo.estado] = (acc[activo.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(porEstado).forEach(([estado, cantidad]) => {
      resumen.push([estado, cantidad]);
    });

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Descargar
    const fileName = `inventario_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Filtra activos por múltiples criterios
   */
  filtrarActivos(
    activos: Activo[],
    fechaInicio?: string,
    fechaFin?: string,
    tipo?: string,
    estado?: string,
    proceso?: string
  ): Activo[] {
    let resultado = activos;

    // Filtrar por fechas
    if (fechaInicio || fechaFin) {
      resultado = this.filtrarPorFechas(resultado, fechaInicio, fechaFin);
    }

    // Filtrar por tipo
    if (tipo && tipo !== "all") {
      resultado = resultado.filter(
        (activo) => activo.tipo.toLowerCase() === tipo.toLowerCase()
      );
    }

    // Filtrar por estado
    if (estado && estado !== "all") {
      resultado = resultado.filter(
        (activo) => activo.estado.toLowerCase() === estado.toLowerCase()
      );
    }

    // Filtrar por proceso
    if (proceso && proceso !== "all") {
      resultado = resultado.filter(
        (activo) => activo.proceso.toLowerCase() === proceso.toLowerCase()
      );
    }

    return resultado;
  }

  /**
   * Filtra activos por rango de fechas de instalación
   */
  filtrarPorFechas(
    activos: Activo[],
    fechaInicio?: string,
    fechaFin?: string
  ): Activo[] {
    if (!fechaInicio && !fechaFin) {
      return activos;
    }

    return activos.filter((activo) => {
      // Usar fecha_instalacion del backend
      const fechaStr = activo.fecha_instalacion;

      // Si el activo no tiene fecha de instalación, no lo incluimos en el filtro
      if (!fechaStr) {
        return false;
      }

      const fechaInstalacion = new Date(fechaStr);

      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999); // Incluir todo el día final
        return fechaInstalacion >= inicio && fechaInstalacion <= fin;
      }

      if (fechaInicio) {
        return fechaInstalacion >= new Date(fechaInicio);
      }

      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        return fechaInstalacion <= fin;
      }

      return true;
    });
  }
}

export const reportesService = new ReportesService();
