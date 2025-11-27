import { Usuario, RegisterUsuarioData } from "@/shared/types/auth";
import { apiGet, apiPatch } from "@/shared/lib/api-client";

export interface ActualizarUsuarioDto {
  nombre?: string;
  correo?: string;
  sede_id?: number;
}

class UsuarioService {
  async obtenerUsuarioPorId(id: number): Promise<Usuario> {
    return apiGet<Usuario>(`/usuarios/${id}`);
  }

  async actualizarUsuario(
    id: number,
    data: ActualizarUsuarioDto
  ): Promise<Usuario> {
    return apiPatch<Usuario>(`/usuarios/${id}`, data);
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    return apiGet<Usuario[]>(`/usuarios`);
  }

  async registerUsuario(
    data: RegisterUsuarioData
  ): Promise<{ message: string }> {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
          const validationErrors = error.error
            .map((err: any) => err.message)
            .join(", ");
          throw new Error(`Validación: ${validationErrors}`);
        } else if (error.error === "El correo ya está registrado") {
          throw new Error("El correo ya está registrado");
        }
      } else if (
        response.status === 401 &&
        error.error === "El nombre de usuario ya existe"
      ) {
        throw new Error("El nombre de usuario ya existe");
      }

      throw new Error(
        error.error || error.message || "Error al registrar usuario"
      );
    }

    return response.json();
  }
}

export const usuarioService = new UsuarioService();
