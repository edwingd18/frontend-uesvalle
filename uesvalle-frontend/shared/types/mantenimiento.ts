export interface Mantenimiento {
  id: number;
  activo_id: number;
  fecha_realizado: string;
  fecha_creacion?: string;
  tipo: "preventivo" | "correctivo";
  tecnico_id: number;
  encargado_harware_id: number;
  encargado_software_id: number;
  creado_por_id: number;
  actualizado_por_id?: number | null;
  eliminado_por_id?: number | null;
  observacion_hardware?: string | null;
  observacion_software?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMantenimientoData {
  activo_id: number;
  fecha_realizado: string;
  tipo: string;
  tecnico_id: number;
  encargado_harware_id: number;
  encargado_software_id: number;
  creado_por_id: number;
}

export interface UpdateMantenimientoData {
  activo_id?: number;
  fecha_realizado?: string;
  tipo?: string;
  tecnico_id?: number;
  encargado_harware_id?: number;
  encargado_software_id?: number;
  observacion_hardware?: string | null;
  observacion_software?: string | null;
  actualizado_por_id?: number;
}
