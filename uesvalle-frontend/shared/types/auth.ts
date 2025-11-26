export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "SYSMAN" | "RESPONSABLE" | "TECNICO";
  estado: "ACTIVO" | "INACTIVO";
  sede_id: number;
}

export interface LoginCredentials {
  username: string;
  contrasena: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "ADMIN" | "SYSMAN" | "RESPONSABLE" | "TECNICO";
  sede_id: number;
}

export interface RegisterUsuarioData {
  username: string;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "ADMIN" | "SYSMAN" | "USER" | "TECNICO";
  sede_id: number;
  celular: string;
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
