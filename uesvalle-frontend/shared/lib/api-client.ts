import { API_BASE_URL } from "@/shared/config/api";
import { authService } from "@/shared/services/auth-service";

export interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

// Flag para evitar múltiples redirecciones simultáneas
let isRedirecting = false;

/**
 * Maneja la expiración de sesión
 */
function handleSessionExpired(): void {
  if (typeof window === "undefined" || isRedirecting) return;

  isRedirecting = true;

  // Limpiar el storage de autenticación
  localStorage.removeItem("auth-storage");

  // Guardar la URL actual para redirigir después del login
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== "/login" && currentPath !== "/") {
    sessionStorage.setItem("redirectAfterLogin", currentPath);
  }

  // Redirigir al login
  window.location.href = "/login";
}

/**
 * Cliente HTTP centralizado con manejo de errores de autenticación
 */
export async function apiClient(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  // Construir headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Agregar token si se requiere autenticación
  if (requiresAuth) {
    const authHeader = authService.getAuthHeader();
    Object.assign(requestHeaders, authHeader);
  }

  try {
    // Hacer la petición
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: requestHeaders,
      credentials: "include",
    });

    // Manejar error 401 (token vencido o inválido)
    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Manejar error 403 (sin permisos)
    if (response.status === 403) {
      throw new Error("No tienes permisos para realizar esta acción.");
    }

    return response;
  } catch (error) {
    // Si es un error de red, lanzar un mensaje más claro
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Error de conexión. Verifica tu conexión a internet o que el servidor esté disponible."
      );
    }
    throw error;
  }
}

/**
 * Helper para hacer peticiones GET
 */
export async function apiGet<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "GET",
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "Error en la petición");
  }

  return response.json();
}

/**
 * Helper para hacer peticiones POST
 */
export async function apiPost<T>(
  endpoint: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "Error en la petición");
  }

  return response.json();
}

/**
 * Helper para hacer peticiones PATCH
 */
export async function apiPatch<T>(
  endpoint: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "Error en la petición");
  }

  return response.json();
}

/**
 * Helper para hacer peticiones DELETE
 */
export async function apiDelete<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "DELETE",
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "Error en la petición");
  }

  return response.json();
}
