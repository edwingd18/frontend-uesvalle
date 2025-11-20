# Integración de Módulos de Reportes

Se han creado servicios y modales de reportes para los siguientes módulos:

## 1. Inventario (Ya integrado)

- **Servicio**: `features/inventario/services/reportes-service.ts`
- **Modal**: `features/inventario/components/ReportesModal.tsx`
- **Filtros**: Fecha, Tipo, Estado, Proceso

## 2. Mantenimientos

- **Servicio**: `features/mantenimientos/services/reportes-mantenimientos-service.ts`
- **Modal**: `features/mantenimientos/components/ReportesMantenimientosModal.tsx`
- **Filtros**: Fecha, Tipo de Mantenimiento

### Integración en Mantenimientos:

```tsx
// En app/(dashboard)/mantenimientos/page.tsx o el componente principal

import { ReportesMantenimientosModal } from "@/features/mantenimientos/components/ReportesMantenimientosModal";
import { Download } from "lucide-react";

// Agregar estado
const [reportesModalOpen, setReportesModalOpen] = useState(false);

// Agregar botón en el header (junto a otros botones de acción)
<Button variant="outline" onClick={() => setReportesModalOpen(true)}>
  <Download className="mr-2 h-4 w-4" />
  Generar Reporte
</Button>

// Agregar modal al final del componente
<ReportesMantenimientosModal
  open={reportesModalOpen}
  onOpenChange={setReportesModalOpen}
  mantenimientos={data} // data es el array de mantenimientos
/>
```

## 3. Traslados

- **Servicio**: `features/traslados/services/reportes-traslados-service.ts`
- **Modal**: `features/traslados/components/ReportesTrasladosModal.tsx`
- **Filtros**: Fecha, Sede Origen, Sede Destino

### Integración en Traslados:

```tsx
// En app/(dashboard)/traslados/page.tsx o el componente principal

import { ReportesTrasladosModal } from "@/features/traslados/components/ReportesTrasladosModal";
import { Download } from "lucide-react";

// Agregar estado
const [reportesModalOpen, setReportesModalOpen] = useState(false);

// Agregar botón en el header
<Button variant="outline" onClick={() => setReportesModalOpen(true)}>
  <Download className="mr-2 h-4 w-4" />
  Generar Reporte
</Button>

// Agregar modal al final del componente
<ReportesTrasladosModal
  open={reportesModalOpen}
  onOpenChange={setReportesModalOpen}
  traslados={data} // data es el array de traslados
/>
```

## 4. Planificación

- **Servicio**: `features/planificacion/services/reportes-planificacion-service.ts`
- **Modal**: `features/planificacion/components/ReportesPlanificacionModal.tsx`
- **Filtros**: Rango de Meses

### Integración en Planificación:

```tsx
// En app/(dashboard)/planificacion/page.tsx o el componente principal

import { ReportesPlanificacionModal } from "@/features/planificacion/components/ReportesPlanificacionModal";
import { Download } from "lucide-react";

// Agregar estado
const [reportesModalOpen, setReportesModalOpen] = useState(false);

// Agregar botón en el header
<Button variant="outline" onClick={() => setReportesModalOpen(true)}>
  <Download className="mr-2 h-4 w-4" />
  Generar Reporte
</Button>

// Agregar modal al final del componente
<ReportesPlanificacionModal
  open={reportesModalOpen}
  onOpenChange={setReportesModalOpen}
  planificacion={planificacionData} // planificacionData es el objeto PlanificacionAnual
/>
```

## Características de cada Reporte

### Mantenimientos

- **PDF**: Tabla con ID Activo, Fecha, Tipo, Técnico, Hardware, Software
- **Excel**: Datos detallados + Resumen con distribución por tipo
- **Filtros**:
  - Rango de fechas
  - Tipo: Preventivo, Correctivo, Predictivo

### Traslados

- **PDF**: Tabla con ID Activo, Fecha, Sede Origen, Sede Destino, Solicitado Por, Motivo
- **Excel**: Datos detallados + Resumen con distribución por sede destino
- **Filtros**:
  - Rango de fechas
  - Sede Origen
  - Sede Destino

### Planificación

- **PDF**: Tabla mensual con Planificados, Realizados, Cumplimiento % + Totales
- **Excel**: Datos mensuales + Resumen general + Análisis por trimestres
- **Filtros**:
  - Rango de meses (Enero a Diciembre)
- **Métricas**:
  - Total Planificado
  - Total Realizado
  - Porcentaje de Cumplimiento
  - Análisis trimestral (Q1, Q2, Q3, Q4)

## Notas Importantes

1. Todos los modales tienen un diseño consistente con el modal de Inventario
2. Los reportes PDF son compactos y listos para imprimir
3. Los reportes Excel incluyen análisis estadísticos adicionales
4. Los filtros son opcionales - sin filtros se incluyen todos los registros
5. Se muestra un contador en tiempo real de registros filtrados
6. Los archivos se descargan con timestamp para evitar sobrescritura

## Dependencias Requeridas

Asegúrate de que estas dependencias estén instaladas:

```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "xlsx": "^0.18.5"
}
```

Si no están instaladas:

```bash
npm install jspdf jspdf-autotable xlsx
```
