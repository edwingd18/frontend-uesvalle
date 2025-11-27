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

    // Función para detectar tipo de traslado
    const getTipoTraslado = (tras: Traslado) => {
      const tieneUsuarios =
        (tras.usuario_uso_destino && tras.usuario_uso_destino.trim() !== "") ||
        (tras.usuario_sysman_destino &&
          tras.usuario_sysman_destino.trim() !== "");
      const cambioSede = tras.sede_origen_id !== tras.sede_destino_id;

      if (tieneUsuarios && cambioSede) return "ambos";
      if (tieneUsuarios) return "usuarios";
      return "ubicacion";
    };

    // Función para abreviar nombres de sedes
    const abreviarSede = (nombre: string) => {
      return nombre
        .replace(/Sede\s+/gi, "")
        .replace(/Principal/gi, "Princ.")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Separar traslados por tipo
    const trasladosUbicacion = traslados.filter(
      (t) => getTipoTraslado(t) === "ubicacion"
    );
    const trasladosUsuarios = traslados.filter(
      (t) => getTipoTraslado(t) === "usuarios"
    );
    const trasladosAmbos = traslados.filter(
      (t) => getTipoTraslado(t) === "ambos"
    );

    let currentY = fechaInicio ? 45 : 40;

    // TABLA 1: Traslados de Ubicación
    if (trasladosUbicacion.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text("Traslados de Ubicación", 14, currentY);
      currentY += 7;

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "ID",
            "Activo",
            "Fecha",
            "Origen",
            "Destino",
            "Solicitado",
            "Motivo",
          ],
        ],
        body: trasladosUbicacion.map((tras) => [
          tras.id,
          getActivoInfo(tras.activo_id),
          new Date(tras.fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
          abreviarSede(getSedeNombre(tras.sede_origen_id)),
          abreviarSede(getSedeNombre(tras.sede_destino_id)),
          getUsuarioNombre(tras.solicitado_por_id),
          tras.motivo.substring(0, 40) + (tras.motivo.length > 40 ? "..." : ""),
        ]),
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          halign: "left",
          valign: "middle",
        },
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 25 },
          2: { cellWidth: 18, halign: "center" },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 },
          6: { cellWidth: 58 },
        },
        margin: { left: 8, right: 8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // TABLA 2: Traslados de Usuarios
    if (trasladosUsuarios.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text("Traslados de Usuarios", 14, currentY);
      currentY += 7;

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "ID",
            "Activo",
            "Fecha",
            "Uso Anterior",
            "Uso Nuevo",
            "Sysman Anterior",
            "Sysman Nuevo",
            "Solicitado",
            "Motivo",
          ],
        ],
        body: trasladosUsuarios.map((tras) => {
          return [
            tras.id,
            getActivoInfo(tras.activo_id),
            new Date(tras.fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            tras.usuario_uso_origen || "-",
            tras.usuario_uso_destino || "-",
            tras.usuario_sysman_origen || "-",
            tras.usuario_sysman_destino || "-",
            getUsuarioNombre(tras.solicitado_por_id),
            tras.motivo.substring(0, 25) +
              (tras.motivo.length > 25 ? "..." : ""),
          ];
        }),
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          halign: "left",
          valign: "middle",
        },
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 20 },
          2: { cellWidth: 15, halign: "center" },
          3: { cellWidth: 23 },
          4: { cellWidth: 23 },
          5: { cellWidth: 23 },
          6: { cellWidth: 23 },
          7: { cellWidth: 18 },
          8: { cellWidth: 43 },
        },
        margin: { left: 8, right: 8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // TABLA 3: Traslados de Ubicación y Usuarios
    if (trasladosAmbos.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text("Traslados de Ubicación y Usuarios", 14, currentY);
      currentY += 7;

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "ID",
            "Activo",
            "Fecha",
            "Origen",
            "Destino",
            "Uso Ant.",
            "Uso Nuevo",
            "Sys Ant.",
            "Sys Nuevo",
            "Solicitado",
            "Motivo",
          ],
        ],
        body: trasladosAmbos.map((tras) => {
          return [
            tras.id,
            getActivoInfo(tras.activo_id),
            new Date(tras.fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            abreviarSede(getSedeNombre(tras.sede_origen_id)),
            abreviarSede(getSedeNombre(tras.sede_destino_id)),
            tras.usuario_uso_origen || "-",
            tras.usuario_uso_destino || "-",
            tras.usuario_sysman_origen || "-",
            tras.usuario_sysman_destino || "-",
            getUsuarioNombre(tras.solicitado_por_id),
            tras.motivo.substring(0, 20) +
              (tras.motivo.length > 20 ? "..." : ""),
          ];
        }),
        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          overflow: "linebreak",
          halign: "left",
          valign: "middle",
        },
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 18 },
          2: { cellWidth: 14, halign: "center" },
          3: { cellWidth: 22 },
          4: { cellWidth: 22 },
          5: { cellWidth: 18 },
          6: { cellWidth: 18 },
          7: { cellWidth: 18 },
          8: { cellWidth: 18 },
          9: { cellWidth: 16 },
          10: { cellWidth: 24 },
        },
        margin: { left: 8, right: 8 },
      });
    }

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

    // Función para detectar tipo de traslado
    const getTipoTraslado = (tras: Traslado) => {
      const tieneUsuarios =
        (tras.usuario_uso_destino && tras.usuario_uso_destino.trim() !== "") ||
        (tras.usuario_sysman_destino &&
          tras.usuario_sysman_destino.trim() !== "");
      const cambioSede = tras.sede_origen_id !== tras.sede_destino_id;

      if (tieneUsuarios && cambioSede) return "Ubicación y Usuarios";
      if (tieneUsuarios) return "Usuarios";
      return "Ubicación";
    };

    // Preparar datos
    const data = traslados.map((tras) => ({
      "ID Traslado": tras.id,
      "Tipo Traslado": getTipoTraslado(tras),
      "Placa Activo": getActivoInfo(tras.activo_id),
      "Tipo Activo": getActivoTipo(tras.activo_id),
      Fecha: new Date(tras.fecha).toLocaleDateString(),
      "Sede Origen": getSedeNombre(tras.sede_origen_id),
      "Sede Destino": getSedeNombre(tras.sede_destino_id),
      "Usuario Uso Anterior": tras.usuario_uso_origen || "-",
      "Usuario Uso Nuevo": tras.usuario_uso_destino || "-",
      "Usuario Sysman Anterior": tras.usuario_sysman_origen || "-",
      "Usuario Sysman Nuevo": tras.usuario_sysman_destino || "-",
      "Solicitado Por": getUsuarioNombre(tras.solicitado_por_id),
      Motivo: tras.motivo,
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja con los datos
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 12 }, // ID Traslado
      { wch: 20 }, // Tipo Traslado
      { wch: 18 }, // Placa Activo
      { wch: 15 }, // Tipo Activo
      { wch: 12 }, // Fecha
      { wch: 25 }, // Sede Origen
      { wch: 25 }, // Sede Destino
      { wch: 20 }, // Usuario Uso Anterior
      { wch: 20 }, // Usuario Uso Nuevo
      { wch: 20 }, // Usuario Sysman Anterior
      { wch: 20 }, // Usuario Sysman Nuevo
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
