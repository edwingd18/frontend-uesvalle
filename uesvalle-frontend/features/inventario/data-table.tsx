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
  // Ordenar por ID descendente (más recientes primero) antes de aplicar otros filtros
  const sortedData = React.useMemo(() => {
    return [...data].sort((a: any, b: any) => {
      // Intentar ordenar por id, createdAt, o fecha_creacion
      if (a.id && b.id) return b.id - a.id;
      if (a.createdAt && b.createdAt)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (a.fecha_creacion && b.fecha_creacion)
        return (
          new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
        );
      return 0;
    });
  }, [data]);

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
    data: sortedData,
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar..."
              value={filters.globalFilter}
              onChange={(event) =>
                updateFilter("globalFilter", event.target.value)
              }
              className="w-full pl-10"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
            <Select
              value={filters.tipo || "all"}
              onValueChange={(value) =>
                updateFilter("tipo", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="COMPUTADOR">Computador</SelectItem>
                <SelectItem value="PORTATIL">Portátil</SelectItem>
                <SelectItem value="TABLET">Tablet</SelectItem>
                <SelectItem value="IMPRESORA">Impresora</SelectItem>
                <SelectItem value="ROUTER">Router</SelectItem>
                <SelectItem value="SWITCH">Switch</SelectItem>
                <SelectItem value="SERVIDOR">Servidor</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="MONITOR">Monitor</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.estado || "all"}
              onValueChange={(value) =>
                updateFilter("estado", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="BUENO">Bueno</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="MALO">Malo</SelectItem>
                <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                <SelectItem value="BAJA">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.proceso || "all"}
              onValueChange={(value) =>
                updateFilter("proceso", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por proceso" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] overflow-y-auto">
                <SelectItem value="all">Todos los procesos</SelectItem>
                <SelectItem value="DIRECCIONAMIENTO ESTRATEGICO">
                  Direccionamiento Estratégico
                </SelectItem>
                <SelectItem value="PLANEACIÓN E INFORMACIÓN INSTITUCIONAL">
                  Planeación e Información Institucional
                </SelectItem>
                <SelectItem value="GESTIÓN DE CALIDAD">
                  Gestión de Calidad
                </SelectItem>
                <SelectItem value="AGUA PARA CONSUMO HUMANO Y SANEAMIENTO BÁSICO">
                  Agua para Consumo Humano y Saneamiento Básico
                </SelectItem>
                <SelectItem value="ALIMENTOS Y MEDICAMENTOS">
                  Alimentos y Medicamentos
                </SelectItem>
                <SelectItem value="ESTABLECIMIENTO DE INTERÉS SANITARIO">
                  Establecimiento de Interés Sanitario
                </SelectItem>
                <SelectItem value="ZOONOSIS Y ENFERMEDADES DE TRANSMISIÓN VECTORIAL">
                  Zoonosis y Enfermedades de Transmisión Vectorial
                </SelectItem>
                <SelectItem value="GESTIÓN FINANCIERA">
                  Gestión Financiera
                </SelectItem>
                <SelectItem value="GESTIÓN DE RECURSOS FÍSICOS">
                  Gestión de Recursos Físicos
                </SelectItem>
                <SelectItem value="GESTIÓN DEL TALENTO HUMANO">
                  Gestión del Talento Humano
                </SelectItem>
                <SelectItem value="GESTIÓN INFORMÁTICA">
                  Gestión Informática
                </SelectItem>
                <SelectItem value="GESTIÓN DOCUMENTAL Y ATENCIÓN AL CIUDADANO">
                  Gestión Documental y Atención al Ciudadano
                </SelectItem>
                <SelectItem value="GESTIÓN DE CONTRATACIÓN">
                  Gestión de Contratación
                </SelectItem>
                <SelectItem value="GESTIÓN JURÍDICA Y DISCIPLINARIA">
                  Gestión Jurídica y Disciplinaria
                </SelectItem>
                <SelectItem value="CONTROL INTERNO A LA GESTIÓN">
                  Control Interno a la Gestión
                </SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto font-normal justify-between"
                >
                  Columnas
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
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
                    <TableCell key={cell.id} className="whitespace-nowrap">
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
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de{" "}
          {table.getCoreRowModel().rows.length} fila(s)
        </div>
        <div className="flex gap-2">
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
