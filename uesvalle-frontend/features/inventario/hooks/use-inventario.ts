"use client"

import { useState, useEffect } from 'react'
import { Activo } from '@/shared/types/inventario'
import { authService } from '@/shared/services/auth-service'
import { API_BASE_URL } from '@/shared/config/api'

export function useInventario() {
  const [data, setData] = useState<Activo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/activos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
        credentials: 'include', // ✅ Enviar cookies automáticamente
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const activosData = await response.json()

      // Transformar los datos de la API al formato esperado
      const activos: Activo[] = activosData.map((item: any) => {
        // Mapear estados de la API a los valores esperados
        let estado = item.estado.toLowerCase()
        switch (estado) {
          case 'activo':
            estado = 'bueno'
            break
          case 'en reparación':
          case 'en_reparacion':
            estado = 'mantenimiento'
            break
          case 'baja':
            estado = 'baja'
            break
          default:
            estado = 'bueno'
        }

        // Mapear procesos de la API a los valores esperados
        let proceso = item.proceso.toLowerCase().replace(/\s+/g, '_')
        switch (proceso) {
          case 'producción':
          case 'produccion':
            proceso = 'sistemas'
            break
          case 'administrativo':
            proceso = 'administracion'
            break
          case 'soporte_técnico':
          case 'soporte_tecnico':
            proceso = 'tecnica'
            break
          case 'académico':
          case 'academico':
            proceso = 'administracion'
            break
          case 'depuración':
          case 'depuracion':
            proceso = 'sistemas'
            break
          default:
            proceso = 'sistemas'
        }

        return {
          id: parseInt(item.id),
          serial: item.serial,
          placa: item.placa,
          tipo: item.tipo.toLowerCase() as any,
          marca: item.marca,
          modelo: item.modelo,
          sede_id: parseInt(item.sede_id),
          usuario_sysman_id: item.usuario_sysman_id ? parseInt(item.usuario_sysman_id) : null,
          usuario_uso_id: item.usuario_uso_id ? parseInt(item.usuario_uso_id) : null,
          estado: estado as any,
          proceso: proceso as any,
          fechaAdquisicion: item.fechaAdquisicion,
          valor: item.valor
        }
      })

      setData(activos)
    } catch (err) {
      console.error('Error al cargar activos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los activos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivos()
  }, [])

  const refreshData = async () => {
    await fetchActivos()
  }

  return {
    data,
    loading,
    error,
    refreshData
  }
}