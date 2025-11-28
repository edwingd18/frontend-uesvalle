"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Download,
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { reportesPlanificacionPDFService } from "../services/reportes-planificacion-pdf-service";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

interface VisualizarPlanificacionPorTipoProps {
  planificacion: any;
  onEdit?: () => void;
  readOnly?: boolean;
}

export function VisualizarPlanificacionPorTipo({
  planificacion,
  onEdit,
  readOnly = false,
}: VisualizarPlanificacionPorTipoProps) {
  if (!planificacion) return null;

  // Extraer todos los tipos únicos
  const todosLosTipos = new Set<string>();
  planificacion.meses?.forEach((mes: any) => {
    mes.cuotas?.forEach((cuota: any) => {
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

  planificacion.meses?.forEach((mes: any) => {
    mes.cuotas?.forEach((cuota: any) => {
      datosTabla[mes.mes][cuota.tipo] = {
        planificado: cuota.planificado || 0,
        realizado: cuota.realizado || 0,
      };
    });
  });

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

  // Datos para gráficos
  const datosGraficoBarras = {
    labels: tiposArray,
    datasets: [
      {
        label: "Planificado",
        data: tiposArray.map((tipo) => calcularTotalTipo(tipo).planificado),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Realizado",
        data: tiposArray.map((tipo) => calcularTotalTipo(tipo).realizado),
        backgroundColor: "#10b981",
      },
    ],
  };

  const datosGraficoDona = {
    labels: ["Realizados", "Pendientes"],
    datasets: [
      {
        data: [
          totalesGenerales.realizado,
          totalesGenerales.planificado - totalesGenerales.realizado,
        ],
        backgroundColor: ["#10b981", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Datos para gráfica de cumplimiento por mes
  const datosGraficoCumplimiento = {
    labels: MESES,
    datasets: [
      {
        label: "Cumplimiento %",
        data: MESES.map((_, index) => {
          const mesNum = index + 1;
          const totales = calcularTotalMes(mesNum);
          return totales.planificado > 0
            ? Math.round((totales.realizado / totales.planificado) * 100)
            : 0;
        }),
        borderColor: "#ea580c",
        backgroundColor: "rgba(234, 88, 12, 0.1)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ea580c",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  // Calcular meses con mejor y peor cumplimiento
  const cumplimientoPorMes = MESES.map((nombre, index) => {
    const mesNum = index + 1;
    const totales = calcularTotalMes(mesNum);
    const porcentaje =
      totales.planificado > 0
        ? Math.round((totales.realizado / totales.planificado) * 100)
        : 0;
    return { mes: nombre, ...totales, porcentaje };
  }).filter((m) => m.planificado > 0);

  const mejoresMeses = [...cumplimientoPorMes]
    .sort((a, b) => b.porcentaje - a.porcentaje)
    .slice(0, 3);

  const peoresMeses = [...cumplimientoPorMes]
    .sort((a, b) => a.porcentaje - b.porcentaje)
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Planificación {planificacion.ano}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Seguimiento de mantenimientos por tipo de activo
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {!readOnly && onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              try {
                reportesPlanificacionPDFService.generarReportePlanificacion(
                  planificacion
                );
                toast.success("Reporte generado exitosamente");
              } catch (error) {
                toast.error("Error al generar el reporte");
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Reporte Detallado</span>
            <span className="sm:hidden">Detallado</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              try {
                reportesPlanificacionPDFService.generarReporteEstadisticas(
                  planificacion
                );
                toast.success("Reporte de estadísticas generado exitosamente");
              } catch (error) {
                toast.error("Error al generar el reporte");
              }
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Reporte Estadísticas</span>
            <span className="sm:hidden">Estadísticas</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="planificacion" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planificacion" className="text-xs sm:text-sm">
            <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Planificación Detallada</span>
            <span className="sm:hidden">Planificación</span>
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="text-xs sm:text-sm">
            <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Estadísticas</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Estadísticas */}
        <TabsContent
          value="estadisticas"
          className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
        >
          {/* Cards de resumen */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Planificado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold">
                  {totalesGenerales.planificado}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="hidden sm:inline">
                    Mantenimientos programados
                  </span>
                  <span className="sm:hidden">Programados</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Realizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-green-600">
                  {totalesGenerales.realizado}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="hidden sm:inline">
                    Mantenimientos completados
                  </span>
                  <span className="sm:hidden">Completados</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-orange-600">
                  {totalesGenerales.planificado - totalesGenerales.realizado}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por realizar
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Cumplimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-blue-600">
                  {porcentajeCumplimiento}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Del total planificado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Mantenimientos por Tipo de Activo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <Bar
                    data={datosGraficoBarras}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 10 },
                        },
                      },
                      plugins: {
                        legend: { position: "bottom" as const },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Progreso General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <Doughnut
                    data={datosGraficoDona}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "bottom" as const },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfica de Cumplimiento por Mes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                <span className="hidden sm:inline">
                  Tendencia de Cumplimiento Mensual
                </span>
                <span className="sm:hidden">Cumplimiento Mensual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <Line
                  data={datosGraficoCumplimiento}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: (value) => value + "%",
                        },
                      },
                    },
                    plugins: {
                      legend: { position: "bottom" as const },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `Cumplimiento: ${context.parsed.y}%`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mejores y Peores Meses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="hidden sm:inline">
                    Meses con Mejor Cumplimiento
                  </span>
                  <span className="sm:hidden">Mejores Meses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {mejoresMeses.map((mes, index) => (
                    <div
                      key={mes.mes}
                      className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-xs sm:text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm sm:text-base">
                          {mes.mes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {mes.realizado}/{mes.planificado}
                        </span>
                        <Badge
                          variant="default"
                          className="bg-green-600 text-xs"
                        >
                          {mes.porcentaje}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  <span className="hidden sm:inline">
                    Meses con Menor Cumplimiento
                  </span>
                  <span className="sm:hidden">Peores Meses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {peoresMeses.map((mes, index) => (
                    <div
                      key={mes.mes}
                      className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs sm:text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm sm:text-base">
                          {mes.mes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {mes.realizado}/{mes.planificado}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {mes.porcentaje}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Resumen por Tipo de Activo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {tiposArray.map((tipo) => {
                  const totales = calcularTotalTipo(tipo);
                  const porcentaje =
                    totales.planificado > 0
                      ? Math.round(
                          (totales.realizado / totales.planificado) * 100
                        )
                      : 0;

                  return (
                    <div
                      key={tipo}
                      className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-medium text-center mb-1 sm:mb-2 break-words">
                        {tipo}
                      </span>
                      <div className="text-lg sm:text-2xl font-bold mb-1">
                        {totales.realizado}/{totales.planificado}
                      </div>
                      <Badge
                        variant={
                          porcentaje >= 80
                            ? "default"
                            : porcentaje >= 50
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {porcentaje}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Planificación Detallada */}
        <TabsContent value="planificacion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Planificación Mensual por Tipo de Activo</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto flex justify-center">
              <div className="w-[280px] sm:w-full md:w-[700px] lg:w-full">
                <table className="w-full border-collapse table-fixed min-w-[800px] md:min-w-full">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted font-semibold text-left w-[10%]">
                        Tipo
                      </th>
                      {MESES.map((mes, index) => (
                        <th
                          key={index}
                          className="border p-1 bg-muted font-semibold text-center"
                        >
                          <span className="text-[10px]">{mes}</span>
                        </th>
                      ))}
                      <th className="border p-2 bg-muted font-semibold text-center w-[8%]">
                        <span className="text-xs">Total</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiposArray.map((tipo) => {
                      const totalesTipo = calcularTotalTipo(tipo);
                      const porcentajeTipo =
                        totalesTipo.planificado > 0
                          ? Math.round(
                              (totalesTipo.realizado /
                                totalesTipo.planificado) *
                                100
                            )
                          : 0;

                      return (
                        <tr key={tipo} className="hover:bg-muted/50">
                          <td className="border p-1 sm:p-2 font-medium bg-muted/30 text-xs sm:text-sm">
                            <span className="break-words">{tipo}</span>
                          </td>
                          {MESES.map((mes, index) => {
                            const mesNum = index + 1;
                            const datos = datosTabla[mesNum][tipo];
                            const tieneDatos =
                              datos.planificado > 0 || datos.realizado > 0;
                            const porcentaje =
                              datos.planificado > 0
                                ? Math.min(
                                    (datos.realizado / datos.planificado) * 100,
                                    100
                                  )
                                : 0;

                            return (
                              <td
                                key={mesNum}
                                className="border p-0.5 sm:p-1 text-center"
                              >
                                {tieneDatos ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                      {datos.realizado}/{datos.planificado}
                                    </span>
                                    {datos.planificado > 0 && (
                                      <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                                        <div
                                          className="bg-green-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${porcentaje}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="border p-2 text-center font-semibold bg-muted/30">
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                variant={
                                  totalesTipo.planificado > 0
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {totalesTipo.realizado}/
                                {totalesTipo.planificado}
                              </Badge>
                              {totalesTipo.planificado > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {porcentajeTipo}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted font-bold">
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm bg-muted">
                        Total
                      </td>
                      {MESES.map((mes, index) => {
                        const mesNum = index + 1;
                        const totalesMes = calcularTotalMes(mesNum);
                        return (
                          <td
                            key={mesNum}
                            className="border p-0.5 sm:p-2 text-center"
                          >
                            <Badge
                              variant="default"
                              className="text-[10px] sm:text-xs"
                            >
                              {totalesMes.realizado}/{totalesMes.planificado}
                            </Badge>
                          </td>
                        );
                      })}
                      <td className="border p-1 sm:p-2 text-center bg-muted">
                        <Badge variant="default" className="text-xs sm:text-sm">
                          {totalesGenerales.realizado}/
                          {totalesGenerales.planificado}
                        </Badge>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
