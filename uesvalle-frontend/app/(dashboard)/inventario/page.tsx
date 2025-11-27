"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Download,
} from "lucide-react";
import { DataTable } from "@/features/inventario/data-table";
import { useInventario } from "@/features/inventario/hooks/use-inventario";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activo } from "@/shared/types/inventario";
import { ActivoFormModal } from "@/features/inventario/components/activo-form-modal";
import { DeleteActivoDialog } from "@/features/inventario/components/delete-activo-dialog";
import { ReportesModal } from "@/features/inventario/components/ReportesModal";

const getEstadoBadgeVariant = (estado: string) => {
  const estadoLower = estado.toLowerCase();
  switch (estadoLower) {
    case "bueno":
      return "default";
    case "regular":
      return "secondary";
    case "malo":
      return "destructive";
    case "mantenimiento":
      return "outline";
    case "baja":
      return "destructive";
    default:
      return "secondary";
  }
};

const getProcesoBadgeVariant = (proceso: string) => {
  switch (proceso) {
    case "sistemas":
      return "default";
    case "contabilidad":
      return "secondary";
    case "administracion":
      return "outline";
    case "gerencia":
      return "default";
    case "juridica":
      return "secondary";
    case "financiera":
      return "outline";
    case "tecnica":
      return "default";
    default:
      return "secondary";
  }
};

export default function InventarioPage() {
  const router = useRouter();
  const { data, loading, error, refreshData } = useInventario();

  // Estados para los modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportesModalOpen, setReportesModalOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null);

  // Handlers para las acciones
  const handleView = (activo: Activo) => {
    router.push(`/inventario/${activo.id}`);
  };

  const handleEdit = async (activo: Activo) => {
    try {
      // Obtener el activo completo con especificaciones
      const { activosService } = await import("@/features/inventario/services/activos-service");
      const activoCompleto = await activosService.getActivo(activo.id);
      setSelectedActivo(activoCompleto);
      setFormModalOpen(true);
    } catch (error) {
      console.error("Error al cargar activo para editar:", error);
      // Fallback: usar el activo sin especificaciones
      setSelectedActivo(activo);
      setFormModalOpen(true);
    }
  };

  const handleDelete = (activo: Activo) => {
    setSelectedActivo(activo);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedActivo(null);
    setFormModalOpen(true);
  };

  const handleSuccess = () => {
    refreshData();
  };

  // Crear columnas dinámicamente con las acciones
  const columns = useMemo<ColumnDef<Activo>[]>(
    () => [
      {
        accessorKey: "placa",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Placa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono font-semibold text-orange-600">
            {row.getValue("placa")}
          </div>
        ),
      },
      {
        accessorKey: "serial",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Serial
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("serial")}</div>,
      },
      {
        accessorKey: "tipo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const tipo = row.getValue("tipo") as string;
          return <div className="capitalize">{tipo}</div>;
        },
      },
      {
        accessorKey: "marca",
        header: "Marca",
        cell: ({ row }) => <div>{row.getValue("marca")}</div>,
      },
      {
        accessorKey: "modelo",
        header: "Modelo",
        cell: ({ row }) => <div>{row.getValue("modelo")}</div>,
      },
      {
        accessorKey: "usuario_uso_nombre",
        header: "Usuario en Uso",
        cell: ({ row }) => {
          const nombre = row.getValue("usuario_uso_nombre") as string | null;
          return <div>{nombre || "N/A"}</div>;
        },
      },
      {
        accessorKey: "usuario_sysman_nombre",
        header: "Usuario Sysman",
        cell: ({ row }) => {
          const nombre = row.getValue("usuario_sysman_nombre") as string | null;
          return <div>{nombre || "N/A"}</div>;
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.getValue("estado") as string;
          const estadoCapitalizado =
            estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
          return (
            <Badge variant={getEstadoBadgeVariant(estado) as any}>
              {estadoCapitalizado}
            </Badge>
          );
        },
      },
      {
        accessorKey: "proceso",
        header: "Proceso",
        cell: ({ row }) => {
          const proceso = row.getValue("proceso") as string;
          // Crear versión abreviada del proceso
          const procesoAbreviado = proceso
            .split(" ")
            .map((word) => word.charAt(0))
            .join("");

          return (
            <div className="max-w-[200px]" title={proceso}>
              <Badge
                variant={getProcesoBadgeVariant(proceso) as any}
                className="truncate max-w-full"
              >
                {procesoAbreviado}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const activo = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(activo.placa)}
                >
                  Copiar placa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleView(activo)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(activo)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(activo)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Dar de baja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Inventario
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona los activos tecnológicos de UESVALLE
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="sm:inline">Actualizar</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setReportesModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Generar Reporte</span>
            <span className="sm:hidden">Reporte</span>
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <div className="mt-6 animate-fade-in">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Activos Tecnológicos</CardTitle>
            <CardDescription>
              Lista completa de equipos registrados en el sistema ({data.length}{" "}
              activos)
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto flex justify-center">
            <div className="w-[280px] sm:w-full">
              <DataTable columns={columns} data={data} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <ActivoFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        activo={selectedActivo}
        onSuccess={handleSuccess}
      />

      <DeleteActivoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        activo={selectedActivo}
        onSuccess={handleSuccess}
      />

      <ReportesModal
        open={reportesModalOpen}
        onOpenChange={setReportesModalOpen}
        activos={data}
      />
    </div>
  );
}
