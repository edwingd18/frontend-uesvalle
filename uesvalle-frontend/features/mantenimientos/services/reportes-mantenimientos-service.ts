import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { Activo, Usuario } from "@/shared/types/inventario";

export class ReportesMantenimientosService {
  /**
   * Genera un reporte PDF de mantenimientos
   */
  generarPDF(
    mantenimientos: Mantenimiento[],
    activos: Activo[],
    usuarios: Usuario[],
    fechaInicio?: string,
    fechaFin?: string
  ): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(234, 88, 12);
    doc.text("Reporte de Mantenimientos", 14, 20);

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
      `Total de mantenimientos: ${mantenimientos.length}`,
      14,
      fechaInicio ? 40 : 34
    );

    // Funciones helper
    const getActivoInfo = (activoId: number) => {
      const activo = activos.find((a) => a.id === activoId);
      return activo ? `${activo.placa} - ${activo.tipo}` : `ID: ${activoId}`;
    };

    const getUsuarioNombre = (usuarioId: number | null | undefined) => {
      if (!usuarioId || usuarioId === 0) return "N/A";
      const usuario = usuarios.find((u) => u.id === usuarioId);
      return usuario ? usuario.nombre : "N/A";
    };

    // Tabla de mantenimientos
    autoTable(doc, {
      startY: fechaInicio ? 45 : 40,
      head: [
        [
          "Activo",
          "Fecha",
          "Tipo",
          "Técnico",
          "Enc. Hardware",
          "Enc. Software",
        ],
      ],
      body: mantenimientos.map((mant) => [
        getActivoInfo(mant.activo_id),
        new Date(mant.fecha_realizado).toLocaleDateString(),
        mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1),
        getUsuarioNombre(mant.tecnico_id),
        getUsuarioNombre(mant.encargado_harware_id),
        getUsuarioNombre(mant.encargado_software_id),
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
    const fileName = `mantenimientos_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera un reporte Excel de mantenimientos
   */
  generarExcel(
    mantenimientos: Mantenimiento[],
    activos: Activo[],
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

    const getActivoMarca = (activoId: number) => {
      const activo = activos.find((a) => a.id === activoId);
      return activo ? activo.marca : "N/A";
    };

    const getUsuarioNombre = (usuarioId: number | null | undefined) => {
      if (!usuarioId || usuarioId === 0) return "N/A";
      const usuario = usuarios.find((u) => u.id === usuarioId);
      return usuario ? usuario.nombre : "N/A";
    };

    // Preparar datos
    const data = mantenimientos.map((mant) => ({
      "ID Mantenimiento": mant.id,
      "Placa Activo": getActivoInfo(mant.activo_id),
      "Tipo Activo": getActivoTipo(mant.activo_id),
      "Marca Activo": getActivoMarca(mant.activo_id),
      "Fecha Realizado": new Date(mant.fecha_realizado).toLocaleDateString(),
      "Tipo Mantenimiento":
        mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1),
      Técnico: getUsuarioNombre(mant.tecnico_id),
      "Encargado Hardware": getUsuarioNombre(mant.encargado_harware_id),
      "Encargado Software": getUsuarioNombre(mant.encargado_software_id),
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja con los datos
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 18 }, // ID Mantenimiento
      { wch: 18 }, // Placa Activo
      { wch: 15 }, // Tipo Activo
      { wch: 15 }, // Marca Activo
      { wch: 15 }, // Fecha
      { wch: 18 }, // Tipo Mantenimiento
      { wch: 25 }, // Técnico
      { wch: 25 }, // Encargado Hardware
      { wch: 25 }, // Encargado Software
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Mantenimientos");

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
      ["Total de mantenimientos:", mantenimientos.length],
      [""],
      ["DISTRIBUCIÓN POR TIPO"],
    ];

    // Contar por tipo
    const porTipo = mantenimientos.reduce((acc, mant) => {
      acc[mant.tipo] = (acc[mant.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      resumen.push([tipo, cantidad]);
    });

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Descargar
    const fileName = `mantenimientos_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Filtra mantenimientos por múltiples criterios
   */
  filtrarMantenimientos(
    mantenimientos: Mantenimiento[],
    fechaInicio?: string,
    fechaFin?: string,
    tipo?: string
  ): Mantenimiento[] {
    let resultado = mantenimientos;

    // Filtrar por fechas de realización
    if (fechaInicio || fechaFin) {
      resultado = resultado.filter((mant) => {
        const fechaMant = new Date(mant.fecha_realizado);

        if (fechaInicio && fechaFin) {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59, 999);
          return fechaMant >= inicio && fechaMant <= fin;
        }

        if (fechaInicio) {
          return fechaMant >= new Date(fechaInicio);
        }

        if (fechaFin) {
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59, 999);
          return fechaMant <= fin;
        }

        return true;
      });
    }

    // Filtrar por tipo
    if (tipo && tipo !== "all") {
      resultado = resultado.filter((mant) => mant.tipo === tipo);
    }

    return resultado;
  }
}

export const reportesMantenimientosService =
  new ReportesMantenimientosService();
