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
  Wrench,
} from "lucide-react";
import { DataTable } from "@/features/mantenimientos/data-table";
import { useMantenimientos } from "@/features/mantenimientos/hooks/use-mantenimientos";
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
import { Mantenimiento } from "@/shared/types/mantenimiento";
import { format } from "date-fns";
import { MantenimientoFormModal } from "@/features/mantenimientos/components/mantenimiento-form-modal";
import { DeleteMantenimientoDialog } from "@/features/mantenimientos/components/delete-mantenimiento-dialog";
import { ReportesMantenimientosModal } from "@/features/mantenimientos/components/ReportesMantenimientosModal";
import { es } from "date-fns/locale";
import { useUsuarios } from "@/shared/hooks/use-usuarios";
import { useInventario } from "@/features/inventario/hooks/use-inventario";
import { Download } from "lucide-react";

const getTipoBadgeVariant = (tipo: string) => {
  switch (tipo) {
    case "preventivo":
      return "default";
    case "correctivo":
      return "destructive";
    default:
      return "outline";
  }
};

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "completado":
      return "default";
    case "en_proceso":
      return "secondary";
    case "pendiente":
      return "outline";
    case "cancelado":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  } catch {
    return dateString;
  }
};

export default function MantenimientosPage() {
  const router = useRouter();
  const { data, loading, error, refreshData } = useMantenimientos();
  const { usuarios, getUsuarioNombre } = useUsuarios();
  const { data: activos } = useInventario();

  // Estados para los modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportesModalOpen, setReportesModalOpen] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] =
    useState<Mantenimiento | null>(null);

  // Función para obtener la placa del activo
  const getActivoPlaca = (activoId: number) => {
    const activo = activos.find((a) => a.id === activoId);
    return activo?.placa || `Activo #${activoId}`;
  };

  // Handlers para las acciones
  const handleView = (mantenimiento: Mantenimiento) => {
    router.push(`/mantenimientos/${mantenimiento.id}`);
  };

  const handleEdit = (mantenimiento: Mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setFormModalOpen(true);
  };

  const handleDelete = (mantenimiento: Mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedMantenimiento(null);
    setFormModalOpen(true);
  };

  const handleSuccess = () => {
    refreshData();
  };

  // Crear columnas dinámicamente con las acciones
  const columns = useMemo<ColumnDef<Mantenimiento>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">#{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "activo_id",
        header: "Activo",
        cell: ({ row }) => {
          const activoId = row.getValue("activo_id") as number;
          const placa = getActivoPlaca(activoId);
          console.log(
            `Mantenimiento #${row.original.id} -> Activo ID: ${activoId} -> Placa: ${placa}`
          );
          return (
            <div className="font-mono font-semibold text-orange-600">
              {placa}
            </div>
          );
        },
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => {
          const tipo = row.getValue("tipo") as string;
          return (
            <Badge
              variant={getTipoBadgeVariant(tipo) as any}
              className="capitalize"
            >
              {tipo}
            </Badge>
          );
        },
      },
      {
        accessorKey: "fecha_realizado",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha de Realización
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="pl-4">
            {formatDate(row.getValue("fecha_realizado"))}
          </div>
        ),
      },
      {
        accessorKey: "tecnico_id",
        header: "Técnico",
        cell: ({ row }) => {
          const tecnicoId = row.getValue("tecnico_id") as number;
          return <div>{getUsuarioNombre(tecnicoId)}</div>;
        },
      },
      {
        accessorKey: "encargado_harware_id",
        header: "Enc. Hardware",
        cell: ({ row }) => {
          const encargadoId = row.getValue("encargado_harware_id") as number;
          return <div>{getUsuarioNombre(encargadoId)}</div>;
        },
      },
      {
        accessorKey: "encargado_software_id",
        header: "Enc. Software",
        cell: ({ row }) => {
          const encargadoId = row.getValue("encargado_software_id") as number;
          return <div>{getUsuarioNombre(encargadoId)}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const mantenimiento = row.original;

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
                <DropdownMenuItem onClick={() => handleView(mantenimiento)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(mantenimiento)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(mantenimiento)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [getUsuarioNombre, handleView, handleEdit, handleDelete]
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
    <div className="w-full min-h-full px-2 sm:px-4 md:px-6 lg:container lg:mx-auto">
      {/* Header con padding responsive */}
      <div className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              Mantenimientos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gestiona el mantenimiento preventivo y correctivo de activos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={refreshData} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => setReportesModalOpen(true)} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Mantenimiento
            </Button>
          </div>
        </div>
      </div>

      {/* Card con scroll horizontal */}
      <div className="animate-fade-in">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Registros de Mantenimiento</CardTitle>
            <CardDescription>
              Lista completa de mantenimientos programados y realizados (
              {data.length} registros)
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto flex justify-center">
            <div className="w-[280px] sm:w-full md:w-[700px] lg:w-full">
              <DataTable columns={columns} data={data} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <MantenimientoFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        mantenimiento={selectedMantenimiento}
        onSuccess={handleSuccess}
      />

      <DeleteMantenimientoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        mantenimiento={selectedMantenimiento}
        onSuccess={handleSuccess}
      />

      <ReportesMantenimientosModal
        open={reportesModalOpen}
        onOpenChange={setReportesModalOpen}
        mantenimientos={data}
        activos={activos}
        usuarios={usuarios}
      />
    </div>
  );
}
