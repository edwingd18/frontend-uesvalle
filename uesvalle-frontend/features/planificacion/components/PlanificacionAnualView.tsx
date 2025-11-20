"use client";

import React, { useState, useMemo } from "react";
import { usePlanificacion } from "../hooks/usePlanificacion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pencil,
  Save,
  X,
  Plus,
  BarChart3,
  Calendar,
  TrendingUp,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { CrearPlanificacionModal } from "./CrearPlanificacionModal";
import { ReportesPlanificacionModal } from "./ReportesPlanificacionModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import {
  Bar as ChartJSBar,
  Line as ChartJSLine,
  Pie as ChartJSPie,
} from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
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

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

interface PlanificacionAnualViewProps {
  anoInicial?: number;
}

export function PlanificacionAnualView({
  anoInicial = new Date().getFullYear(),
}: PlanificacionAnualViewProps) {
  const [ano, setAno] = useState(anoInicial);
  const [editingMes, setEditingMes] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    planificados: 0,
    realizados: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportesModalOpen, setReportesModalOpen] = useState(false);

  const {
    planificacion,
    loading,
    error,
    refetch,
    createPlanificacion,
    updatePlanificacion,
  } = usePlanificacion(ano);

  const handleEditMes = (
    mes: number,
    planificados: number,
    realizados: number
  ) => {
    setEditingMes(mes);
    setEditValues({ planificados, realizados });
  };

  const handleSaveMes = async () => {
    if (!planificacion) return;

    try {
      const mesesActualizados = planificacion.meses.map((m) =>
        m.mes === editingMes
          ? {
              ...m,
              planificados: editValues.planificados,
              realizados: editValues.realizados,
            }
          : m
      );

      await updatePlanificacion({ meses: mesesActualizados });
      setEditingMes(null);
      toast.success("Mes actualizado correctamente");
    } catch (err) {
      toast.error("Error al actualizar el mes");
    }
  };

  const handleCancelEdit = () => {
    setEditingMes(null);
  };

  const handleCreatePlanificacion = async (
    meses: Array<{ mes: number; planificados: number; realizados: number }>
  ) => {
    try {
      const nuevaPlanificacion = await createPlanificacion({
        ano,
        meses,
      });

      console.log("Planificación creada:", nuevaPlanificacion);
      setShowCreateModal(false);
      toast.success("Planificación creada correctamente");
    } catch (err) {
      console.error("Error al crear planificación:", err);
      toast.error("Error al crear la planificación");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Cargando planificación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No existe planificación para el año {ano}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Planificación {ano}
              </Button>
            </div>
          </CardContent>
        </Card>

        <CrearPlanificacionModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          ano={ano}
          onConfirm={handleCreatePlanificacion}
        />
      </>
    );
  }

  const totalPlanificados =
    planificacion?.meses?.reduce((sum, m) => sum + m.planificados, 0) || 0;
  const totalRealizados =
    planificacion?.meses?.reduce((sum, m) => sum + m.realizados, 0) || 0;

  // Preparar datos para gráficos - CREAR array ordenado desde cero (1-12)
  const prepararChartData = () => {
    if (!planificacion?.meses) return [];

    // Crear un mapa de los datos por mes
    const mesesMap = new Map<
      number,
      { planificados: number; realizados: number }
    >();
    planificacion.meses.forEach((mes) => {
      mesesMap.set(mes.mes, {
        planificados: mes.planificados,
        realizados: mes.realizados,
      });
    });

    // Crear array ordenado de 1 a 12 (Enero a Diciembre)
    return Array.from({ length: 12 }, (_, index) => {
      const mesNum = index + 1;
      const datos = mesesMap.get(mesNum) || { planificados: 0, realizados: 0 };
      return {
        mes: MESES_CORTOS[index],
        mesNumero: mesNum,
        planificados: datos.planificados,
        realizados: datos.realizados,
        cumplimiento:
          datos.planificados > 0
            ? Math.round((datos.realizados / datos.planificados) * 100)
            : 0,
      };
    });
  };

  let chartData = prepararChartData();
  // Forzar ordenamiento adicional por si acaso
  chartData = [...chartData].sort((a, b) => a.mesNumero - b.mesNumero);

  // Crear una key única para forzar re-render del gráfico
  const chartKey = `chart-${ano}-${Date.now()}-${chartData
    .map((d) => d.mesNumero)
    .join("-")}`;

  console.log("=== DEBUG ORDEN DE MESES ===");
  console.log(
    "Meses originales del backend:",
    planificacion?.meses?.map((m) => `${m.mes}`)
  );
  console.log(
    "ChartData ordenado:",
    chartData.map((d) => `${d.mesNumero}-${d.mes}`)
  );
  console.log("Chart Key:", chartKey);
  console.log("===========================");

  const pieData = [
    {
      name: "Realizados",
      value: totalRealizados,
      color: "#10b981",
    },
    {
      name: "Pendientes",
      value: totalPlanificados - totalRealizados,
      color: "#f59e0b",
    },
  ];

  return (
    <>
      <CrearPlanificacionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        ano={ano}
        onConfirm={handleCreatePlanificacion}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Planificación Anual</h2>
            <p className="text-muted-foreground">
              Gestiona los mantenimientos planificados para el año {ano}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setReportesModalOpen(true)}
              disabled={!planificacion}
            >
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
            <Label htmlFor="ano">Año:</Label>
            <Input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Planificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlanificados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalRealizados}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalPlanificados > 0
                  ? `${Math.round(
                      (totalRealizados / totalPlanificados) * 100
                    )}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendario">
              <Calendar className="mr-2 h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="graficos">
              <BarChart3 className="mr-2 h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="analisis">
              <TrendingUp className="mr-2 h-4 w-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mantenimientos por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {planificacion?.meses
                    ? [...planificacion.meses]
                        .sort((a, b) => a.mes - b.mes)
                        .map((mes) => (
                          <div
                            key={mes.mes}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {MESES[mes.mes - 1]}
                              </p>
                            </div>

                            {editingMes === mes.mes ? (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`plan-${mes.mes}`}
                                    className="text-sm"
                                  >
                                    Planificados:
                                  </Label>
                                  <Input
                                    id={`plan-${mes.mes}`}
                                    type="number"
                                    min="0"
                                    value={editValues.planificados}
                                    onChange={(e) =>
                                      setEditValues({
                                        ...editValues,
                                        planificados: Number(e.target.value),
                                      })
                                    }
                                    className="w-20"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`real-${mes.mes}`}
                                    className="text-sm"
                                  >
                                    Realizados:
                                  </Label>
                                  <Input
                                    id={`real-${mes.mes}`}
                                    type="number"
                                    min="0"
                                    value={editValues.realizados}
                                    onChange={(e) =>
                                      setEditValues({
                                        ...editValues,
                                        realizados: Number(e.target.value),
                                      })
                                    }
                                    className="w-20"
                                  />
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={handleSaveMes}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-6">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Planificados:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {mes.planificados}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Realizados:
                                  </span>{" "}
                                  <span className="font-medium text-green-600">
                                    {mes.realizados}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Cumplimiento:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {mes.planificados > 0
                                      ? `${Math.round(
                                          (mes.realizados / mes.planificados) *
                                            100
                                        )}%`
                                      : "0%"}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleEditMes(
                                      mes.mes,
                                      mes.planificados,
                                      mes.realizados
                                    )
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                    : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graficos" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Planificados vs Realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: "300px" }}>
                    <ChartJSBar
                      data={{
                        labels: chartData.map((d) => d.mes),
                        datasets: [
                          {
                            label: "Planificados",
                            data: chartData.map((d) => d.planificados),
                            backgroundColor: "#3b82f6",
                          },
                          {
                            label: "Realizados",
                            data: chartData.map((d) => d.realizados),
                            backgroundColor: "#10b981",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "bottom" as const,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progreso General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: "300px" }}>
                    <ChartJSPie
                      data={{
                        labels: pieData.map((d) => d.name),
                        datasets: [
                          {
                            data: pieData.map((d) => d.value),
                            backgroundColor: pieData.map((d) => d.color),
                            borderWidth: 2,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom" as const,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Tendencia de Cumplimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: "300px" }}>
                    <ChartJSLine
                      data={{
                        labels: chartData.map((d) => d.mes),
                        datasets: [
                          {
                            label: "Cumplimiento %",
                            data: chartData.map((d) => d.cumplimiento),
                            borderColor: "#ea580c",
                            backgroundColor: "rgba(234, 88, 12, 0.1)",
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                          },
                        ],
                      }}
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
                          legend: {
                            position: "bottom" as const,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.parsed.y}%`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analisis" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Estadístico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Planificados</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalPlanificados}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Total Realizados</span>
                    <span className="text-2xl font-bold text-green-600">
                      {totalRealizados}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Pendientes</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {totalPlanificados - totalRealizados}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Promedio Mensual</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {Math.round(totalPlanificados / 12)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Meses con Mejor Cumplimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chartData
                      .sort((a, b) => b.cumplimiento - a.cumplimiento)
                      .slice(0, 5)
                      .map((mes, index) => (
                        <div
                          key={mes.mes}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                              {index + 1}
                            </div>
                            <span className="font-medium">{mes.mes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {mes.realizados}/{mes.planificados}
                            </span>
                            <span className="font-bold text-green-600">
                              {mes.cumplimiento}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ReportesPlanificacionModal
        open={reportesModalOpen}
        onOpenChange={setReportesModalOpen}
        planificacion={planificacion}
      />
    </>
  );
}
