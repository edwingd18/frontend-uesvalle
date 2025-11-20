export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "SYSMAN" | "RESPONSABLE";
  estado: "ACTIVO" | "INACTIVO";
  sede_id: number;
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "ADMIN" | "SYSMAN" | "RESPONSABLE";
  sede_id: number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  setUsuario: (usuario: Usuario) => void;
  initialize: () => void;
}
