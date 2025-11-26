"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Users as UsersIcon,
  Shield,
  Mail,
} from "lucide-react";
import { DataTable } from "@/features/inventario/data-table";
import { useUsuarios } from "@/shared/hooks/use-usuarios";
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
import { Usuario } from "@/shared/types/auth";
import { UsuarioFormModal } from "@/features/usuarios/components/usuario-form-modal";

const getRolBadgeVariant = (rol: string) => {
  switch (rol) {
    case "ADMIN":
      return { variant: "default" as const, className: "bg-red-600" };
    case "SYSMAN":
      return { variant: "default" as const, className: "bg-orange-600" };
    case "USER":
      return { variant: "secondary" as const, className: "" };
    default:
      return { variant: "outline" as const, className: "" };
  }
};

export default function UsuariosPage() {
  const { usuarios, loading, refreshUsuarios } = useUsuarios();

  // Estados para los modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Handlers para las acciones
  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormModalOpen(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setFormModalOpen(true);
  };

  const handleSuccess = () => {
    refreshUsuarios();
  };

  // Crear columnas dinámicamente con las acciones
  const columns = useMemo<ColumnDef<Usuario>[]>(
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
        accessorKey: "nombre",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue("nombre")}</div>
        ),
      },
      {
        accessorKey: "correo",
        header: "Correo Electrónico",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{row.getValue("correo")}</span>
          </div>
        ),
      },
      {
        accessorKey: "rol",
        header: "Rol",
        cell: ({ row }) => {
          const rol = row.getValue("rol") as string;
          const badge = getRolBadgeVariant(rol);
          return (
            <Badge variant={badge.variant} className={badge.className}>
              {rol}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const usuario = row.original;

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
                  onClick={() => navigator.clipboard.writeText(usuario.correo)}
                >
                  Copiar correo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(usuario)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(usuario)}
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UsersIcon className="h-8 w-8 text-orange-600" />
            Usuarios
          </h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema UESVALLE
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshUsuarios}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              Lista completa de usuarios registrados ({usuarios.length}{" "}
              usuarios)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={usuarios} />
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <UsuarioFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSuccess={handleSuccess}
      />

      {/* TODO: Agregar modal de eliminación */}
    </div>
  );
}
