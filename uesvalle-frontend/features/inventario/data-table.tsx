"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search, X, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePersistentFilters } from "./hooks/use-persistent-filters";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const {
    filters,
    updateFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFiltersCount,
    isLoaded,
  } = usePersistentFilters();

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (value: string) =>
      updateFilter("globalFilter", value),
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter: filters.globalFilter,
    },
  });

  // Sincronizar filtros persistentes con filtros de columnas
  React.useEffect(() => {
    if (!isLoaded) return;

    const newColumnFilters: ColumnFiltersState = [];

    if (filters.tipo)
      newColumnFilters.push({ id: "tipo", value: filters.tipo });
    if (filters.estado)
      newColumnFilters.push({ id: "estado", value: filters.estado });
    if (filters.proceso)
      newColumnFilters.push({ id: "proceso", value: filters.proceso });
    if (filters.sede)
      newColumnFilters.push({ id: "sede", value: filters.sede });

    setColumnFilters(newColumnFilters);
  }, [filters, isLoaded]);

  if (!isLoaded) {
    return <div className="flex justify-center p-8">Cargando filtros...</div>;
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Barra de filtros */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por placa, serial, marca, modelo..."
              value={filters.globalFilter}
              onChange={(event) =>
                updateFilter("globalFilter", event.target.value)
              }
              className="w-80"
            />
          </div>

          <Select
            value={filters.tipo || "all"}
            onValueChange={(value) =>
              updateFilter("tipo", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="computador">Computador</SelectItem>
              <SelectItem value="portatil">Portátil</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="impresora">Impresora</SelectItem>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="servidor">Servidor</SelectItem>
              <SelectItem value="ups">UPS</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.estado || "all"}
            onValueChange={(value) =>
              updateFilter("estado", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="bueno">Bueno</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="malo">Malo</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.proceso || "all"}
            onValueChange={(value) =>
              updateFilter("proceso", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por proceso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los procesos</SelectItem>
              <SelectItem value="sistemas">Sistemas</SelectItem>
              <SelectItem value="contabilidad">Contabilidad</SelectItem>
              <SelectItem value="administracion">Administración</SelectItem>
              <SelectItem value="gerencia">Gerencia</SelectItem>
              <SelectItem value="juridica">Jurídica</SelectItem>
              <SelectItem value="financiera">Financiera</SelectItem>
              <SelectItem value="tecnica">Técnica</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros activos y limpiar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Filtros activos:
              </span>
            </div>

            {filters.globalFilter && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
              >
                Búsqueda: "{filters.globalFilter}"
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter("globalFilter");
                  }}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </Badge>
            )}

            {filters.tipo && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
              >
                Tipo: {filters.tipo}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter("tipo");
                  }}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </Badge>
            )}

            {filters.estado && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
              >
                Estado: {filters.estado}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter("estado");
                  }}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </Badge>
            )}

            {filters.proceso && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
              >
                Proceso: {filters.proceso}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter("proceso");
                  }}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground ml-auto"
            >
              Limpiar todos ({activeFiltersCount})
            </Button>
          </div>
        )}
      </div>

      {/* Espaciado adicional antes de la tabla */}
      <div className="mt-6"></div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de{" "}
          {table.getCoreRowModel().rows.length} fila(s) mostradas.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
