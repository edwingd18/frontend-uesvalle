"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/shared/store/auth-store'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Inicializar el store de autenticación
    initialize()

    // Redirigir según el estado de autenticación
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, router, initialize])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
