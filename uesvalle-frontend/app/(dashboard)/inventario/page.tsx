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
import { sedes, usuarios } from "@/mocks/inventario";
import { ActivoFormModal } from "@/features/inventario/components/activo-form-modal";
import { DeleteActivoDialog } from "@/features/inventario/components/delete-activo-dialog";

const getSedeNombre = (sedeId: number) => {
  return sedes.find((sede) => sede.id === sedeId)?.nombre || "N/A";
};

const getUsuarioNombre = (usuarioId: number | null) => {
  if (!usuarioId) return "N/A";
  return usuarios.find((usuario) => usuario.id === usuarioId)?.nombre || "N/A";
};

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
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
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null);

  // Estados para filtros
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");

  // Filtrar datos
  const filteredData = useMemo(() => {
    return data.filter((activo) => {
      const matchEstado =
        estadoFilter === "todos" ||
        activo.estado.toLowerCase() === estadoFilter;
      const matchTipo =
        tipoFilter === "todos" || activo.tipo.toLowerCase() === tipoFilter;
      return matchEstado && matchTipo;
    });
  }, [data, estadoFilter, tipoFilter]);

  // Handlers para las acciones
  const handleView = (activo: Activo) => {
    router.push(`/inventario/${activo.id}`);
  };

  const handleEdit = (activo: Activo) => {
    setSelectedActivo(activo);
    setFormModalOpen(true);
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
        accessorKey: "sede_id",
        header: "Sede",
        cell: ({ row }) => {
          const sedeId = row.getValue("sede_id") as number;
          return <div>{getSedeNombre(sedeId)}</div>;
        },
      },
      {
        accessorKey: "usuario_uso_id",
        header: "Usuario en Uso",
        cell: ({ row }) => {
          const usuarioId = row.getValue("usuario_uso_id") as number | null;
          return <div>{getUsuarioNombre(usuarioId)}</div>;
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.getValue("estado") as string;
          return (
            <Badge variant={getEstadoBadgeVariant(estado) as any}>
              {estado}
            </Badge>
          );
        },
      },
      {
        accessorKey: "proceso",
        header: "Proceso",
        cell: ({ row }) => {
          const proceso = row.getValue("proceso") as string;
          return (
            <Badge variant={getProcesoBadgeVariant(proceso) as any}>
              {proceso}
            </Badge>
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
                  Eliminar
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
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona los activos tecnológicos de UESVALLE
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activos Tecnológicos</CardTitle>
                <CardDescription>
                  Lista completa de equipos registrados en el sistema (
                  {filteredData.length} de {data.length} activos)
                </CardDescription>
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">
                    Estado
                  </label>
                  <select
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    className="h-9 px-3 rounded-md border border-gray-200 text-sm bg-white hover:bg-gray-50 transition-colors"
                  >
                    <option value="todos">Todos</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="malo">Malo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">
                    Tipo
                  </label>
                  <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className="h-9 px-3 rounded-md border border-gray-200 text-sm bg-white hover:bg-gray-50 transition-colors"
                  >
                    <option value="todos">Todos</option>
                    <option value="computador">Computador</option>
                    <option value="portatil">Portátil</option>
                    <option value="tablet">Tablet</option>
                    <option value="impresora">Impresora</option>
                    <option value="router">Router</option>
                    <option value="switch">Switch</option>
                    <option value="servidor">Servidor</option>
                    <option value="ups">UPS</option>
                    <option value="monitor">Monitor</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredData} />
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
    </div>
  );
}
