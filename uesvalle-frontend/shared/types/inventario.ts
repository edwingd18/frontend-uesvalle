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
    | "DIRECCIONAMIENTO ESTRATEGICO"
    | "PLANEACIÓN E INFORMACIÓN INSTITUCIONAL"
    | "GESTIÓN DE CALIDAD"
    | "AGUA PARA CONSUMO HUMANO Y SANEAMIENTO BÁSICO"
    | "ALIMENTOS Y MEDICAMENTOS"
    | "ESTABLECIMIENTO DE INTERÉS SANITARIO"
    | "ZOONOSIS Y ENFERMEDADES DE TRANSMISIÓN VECTORIAL"
    | "GESTIÓN FINANCIERA"
    | "GESTIÓN DE RECURSOS FÍSICOS"
    | "GESTIÓN DEL TALENTO HUMANO"
    | "GESTIÓN INFORMÁTICA"
    | "GESTIÓN DOCUMENTAL Y ATENCIÓN AL CIUDADANO"
    | "GESTIÓN DE CONTRATACIÓN"
    | "GESTIÓN JURÍDICA Y DISCIPLINARIA"
    | "CONTROL INTERNO A LA GESTIÓN";
  fecha_instalacion?: string | null; // Campo del backend (opcional)
  fecha_creacion?: string; // Fecha de creación del registro
  createdAt?: string; // Timestamp de creación
  updatedAt?: string; // Timestamp de actualización
  // Especificaciones de PC/Portátil (cuando aplique)
  especificaciones?: {
    procesador?: string;
    ram_gb?: number;
    almacenamiento_gb?: number;
    so?: string;
    tipo_disco?: string;
    velocidad_cpu_ghz?: number;
    licencia?: string;
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
