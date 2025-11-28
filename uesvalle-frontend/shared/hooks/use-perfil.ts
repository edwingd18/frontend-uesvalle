import { useState, useEffect } from "react";
import { useAuthStore } from "@/shared/store/auth-store";
import { usuarioService } from "@/shared/services/usuario-service";
import { Usuario } from "@/shared/types/auth";

export function usePerfil() {
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refrescarPerfil = async () => {
    if (!usuario?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const perfilActualizado = await usuarioService.obtenerUsuarioPorId(
        usuario.id
      );
      setUsuario(perfilActualizado);
    } catch (err) {
      setError("No se pudo cargar la información del perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarPerfil = async (data: {
    nombre?: string;
    correo?: string;
  }) => {
    if (!usuario?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const perfilActualizado = await usuarioService.actualizarUsuario(
        usuario.id,
        data
      );
      setUsuario(perfilActualizado);
      return perfilActualizado;
    } catch (err) {
      setError("No se pudo actualizar el perfil");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refrescarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    usuario,
    isLoading,
    error,
    refrescarPerfil,
    actualizarPerfil,
  };
}
