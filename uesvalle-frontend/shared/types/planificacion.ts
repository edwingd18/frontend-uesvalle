export interface MesPlanificacion {
  mes: number;
  planificados: number;
  realizados: number;
}

// Tipo que viene del backend
export interface MesPlanificacionBackend {
  mes: number;
  nombreMes: string;
  planificado: number;
  realizado: number;
}

export interface PlanificacionAnualBackend {
  ano: number;
  totalPlanificado: number;
  totalRealizado: number;
  porMes: MesPlanificacionBackend[];
}

export interface PlanificacionAnual {
  id?: number;
  ano: number;
  meses: MesPlanificacion[];
  totalPlanificado?: number;
  totalRealizado?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanificacionData {
  ano: number;
  meses: MesPlanificacion[];
}

export interface UpdatePlanificacionData {
  meses: MesPlanificacion[];
}
