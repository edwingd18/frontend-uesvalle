"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  MapPin,
  User,
  Wrench,
  Download,
  Cpu,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { activosService } from "@/features/inventario/services/activos-service";
import { mantenimientosService } from "@/features/mantenimientos/services/mantenimientos-service";
import { Activo } from "@/shared/types/inventario";
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { showToast } from "@/shared/lib/toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ActivoFormModal } from "@/features/inventario/components/activo-form-modal";
import { DeleteActivoDialog } from "@/features/inventario/components/delete-activo-dialog";
import { useUsuarios } from "@/shared/hooks/use-usuarios";
import { sedes } from "@/mocks/inventario";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    bueno: { variant: "default", className: "bg-green-600" },
    regular: { variant: "secondary", className: "" },
    malo: { variant: "destructive", className: "" },
    mantenimiento: {
      variant: "outline",
      className: "border-orange-500 text-orange-700",
    },
    baja: { variant: "destructive", className: "bg-red-800" },
  };
  return variants[estado.toLowerCase()] || variants.regular;
};

export default function ActivoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getUsuarioNombre } = useUsuarios();
  const [activo, setActivo] = useState<Activo | null>(null);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [traslados, setTraslados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getSedeNombre = (sedeId: number) => {
    return sedes.find((sede) => sede.id === sedeId)?.nombre || `Sede ${sedeId}`;
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const id = Number(params.id);

      // Cargar activo
      const activoData = await activosService.getActivo(id);
      setActivo(activoData);

      // Cargar hoja de vida (incluye mantenimientos y traslados)
      try {
        const hojaVida = await activosService.getHojaVida(id);
        setMantenimientos(hojaVida.historial_mantenimientos || []);
        setTraslados(hojaVida.historial_traslados || []);
      } catch (error) {
        // Si falla, intentar cargar mantenimientos individualmente
        try {
          const mantenimientosData =
            await mantenimientosService.getMantenimientosByActivo(id);
          setMantenimientos(mantenimientosData);
        } catch (mantError) {
          setMantenimientos([]);
        }
        setTraslados([]);
      }
    } catch (error) {
      showToast.error("Error al cargar el activo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    router.push("/inventario");
  };

  const generarPDF = () => {
    if (!activo) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.text("Hoja de Vida del Activo", 14, yPos);
    yPos += 10;

    // Información del activo
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 10;

    // Placa y Estado
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${activo.placa}`, 14, yPos);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Estado: ${activo.estado.toUpperCase()}`, 150, yPos);
    yPos += 10;

    // Información General
    doc.setFontSize(14);
    doc.setTextColor(234, 88, 12);
    doc.text("Información General", 14, yPos);
    yPos += 8;

    const infoGeneral = [
      ["Serial", activo.serial],
      ["Tipo", activo.tipo],
      ["Marca", activo.marca],
      ["Modelo", activo.modelo],
      ["Sede", getSedeNombre(activo.sede_id)],
      ["Proceso", activo.proceso],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: infoGeneral,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [100, 100, 100], cellWidth: 40 },
        1: { textColor: [0, 0, 0] },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Especificaciones Técnicas (si existen)
    if (
      activo.especificaciones &&
      (activo.tipo.toLowerCase() === "computador" ||
        activo.tipo.toLowerCase() === "portatil")
    ) {
      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12);
      doc.text("Especificaciones Técnicas", 14, yPos);
      yPos += 8;

      const especificaciones = [
        ["Procesador", activo.especificaciones.procesador || "N/A"],
        [
          "Velocidad CPU",
          activo.especificaciones.velocidad_cpu_ghz
            ? `${activo.especificaciones.velocidad_cpu_ghz} GHz`
            : "N/A",
        ],
        [
          "Memoria RAM",
          activo.especificaciones.ram_gb
            ? `${activo.especificaciones.ram_gb} GB`
            : "N/A",
        ],
        [
          "Almacenamiento",
          activo.especificaciones.almacenamiento_gb
            ? `${activo.especificaciones.almacenamiento_gb} GB`
            : "N/A",
        ],
        ["Tipo de Disco", activo.especificaciones.tipo_disco || "N/A"],
        ["Sistema Operativo", activo.especificaciones.so || "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: especificaciones,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [100, 100, 100], cellWidth: 40 },
          1: { textColor: [0, 0, 0] },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Mantenimientos
    if (mantenimientos.length > 0) {
      // Verificar si necesitamos una nueva página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12);
      doc.text(
        `Historial de Mantenimientos (${mantenimientos.length})`,
        14,
        yPos
      );
      yPos += 8;

      const mantData = mantenimientos.map((mant) => [
        format(new Date(mant.fecha), "dd/MM/yyyy"),
        mant.tipo,
        getUsuarioNombre(mant.tecnico_id),
        getUsuarioNombre(mant.encargado_harware_id),
        getUsuarioNombre(mant.encargado_software_id),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Fecha", "Tipo", "Técnico", "Hardware", "Software"]],
        body: mantData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Traslados
    if (traslados.length > 0) {
      // Verificar si necesitamos una nueva página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12);
      doc.text(`Historial de Traslados (${traslados.length})`, 14, yPos);
      yPos += 8;

      const trasladosData = traslados.map((traslado) => [
        format(new Date(traslado.fecha), "dd/MM/yyyy"),
        traslado.sede_origen?.nombre || `Sede ${traslado.sede_origen_id}`,
        traslado.sede_destino?.nombre || `Sede ${traslado.sede_destino_id}`,
        traslado.motivo || "N/A",
        traslado.solicitado_por?.nombre ||
          getUsuarioNombre(traslado.solicitado_por_id),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Fecha", "Origen", "Destino", "Motivo", "Solicitado por"]],
        body: trasladosData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          3: { cellWidth: 50 },
        },
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
    const fileName = `hoja_vida_${activo.placa}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!activo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Activo no encontrado
        </h2>
        <Button onClick={() => router.push("/inventario")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inventario
        </Button>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(activo.estado);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/inventario")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {activo.placa}
                  </h1>
                  <Badge
                    variant={estadoBadge.variant}
                    className={estadoBadge.className}
                  >
                    {activo.estado.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  {activo.marca} {activo.modelo} • {activo.tipo}
                </p>
              </div>
            </div>

            <div
              className="flex gap-2 animate-slide-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={generarPDF}
                className="shine-effect hover:scale-105 transition-transform"
              >
                <Download className="mr-2 h-4 w-4" />
                Generar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="hover:scale-105 transition-transform"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="hover:scale-105 transition-transform"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Info Principal */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="animate-fade-in card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Serial
                  </label>
                  <p className="text-sm font-mono mt-0.5 font-medium">
                    {activo.serial}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tipo
                  </label>
                  <p className="text-sm capitalize mt-0.5 font-medium">
                    {activo.tipo}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Marca
                    </label>
                    <p className="text-sm mt-0.5 font-medium">{activo.marca}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Modelo
                    </label>
                    <p className="text-sm mt-0.5 font-medium">
                      {activo.modelo}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-fade-in card-hover"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Sede
                  </label>
                  <p className="text-sm mt-0.5 font-medium">
                    {getSedeNombre(activo.sede_id)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Proceso
                  </label>
                  <p className="text-sm capitalize mt-0.5 font-medium">
                    {activo.proceso}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Especificaciones Técnicas (PC/Portátil) */}
            {activo.especificaciones &&
              (activo.tipo.toLowerCase() === "computador" ||
                activo.tipo.toLowerCase() === "portatil") && (
                <Card
                  className="animate-fade-in card-hover"
                  style={{ animationDelay: "0.2s" }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-orange-600" />
                      Especificaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activo.especificaciones.procesador && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Procesador
                        </label>
                        <p className="text-sm mt-0.5 font-medium">
                          {activo.especificaciones.procesador}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {activo.especificaciones.ram_gb && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            RAM
                          </label>
                          <p className="text-sm mt-0.5 font-medium">
                            {activo.especificaciones.ram_gb} GB
                          </p>
                        </div>
                      )}
                      {activo.especificaciones.velocidad_cpu_ghz && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            CPU
                          </label>
                          <p className="text-sm mt-0.5 font-medium">
                            {activo.especificaciones.velocidad_cpu_ghz} GHz
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {activo.especificaciones.almacenamiento_gb && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Disco
                          </label>
                          <p className="text-sm mt-0.5 font-medium">
                            {activo.especificaciones.almacenamiento_gb} GB
                          </p>
                        </div>
                      )}
                      {activo.especificaciones.tipo_disco && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Tipo
                          </label>
                          <p className="text-sm mt-0.5 font-medium">
                            {activo.especificaciones.tipo_disco}
                          </p>
                        </div>
                      )}
                    </div>

                    {activo.especificaciones.so && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Sistema Operativo
                        </label>
                        <p className="text-sm mt-0.5 font-medium">
                          {activo.especificaciones.so}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="mantenimientos" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mantenimientos">
                  <Wrench className="mr-2 h-4 w-4" />
                  Mantenimientos
                </TabsTrigger>
                <TabsTrigger value="historial">
                  <Calendar className="mr-2 h-4 w-4" />
                  Historial
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mantenimientos" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Historial de Mantenimientos</CardTitle>
                      <CardDescription>
                        {mantenimientos.length} mantenimiento(s) registrado(s)
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(`/mantenimientos?activo=${activo.id}`)
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      Programar Mantenimiento
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {mantenimientos.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                        <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Sin mantenimientos registrados
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Este activo aún no tiene mantenimientos programados o
                          realizados
                        </p>
                        <Button
                          onClick={() =>
                            router.push(`/mantenimientos?activo=${activo.id}`)
                          }
                          variant="outline"
                        >
                          <Wrench className="mr-2 h-4 w-4" />
                          Programar primer mantenimiento
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mantenimientos
                          .sort(
                            (a, b) =>
                              new Date(b.fecha).getTime() -
                              new Date(a.fecha).getTime()
                          )
                          .map((mant) => {
                            const getTipoBadge = (tipo: string) => {
                              switch (tipo) {
                                case "preventivo":
                                  return {
                                    variant: "default" as const,
                                    color:
                                      "bg-blue-100 text-blue-700 border-blue-200",
                                  };
                                case "correctivo":
                                  return {
                                    variant: "destructive" as const,
                                    color:
                                      "bg-red-100 text-red-700 border-red-200",
                                  };
                                case "predictivo":
                                  return {
                                    variant: "secondary" as const,
                                    color:
                                      "bg-purple-100 text-purple-700 border-purple-200",
                                  };
                                default:
                                  return {
                                    variant: "outline" as const,
                                    color: "",
                                  };
                              }
                            };

                            const tipoBadge = getTipoBadge(mant.tipo);

                            return (
                              <div
                                key={mant.id}
                                className="flex items-start gap-4 p-5 border-2 rounded-xl hover:border-orange-300 hover:shadow-md transition-all cursor-pointer bg-white"
                                onClick={() =>
                                  router.push(`/mantenimientos/${mant.id}`)
                                }
                              >
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${tipoBadge.color}`}
                                  >
                                    <Wrench className="h-6 w-6" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900 capitalize text-lg">
                                      Mantenimiento {mant.tipo}
                                    </h4>
                                    <Badge
                                      variant={tipoBadge.variant}
                                      className="capitalize"
                                    >
                                      {mant.tipo}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {format(
                                          new Date(mant.fecha),
                                          "d 'de' MMMM 'de' yyyy",
                                          { locale: es }
                                        )}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Técnico:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(mant.tecnico_id)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Creado por:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(mant.creado_por_id)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Cpu className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Hardware:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(
                                            mant.encargado_harware_id
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Monitor className="h-3.5 w-3.5" />
                                        <span className="font-medium">
                                          Software:
                                        </span>
                                        <span>
                                          {getUsuarioNombre(
                                            mant.encargado_software_id
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180 flex-shrink-0 mt-2" />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historial" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Traslados</CardTitle>
                    <CardDescription>
                      {traslados.length} traslado(s) registrado(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {traslados.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Sin traslados registrados
                        </h3>
                        <p className="text-gray-600">
                          Este activo no ha sido trasladado entre sedes
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {traslados
                          .sort(
                            (a, b) =>
                              new Date(b.fecha).getTime() -
                              new Date(a.fecha).getTime()
                          )
                          .map((traslado) => (
                            <div
                              key={traslado.id}
                              className="flex items-start gap-4 p-5 border-2 rounded-xl hover:border-orange-300 hover:shadow-md transition-all bg-white card-hover animate-fade-in"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 border-blue-200">
                                  <MapPin className="h-6 w-6" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900 text-lg">
                                    Traslado de Sede
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {traslado.sede_origen?.nombre ||
                                      `Sede ${traslado.sede_origen_id}`}{" "}
                                    →{" "}
                                    {traslado.sede_destino?.nombre ||
                                      `Sede ${traslado.sede_destino_id}`}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {format(
                                        new Date(traslado.fecha),
                                        "d 'de' MMMM 'de' yyyy",
                                        { locale: es }
                                      )}
                                    </span>
                                  </div>
                                  {traslado.motivo && (
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                      <span className="font-medium">
                                        Motivo:
                                      </span>{" "}
                                      {traslado.motivo}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <User className="h-3.5 w-3.5" />
                                      <span className="font-medium">
                                        Solicitado por:
                                      </span>
                                      <span>
                                        {traslado.solicitado_por?.nombre ||
                                          getUsuarioNombre(
                                            traslado.solicitado_por_id
                                          )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <User className="h-3.5 w-3.5" />
                                      <span className="font-medium">
                                        Creado por:
                                      </span>
                                      <span>
                                        {traslado.creado_por?.nombre ||
                                          getUsuarioNombre(
                                            traslado.creado_por_id
                                          )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActivoFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        activo={activo}
        onSuccess={loadData}
      />

      <DeleteActivoDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        activo={activo}
        onSuccess={handleDelete}
      />
    </div>
  );
}
