"use client"

import { useState, useEffect, useCallback } from 'react'

interface FilterState {
  globalFilter: string
  tipo: string
  estado: string
  proceso: string
  sede: string
}

const DEFAULT_FILTERS: FilterState = {
  globalFilter: '',
  tipo: '',
  estado: '',
  proceso: '',
  sede: ''
}

const STORAGE_KEY = 'inventario-filters'

export function usePersistentFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar filtros del localStorage al montar
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY)
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters)
        setFilters({ ...DEFAULT_FILTERS, ...parsedFilters })
      }
    } catch (error) {
      console.warn('Error loading saved filters:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    if (!isLoaded) return // No guardar hasta que se carguen los filtros iniciales

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    } catch (error) {
      console.warn('Error saving filters:', error)
    }
  }, [filters, isLoaded])

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const clearFilter = useCallback((key: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: DEFAULT_FILTERS[key]
    }))
  }, [])

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => value !== '')
  }, [filters])

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(filters).filter(value => value !== '').length
  }, [filters])

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters: hasActiveFilters(),
    activeFiltersCount: getActiveFiltersCount(),
    isLoaded
  }
}