import { Activo } from '@/shared/types/inventario'
import { API_BASE_URL } from '@/shared/config/api'
import { authService } from '@/shared/services/auth-service'

export interface CreateActivoData {
  serial: string
  placa: string
  tipo: string
  marca: string
  modelo: string
  sede_id: number
  usuario_sysman_id?: number | null
  usuario_uso_id?: number | null
  estado: string
  proceso: string
}

export interface UpdateActivoData extends Partial<CreateActivoData> {}

class ActivosService {
  async getActivos(): Promise<Activo[]> {
    const response = await fetch(`${API_BASE_URL}/activos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  async getActivo(id: number): Promise<Activo> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  async createActivo(data: CreateActivoData): Promise<Activo> {
    const response = await fetch(`${API_BASE_URL}/activos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || error.error || 'Error al crear activo')
    }

    return await response.json()
  }

  async updateActivo(id: number, data: UpdateActivoData): Promise<Activo> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || error.error || 'Error al actualizar activo')
    }

    return await response.json()
  }

  async deleteActivo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/activos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || error.error || 'Error al eliminar activo')
    }
  }
}

export const activosService = new ActivosService()
