import { Usuario, RegisterUsuarioData } from "@/shared/types/auth";
import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "./auth-service";

export interface ActualizarUsuarioDto {
  nombre?: string;
  correo?: string;
  sede_id?: number;
}

class UsuarioService {
  async obtenerUsuarioPorId(id: number): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener usuario");
    }

    return response.json();
  }

  async actualizarUsuario(
    id: number,
    data: ActualizarUsuarioDto
  ): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al actualizar usuario");
    }

    return response.json();
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al obtener usuarios");
    }

    return response.json();
  }

  async registerUsuario(data: RegisterUsuarioData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      // Manejo específico de errores según el backend
      if (response.status === 400) {
        if (Array.isArray(error.error)) {
          // Error de validación Zod
          const validationErrors = error.error.map((err: any) => err.message).join(', ');
          throw new Error(`Validación: ${validationErrors}`);
        } else if (error.error === "El correo ya está registrado") {
          throw new Error("El correo ya está registrado");
        }
      } else if (response.status === 401 && error.error === "El nombre de usuario ya existe") {
        throw new Error("El nombre de usuario ya existe");
      }
      
      throw new Error(error.error || error.message || "Error al registrar usuario");
    }

    return response.json();
  }
}

export const usuarioService = new UsuarioService();
