export interface Traslado {
  id: number;
  fecha: string;
  motivo: string;
  activo_id: number;
  sede_origen_id: number;
  sede_destino_id: number;
  solicitado_por_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrasladoData {
  fecha: string;
  motivo: string;
  activo_id: number;
  sede_origen_id: number;
  sede_destino_id: number;
  solicitado_por_id: number;
}

export interface UpdateTrasladoData {
  fecha?: string;
  motivo?: string;
  sede_destino_id?: number;
}
