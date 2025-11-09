export interface Mantenimiento {
  id: number
  activo_id: number
  fecha: string
  tipo: 'preventivo' | 'correctivo' | 'predictivo'
  tecnico_id: number
  encargado_harware_id: number
  encargado_software_id: number
  creado_por_id: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateMantenimientoData {
  activo_id: number
  fecha: string
  tipo: string
  tecnico_id: number
  encargado_harware_id: number
  encargado_software_id: number
  creado_por_id: number
}

export interface UpdateMantenimientoData {
  activo_id?: number
  fecha?: string
  tipo?: string
  tecnico_id?: number
  encargado_harware_id?: number
  encargado_software_id?: number
  actualizado_por_id?: number
}
