"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/shared/store/auth-store'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Inicializar el store de autenticación desde localStorage
    initialize()

    // Pequeño delay para que Zustand cargue desde localStorage
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [initialize])

  useEffect(() => {
    // Verificar autenticación después de que termine de cargar
    if (!isChecking && !isAuthenticated && !token) {
      router.push('/login')
    }
  }, [isChecking, isAuthenticated, token, router])

  // Mostrar loader mientras carga
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar loader mientras redirige
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>
}
