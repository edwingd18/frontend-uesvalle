"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Activo } from "@/shared/types/inventario";
import { sedes, usuarios } from "@/mocks/inventario";

const getSedeNombre = (sedeId: number) => {
  return sedes.find((sede) => sede.id === sedeId)?.nombre || "N/A";
};

const getUsuarioNombre = (usuarioId: number | null) => {
  if (!usuarioId) return "N/A";
  return usuarios.find((usuario) => usuario.id === usuarioId)?.nombre || "N/A";
};

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
    case "activo":
      return "default";
    case "en_revision":
      return "secondary";
    case "descartado":
      return "destructive";
    case "en_traslado":
      return "outline";
    default:
      return "secondary";
  }
};

export const columns: ColumnDef<Activo>[] = [
  {
    accessorKey: "placa",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Placa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("placa")}</div>
    ),
  },
  {
    accessorKey: "serial",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Serial
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("serial")}</div>,
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
      const estadoCapitalizado =
        estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
      return (
        <Badge variant={getEstadoBadgeVariant(estado)}>
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
      return (
        <Badge variant={getProcesoBadgeVariant(proceso)}>
          {proceso.replace("_", " ")}
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
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Historial</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
