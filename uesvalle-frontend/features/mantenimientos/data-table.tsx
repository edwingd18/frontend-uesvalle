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
import { ChevronDown, Search, X, Filter, Calendar } from "lucide-react";

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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "id", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [tipoFilter, setTipoFilter] = React.useState("");
  const [fechaDesde, setFechaDesde] = React.useState("");
  const [fechaHasta, setFechaHasta] = React.useState("");

  // Filtrar por rango de fechas
  const filteredByDate = React.useMemo(() => {
    if (!fechaDesde && !fechaHasta) return data;

    return data.filter((row: any) => {
      const fecha = new Date(row.fecha_realizado || row.fecha);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      if (desde && hasta) {
        return fecha >= desde && fecha <= hasta;
      } else if (desde) {
        return fecha >= desde;
      } else if (hasta) {
        return fecha <= hasta;
      }
      return true;
    });
  }, [data, fechaDesde, fechaHasta]);

  const table = useReactTable({
    data: filteredByDate,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  // Sincronizar filtro de tipo
  React.useEffect(() => {
    const newColumnFilters: ColumnFiltersState = [];
    if (tipoFilter) newColumnFilters.push({ id: "tipo", value: tipoFilter });
    setColumnFilters(newColumnFilters);
  }, [tipoFilter]);

  const hasActiveFilters =
    globalFilter || tipoFilter || fechaDesde || fechaHasta;
  const activeFiltersCount = [
    globalFilter,
    tipoFilter,
    fechaDesde,
    fechaHasta,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setGlobalFilter("");
    setTipoFilter("");
    setFechaDesde("");
    setFechaHasta("");
  };

  const clearFilter = (filterName: string) => {
    if (filterName === "globalFilter") setGlobalFilter("");
    if (filterName === "tipo") setTipoFilter("");
    if (filterName === "fechaDesde") setFechaDesde("");
    if (filterName === "fechaHasta") setFechaHasta("");
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Barra de filtros */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por activo, técnico..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-80"
            />
          </div>

          <Select
            value={tipoFilter || "all"}
            onValueChange={(value) =>
              setTipoFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="preventivo">Preventivo</SelectItem>
              <SelectItem value="correctivo">Correctivo</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-white">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-[130px] border-0 p-0 h-auto focus-visible:ring-0"
            />
            <span className="text-gray-400">→</span>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-[130px] border-0 p-0 h-auto focus-visible:ring-0"
            />
          </div>

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
                .map((column) => (
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
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Filtros activos:
              </span>
            </div>

            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Búsqueda: "{globalFilter}"
                <button
                  onClick={() => clearFilter("globalFilter")}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {tipoFilter && (
              <Badge variant="secondary" className="gap-1">
                Tipo: {tipoFilter}
                <button onClick={() => clearFilter("tipo")} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {fechaDesde && (
              <Badge variant="secondary" className="gap-1">
                Desde: {new Date(fechaDesde).toLocaleDateString("es-ES")}
                <button
                  onClick={() => clearFilter("fechaDesde")}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {fechaHasta && (
              <Badge variant="secondary" className="gap-1">
                Hasta: {new Date(fechaHasta).toLocaleDateString("es-ES")}
                <button
                  onClick={() => clearFilter("fechaHasta")}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
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

      <div className="mt-6"></div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
