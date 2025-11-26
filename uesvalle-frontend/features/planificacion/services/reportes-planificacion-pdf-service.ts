import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface PlanificacionData {
  ano: number;
  meses: Array<{
    mes: number;
    cuotas: Array<{
      tipo: string;
      planificado: number;
      realizado: number;
    }>;
  }>;
}

export class ReportesPlanificacionPDFService {
  generarReportePlanificacion(planificacion: PlanificacionData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Planificación Anual ${planificacion.ano}`, pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generado: ${new Date().toLocaleDateString("es-ES")}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    // Extraer todos los tipos únicos
    const todosLosTipos = new Set<string>();
    planificacion.meses?.forEach((mes) => {
      mes.cuotas?.forEach((cuota) => {
        todosLosTipos.add(cuota.tipo);
      });
    });
    const tiposArray = Array.from(todosLosTipos).sort();

    // Crear mapa de datos
    const datosTabla: Record<
      number,
      Record<string, { planificado: number; realizado: number }>
    > = {};

    for (let mes = 1; mes <= 12; mes++) {
      datosTabla[mes] = {};
      tiposArray.forEach((tipo) => {
        datosTabla[mes][tipo] = { planificado: 0, realizado: 0 };
      });
    }

    planificacion.meses?.forEach((mes) => {
      mes.cuotas?.forEach((cuota) => {
        datosTabla[mes.mes][cuota.tipo] = {
          planificado: cuota.planificado || 0,
          realizado: cuota.realizado || 0,
        };
      });
    });

    // Calcular totales
    const calcularTotalMes = (mes: number) => {
      let totalPlanificado = 0;
      let totalRealizado = 0;
      tiposArray.forEach((tipo) => {
        totalPlanificado += datosTabla[mes][tipo].planificado;
        totalRealizado += datosTabla[mes][tipo].realizado;
      });
      return { planificado: totalPlanificado, realizado: totalRealizado };
    };

    const calcularTotalTipo = (tipo: string) => {
      let totalPlanificado = 0;
      let totalRealizado = 0;
      for (let mes = 1; mes <= 12; mes++) {
        totalPlanificado += datosTabla[mes][tipo].planificado;
        totalRealizado += datosTabla[mes][tipo].realizado;
      }
      return { planificado: totalPlanificado, realizado: totalRealizado };
    };

    const calcularTotalGeneral = () => {
      let totalPlanificado = 0;
      let totalRealizado = 0;
      for (let mes = 1; mes <= 12; mes++) {
        const totales = calcularTotalMes(mes);
        totalPlanificado += totales.planificado;
        totalRealizado += totales.realizado;
      }
      return { planificado: totalPlanificado, realizado: totalRealizado };
    };

    const totalesGenerales = calcularTotalGeneral();
    const porcentajeCumplimiento =
      totalesGenerales.planificado > 0
        ? Math.round(
            (totalesGenerales.realizado / totalesGenerales.planificado) * 100
          )
        : 0;

    // Resumen ejecutivo
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Ejecutivo", 14, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Planificado: ${totalesGenerales.planificado}`, 14, 48);
    doc.text(`Total Realizado: ${totalesGenerales.realizado}`, 14, 54);
    doc.text(
      `Pendientes: ${
        totalesGenerales.planificado - totalesGenerales.realizado
      }`,
      14,
      60
    );
    doc.text(`Cumplimiento: ${porcentajeCumplimiento}%`, 14, 66);

    // Preparar datos para la tabla (Tipos en filas, Meses en columnas)
    const headers = [["Tipo", ...MESES, "Total"]];

    const body = tiposArray.map((tipo) => {
      const totalesTipo = calcularTotalTipo(tipo);
      const fila = [tipo];

      for (let mes = 1; mes <= 12; mes++) {
        const datos = datosTabla[mes][tipo];
        fila.push(`${datos.realizado}/${datos.planificado}`);
      }

      fila.push(`${totalesTipo.realizado}/${totalesTipo.planificado}`);
      return fila;
    });

    // Fila de totales
    const filaTotales = ["Total"];
    for (let mes = 1; mes <= 12; mes++) {
      const totalesMes = calcularTotalMes(mes);
      filaTotales.push(`${totalesMes.realizado}/${totalesMes.planificado}`);
    }
    filaTotales.push(
      `${totalesGenerales.realizado}/${totalesGenerales.planificado}`
    );
    body.push(filaTotales);

    // Generar tabla
    autoTable(doc, {
      startY: 75,
      head: headers,
      body: body,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [234, 88, 12], // Orange
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: "bold" }, // Tipo
        13: { cellWidth: 20, fontStyle: "bold", fillColor: [245, 245, 245] }, // Total
      },
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: 0,
        fontStyle: "bold",
      },
      didParseCell: (data) => {
        // Última fila (totales)
        if (data.row.index === body.length - 1) {
          data.cell.styles.fillColor = [245, 245, 245];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "UESVALLE - Sistema de Gestión de Activos",
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Guardar PDF
    doc.save(`Planificacion_${planificacion.ano}_${new Date().getTime()}.pdf`);
  }

  generarReporteEstadisticas(planificacion: PlanificacionData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Estadísticas de Planificación ${planificacion.ano}`,
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generado: ${new Date().toLocaleDateString("es-ES")}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    // Extraer todos los tipos únicos
    const todosLosTipos = new Set<string>();
    planificacion.meses?.forEach((mes) => {
      mes.cuotas?.forEach((cuota) => {
        todosLosTipos.add(cuota.tipo);
      });
    });
    const tiposArray = Array.from(todosLosTipos).sort();

    // Crear mapa de datos
    const datosTabla: Record<
      number,
      Record<string, { planificado: number; realizado: number }>
    > = {};

    for (let mes = 1; mes <= 12; mes++) {
      datosTabla[mes] = {};
      tiposArray.forEach((tipo) => {
        datosTabla[mes][tipo] = { planificado: 0, realizado: 0 };
      });
    }

    planificacion.meses?.forEach((mes) => {
      mes.cuotas?.forEach((cuota) => {
        datosTabla[mes.mes][cuota.tipo] = {
          planificado: cuota.planificado || 0,
          realizado: cuota.realizado || 0,
        };
      });
    });

    // Calcular totales
    const calcularTotalMes = (mes: number) => {
      let totalPlanificado = 0;
      let totalRealizado = 0;
      tiposArray.forEach((tipo) => {
        totalPlanificado += datosTabla[mes][tipo].planificado;
        totalRealizado += datosTabla[mes][tipo].realizado;
      });
      return { planificado: totalPlanificado, realizado: totalRealizado };
    };

    const calcularTotalTipo = (tipo: string) => {
      let totalPlanificado = 0;
      let totalRealizado = 0;
      for (let mes = 1; mes <= 12; mes++) {
        totalPlanificado += datosTabla[mes][tipo].planificado;
        totalRealizado += datosTabla[mes][tipo].realizado;
      }
      return { planificado: totalPlanificado, realizado: totalRealizado };
    };

    const calcularTotalGeneral = () => {
      let totalPlanificado = 0;
      let totalRealizado = 0;
      for (let mes = 1; mes <= 12; mes++) {
        const totales = calcularTotalMes(mes);
        totalPlanificado += totales.planificado;
        totalRealizado += totales.realizado;
      }
      return { planificado: totalPlanificado, realizado: totalRealizado };
    };

    const totalesGenerales = calcularTotalGeneral();
    const porcentajeCumplimiento =
      totalesGenerales.planificado > 0
        ? Math.round(
            (totalesGenerales.realizado / totalesGenerales.planificado) * 100
          )
        : 0;

    // Resumen ejecutivo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Ejecutivo", 14, 40);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let yPos = 50;
    doc.text(
      `Total Planificado: ${totalesGenerales.planificado} mantenimientos`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(
      `Total Realizado: ${totalesGenerales.realizado} mantenimientos`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(
      `Pendientes: ${
        totalesGenerales.planificado - totalesGenerales.realizado
      } mantenimientos`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(`Cumplimiento General: ${porcentajeCumplimiento}%`, 20, yPos);
    yPos += 15;

    // Estadísticas por tipo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Estadísticas por Tipo de Activo", 14, yPos);
    yPos += 10;

    const datosEstadisticas = tiposArray.map((tipo) => {
      const totales = calcularTotalTipo(tipo);
      const porcentaje =
        totales.planificado > 0
          ? Math.round((totales.realizado / totales.planificado) * 100)
          : 0;
      return [
        tipo,
        totales.planificado.toString(),
        totales.realizado.toString(),
        (totales.planificado - totales.realizado).toString(),
        `${porcentaje}%`,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [
        [
          "Tipo de Activo",
          "Planificado",
          "Realizado",
          "Pendiente",
          "Cumplimiento",
        ],
      ],
      body: datosEstadisticas,
      theme: "striped",
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
      },
    });

    // Estadísticas por mes
    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Cumplimiento Mensual", 14, yPos);
    yPos += 10;

    const datosMensuales = MESES.map((mes, index) => {
      const mesNum = index + 1;
      const totales = calcularTotalMes(mesNum);
      const porcentaje =
        totales.planificado > 0
          ? Math.round((totales.realizado / totales.planificado) * 100)
          : 0;
      return [
        mes,
        totales.planificado.toString(),
        totales.realizado.toString(),
        (totales.planificado - totales.realizado).toString(),
        `${porcentaje}%`,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [["Mes", "Planificado", "Realizado", "Pendiente", "Cumplimiento"]],
      body: datosMensuales,
      theme: "striped",
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
      },
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "UESVALLE - Sistema de Gestión de Activos",
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Guardar PDF
    doc.save(
      `Estadisticas_Planificacion_${
        planificacion.ano
      }_${new Date().getTime()}.pdf`
    );
  }
}

export const reportesPlanificacionPDFService =
  new ReportesPlanificacionPDFService();
