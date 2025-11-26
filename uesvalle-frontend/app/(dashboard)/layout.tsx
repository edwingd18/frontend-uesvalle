"use client"

import { useState } from 'react'
import { Sidebar } from '@/shared/components/layout/sidebar'
import { AuthGuard } from '@/shared/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AuthGuard>
      <div className="flex bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar Mobile */}
      <>
        {/* Botón hamburguesa */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-40"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>

        {/* Overlay y Sidebar Mobile */}
        {sidebarOpen && (
          <>
            {/* Overlay de fondo */}
            <div 
              className="lg:hidden fixed inset-0 z-30 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
              {/* Botón hamburguesa dentro del sidebar */}
              <div className="absolute top-4 right-4 z-50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Cerrar menú</span>
                </Button>
              </div>
              <Sidebar />
            </div>
          </>
        )}
      </>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        <main className="focus:outline-none p-6 pt-16 lg:pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  )
}