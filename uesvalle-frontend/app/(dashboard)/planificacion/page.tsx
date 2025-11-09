"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Plus,
  Download,
  BarChart3,
  Edit,
  Shield,
  Wrench as WrenchIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const currentYear = new Date().getFullYear();

const meses = [
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

const planificacionMock = {
  año: currentYear,
  totalPlanificado: 48,
  totalRealizado: 32,
  porMes: [
    {
      mes: "Enero",
      planificado: 4,
      realizado: 4,
      preventivo: 3,
      correctivo: 1,
    },
    {
      mes: "Febrero",
      planificado: 4,
      realizado: 3,
      preventivo: 2,
      correctivo: 1,
    },
    {
      mes: "Marzo",
      planificado: 4,
      realizado: 4,
      preventivo: 3,
      correctivo: 1,
    },
    {
      mes: "Abril",
      planificado: 4,
      realizado: 3,
      preventivo: 2,
      correctivo: 1,
    },
    { mes: "Mayo", planificado: 4, realizado: 2, preventivo: 1, correctivo: 1 },
    {
      mes: "Junio",
      planificado: 4,
      realizado: 3,
      preventivo: 2,
      correctivo: 1,
    },
    {
      mes: "Julio",
      planificado: 4,
      realizado: 3,
      preventivo: 2,
      correctivo: 1,
    },
    {
      mes: "Agosto",
      planificado: 4,
      realizado: 3,
      preventivo: 2,
      correctivo: 1,
    },
    {
      mes: "Septiembre",
      planificado: 4,
      realizado: 2,
      preventivo: 1,
      correctivo: 1,
    },
    {
      mes: "Octubre",
      planificado: 4,
      realizado: 3,
      preventivo: 2,
      correctivo: 1,
    },
    {
      mes: "Noviembre",
      planificado: 4,
      realizado: 2,
      preventivo: 1,
      correctivo: 1,
    },
    {
      mes: "Diciembre",
      planificado: 4,
      realizado: 0,
      preventivo: 0,
      correctivo: 0,
    },
  ],
};

export default function PlanificacionPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [hasPlan, setHasPlan] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<any>(null);

  const cumplimiento = Math.round(
    (planificacionMock.totalRealizado / planificacionMock.totalPlanificado) *
      100
  );
  const pendientes =
    planificacionMock.totalPlanificado - planificacionMock.totalRealizado;

  const chartData = planificacionMock.porMes.map((mes) => ({
    mes: mes.mes.substring(0, 3),
    planificado: mes.planificado,
    realizado: mes.realizado,
  }));

  const tipoData = [
    { name: "Preventivo", value: 28, color: "#3B82F6" },
    { name: "Correctivo", value: 12, color: "#EF4444" },
    { name: "Predictivo", value: 8, color: "#8B5CF6" },
  ];

  // Estado vacío
  if (!hasPlan) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-orange-600" />
              Planificación Anual de Mantenimientos
            </h1>
            <p className="text-muted-foreground mt-1">
              Crea tu plan anual de mantenimientos para {selectedYear}
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <CalendarIcon className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No hay plan para {selectedYear}
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Crea un plan anual de mantenimientos para organizar y dar
              seguimiento a todos los mantenimientos preventivos y correctivos
              del año.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Crear Plan Anual {selectedYear}
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Plan Anual {selectedYear}</DialogTitle>
              <DialogDescription>
                Define cuántos mantenimientos planeas realizar cada mes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
              {meses.map((mes) => (
                <div key={mes} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="font-semibold">{mes}</Label>
                  <div>
                    <Label className="text-xs text-gray-600">Preventivos</Label>
                    <Input
                      type="number"
                      min="0"
                      defaultValue="2"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Correctivos</Label>
                    <Input
                      type="number"
                      min="0"
                      defaultValue="1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Predictivos</Label>
                    <Input
                      type="number"
                      min="0"
                      defaultValue="1"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  setHasPlan(true);
                  setShowCreateModal(false);
                }}
              >
                Crear Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-orange-600" />
            Planificación Anual de Mantenimientos
          </h1>
          <p className="text-muted-foreground mt-1">
            Planifica y da seguimiento a los mantenimientos del año{" "}
            {selectedYear}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Plan
          </Button>
          <Button
            onClick={() => {
              setSelectedMonth(null);
              setShowEditModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Plan
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Planificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {planificacionMock.totalPlanificado}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              mantenimientos en {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {planificacionMock.totalRealizado}
            </div>
            <p className="text-xs text-gray-600 mt-1">completados hasta hoy</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendientes}
            </div>
            <p className="text-xs text-gray-600 mt-1">por realizar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {cumplimiento}%
            </div>
            <p className="text-xs text-gray-600 mt-1">del plan anual</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendario" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendario">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Vista Calendario
          </TabsTrigger>
          <TabsTrigger value="grafico">
            <BarChart3 className="mr-2 h-4 w-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="tabla">Tabla Detallada</TabsTrigger>
        </TabsList>

        {/* Vista Calendario */}
        <TabsContent value="calendario" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma Mensual {selectedYear}</CardTitle>
              <CardDescription>
                Planificación y seguimiento mes a mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {planificacionMock.porMes.map((mes, index) => {
                  const porcentaje =
                    mes.planificado > 0
                      ? Math.round((mes.realizado / mes.planificado) * 100)
                      : 0;
                  const mesActual = new Date().getMonth() === index;

                  return (
                    <Card
                      key={mes.mes}
                      className={`relative overflow-hidden transition-all hover:shadow-lg ${
                        mesActual ? "ring-2 ring-orange-500" : ""
                      }`}
                    >
                      {mesActual && (
                        <div className="absolute top-0 right-0">
                          <Badge className="rounded-none rounded-bl-lg bg-orange-600">
                            Mes Actual
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{mes.mes}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {mes.planificado}
                            </div>
                            <div className="text-xs text-gray-600">
                              Planificado
                            </div>
                          </div>
                          <div className="text-2xl text-gray-300">→</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {mes.realizado}
                            </div>
                            <div className="text-xs text-gray-600">
                              Realizado
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progreso</span>
                            <span className="font-semibold">{porcentaje}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                porcentaje >= 100
                                  ? "bg-green-500"
                                  : porcentaje >= 75
                                  ? "bg-blue-500"
                                  : porcentaje >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 text-xs">
                          <Badge
                            variant="outline"
                            className="flex-1 justify-center gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            {mes.preventivo}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="flex-1 justify-center gap-1"
                          >
                            <WrenchIcon className="h-3 w-3" />
                            {mes.correctivo}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedMonth(mes);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          Ajustar
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Gráficos */}
        <TabsContent value="grafico" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Planificado vs Realizado</CardTitle>
                <CardDescription>Comparación mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="planificado"
                      fill="#3B82F6"
                      name="Planificado"
                    />
                    <Bar dataKey="realizado" fill="#10B981" name="Realizado" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Líneas */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Anual</CardTitle>
                <CardDescription>Evolución del cumplimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="planificado"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Planificado"
                    />
                    <Line
                      type="monotone"
                      dataKey="realizado"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Realizado"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pastel */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>Mantenimientos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tipoData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tipoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Estadísticas adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Año</CardTitle>
                <CardDescription>Resumen general</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Preventivos</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">28</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <WrenchIcon className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Correctivos</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Predictivos</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">8</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista Tabla */}
        <TabsContent value="tabla" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tabla Detallada</CardTitle>
              <CardDescription>
                Vista completa de la planificación mensual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Mes</th>
                      <th className="text-center p-3 font-semibold">
                        Planificado
                      </th>
                      <th className="text-center p-3 font-semibold">
                        Realizado
                      </th>
                      <th className="text-center p-3 font-semibold">
                        Preventivo
                      </th>
                      <th className="text-center p-3 font-semibold">
                        Correctivo
                      </th>
                      <th className="text-center p-3 font-semibold">
                        Cumplimiento
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {planificacionMock.porMes.map((mes) => {
                      const porcentaje =
                        mes.planificado > 0
                          ? Math.round((mes.realizado / mes.planificado) * 100)
                          : 0;

                      return (
                        <tr key={mes.mes} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{mes.mes}</td>
                          <td className="p-3 text-center">{mes.planificado}</td>
                          <td className="p-3 text-center font-semibold text-green-600">
                            {mes.realizado}
                          </td>
                          <td className="p-3 text-center">{mes.preventivo}</td>
                          <td className="p-3 text-center">{mes.correctivo}</td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={
                                porcentaje >= 100 ? "default" : "secondary"
                              }
                              className={
                                porcentaje >= 100 ? "bg-green-600" : ""
                              }
                            >
                              {porcentaje}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-3">TOTAL</td>
                      <td className="p-3 text-center">
                        {planificacionMock.totalPlanificado}
                      </td>
                      <td className="p-3 text-center text-green-600">
                        {planificacionMock.totalRealizado}
                      </td>
                      <td className="p-3 text-center" colSpan={2}>
                        -
                      </td>
                      <td className="p-3 text-center">
                        <Badge className="bg-purple-600">{cumplimiento}%</Badge>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de editar plan completo o mes individual */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMonth
                ? `Editar ${selectedMonth.mes}`
                : `Editar Plan Anual ${selectedYear}`}
            </DialogTitle>
            <DialogDescription>
              {selectedMonth
                ? "Ajusta la planificación para este mes"
                : "Modifica la planificación de todos los meses"}
            </DialogDescription>
          </DialogHeader>

          {selectedMonth ? (
            // Editar un solo mes
            <div className="space-y-4 py-4">
              <div>
                <Label>Mantenimientos Preventivos</Label>
                <Input
                  type="number"
                  min="0"
                  defaultValue={selectedMonth.preventivo || 0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Mantenimientos Correctivos</Label>
                <Input
                  type="number"
                  min="0"
                  defaultValue={selectedMonth.correctivo || 0}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            // Editar todos los meses
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
              {planificacionMock.porMes.map((mes) => (
                <div
                  key={mes.mes}
                  className="grid grid-cols-4 gap-4 items-center p-3 bg-gray-50 rounded-lg"
                >
                  <Label className="font-semibold">{mes.mes}</Label>
                  <div>
                    <Label className="text-xs text-gray-600">Preventivos</Label>
                    <Input
                      type="number"
                      min="0"
                      defaultValue={mes.preventivo}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Correctivos</Label>
                    <Input
                      type="number"
                      min="0"
                      defaultValue={mes.correctivo}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-center">
                    <Label className="text-xs text-gray-600">Total</Label>
                    <div className="text-lg font-bold text-blue-600 mt-1">
                      {mes.planificado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedMonth(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                setShowEditModal(false);
                setSelectedMonth(null);
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
