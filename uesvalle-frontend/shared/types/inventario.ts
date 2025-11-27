export interface Activo {
  id: number;
  serial: string;
  placa: string;
  tipo:
    | "ACCESS POINT"
    | "BIOMETRICO"
    | "CAMARA"
    | "CELULAR"
    | "COMPUTADOR"
    | "DISCO EXTERNO"
    | "PATCHPANEL"
    | "DVR"
    | "ESCANER"
    | "IMPRESORA"
    | "IPAD"
    | "MONITOR"
    | "PLANTA TELEFONICA"
    | "PORTATIL"
    | "RACK"
    | "ROUTER"
    | "SERVIDOR"
    | "SWITCH"
    | "TABLET"
    | "TELEFONO"
    | "TELEVISOR"
    | "TODO EN UNO"
    | "UPS"
    | "XVR"
    | "VIDEO BEAM";
  marca: string;
  modelo: string;
  sede_id: number;
  usuario_sysman_id: number | null;
  usuario_uso_id: number | null;
  usuario_sysman_nombre?: string | null; // Nombre del usuario sysman (del backend)
  usuario_uso_nombre?: string | null; // Nombre del usuario en uso (del backend)
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
  creado_por_id?: number | null; // ID del usuario que creó el activo
  creado_por_nombre?: string | null; // Nombre del usuario que creó el activo (del backend)
  eliminado_por_id?: number | null; // ID del usuario que dio de baja el activo
  observacion_baja?: string | null; // Motivo por el cual se dio de baja
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
