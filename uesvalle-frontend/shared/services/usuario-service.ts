import { Usuario } from "@/shared/types/auth";
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
}

export const usuarioService = new UsuarioService();
