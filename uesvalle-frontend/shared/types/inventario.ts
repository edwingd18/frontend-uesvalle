export interface Activo {
  id: number;
  serial: string;
  placa: string;
  tipo:
    | "computador"
    | "portatil"
    | "tablet"
    | "impresora"
    | "router"
    | "switch"
    | "servidor"
    | "ups"
    | "monitor";
  marca: string;
  modelo: string;
  sede_id: number;
  usuario_sysman_id: number | null;
  usuario_uso_id: number | null;
  estado: "bueno" | "regular" | "malo" | "mantenimiento" | "baja";
  proceso:
    | "sistemas"
    | "contabilidad"
    | "administracion"
    | "gerencia"
    | "juridica"
    | "financiera"
    | "tecnica";
  fecha_instalacion?: string | null; // Campo del backend (opcional)
  // Especificaciones de PC/Portátil (cuando aplique)
  especificaciones?: {
    procesador?: string;
    ram_gb?: number;
    almacenamiento_gb?: number;
    so?: string;
    tipo_disco?: string;
    velocidad_cpu_ghz?: number;
  };
}

export interface Sede {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "tecnico" | "responsable";
}

export interface InventarioFilters {
  busqueda: string;
  tipo: string;
  estado: string;
  proceso: string;
  sede_id: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}
