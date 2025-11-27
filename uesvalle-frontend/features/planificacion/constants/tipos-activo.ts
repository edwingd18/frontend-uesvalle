/**
 * Lista completa de tipos de activos disponibles en el sistema
 * Esta constante debe ser usada en todos los componentes de planificación
 * para mantener consistencia
 */
export const TIPOS_ACTIVO = [
  { value: "ACCESS POINT", label: "Access Point" },
  { value: "BIOMETRICO", label: "Biométrico" },
  { value: "CAMARA", label: "Cámara" },
  { value: "CELULAR", label: "Celular" },
  { value: "COMPUTADOR", label: "Computador" },
  { value: "DISCO EXTERNO", label: "Disco Externo" },
  { value: "PATCHPANEL", label: "Patchpanel" },
  { value: "DVR", label: "DVR" },
  { value: "ESCANER", label: "Escáner" },
  { value: "IMPRESORA", label: "Impresora" },
  { value: "IPAD", label: "iPad" },
  { value: "MONITOR", label: "Monitor" },
  { value: "PLANTA TELEFONICA", label: "Planta Telefónica" },
  { value: "PORTATIL", label: "Portátil" },
  { value: "RACK", label: "Rack" },
  { value: "ROUTER", label: "Router" },
  { value: "SERVIDOR", label: "Servidor" },
  { value: "SWITCH", label: "Switch" },
  { value: "TABLET", label: "Tablet" },
  { value: "TELEFONO", label: "Teléfono" },
  { value: "TELEVISOR", label: "Televisor" },
  { value: "TODO EN UNO", label: "Todo en Uno" },
  { value: "UPS", label: "UPS" },
  { value: "XVR", label: "XVR" },
  { value: "VIDEO BEAM", label: "Video Beam" },
] as const;

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;
