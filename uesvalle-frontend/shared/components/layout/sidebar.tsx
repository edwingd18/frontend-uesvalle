"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Users, 
  Wrench,
  ArrowLeftRight,
  FileText,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'tecnico', 'responsable']
  },
  {
    title: 'Inventario',
    href: '/inventario',
    icon: Package,
    roles: ['admin', 'tecnico', 'responsable']
  },
  {
    title: 'Mantenimientos',
    href: '/mantenimientos',
    icon: Wrench,
    roles: ['admin', 'tecnico']
  },
  {
    title: 'Traslados',
    href: '/traslados',
    icon: ArrowLeftRight,
    roles: ['admin', 'tecnico']
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: FileText,
    roles: ['admin', 'tecnico']
  }
]

export function Sidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  // TODO: Obtener del estado global cuando esté implementado
  const userRole = 'admin' // Temporal

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out min-h-screen relative",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="space-y-4 py-4 flex flex-col h-full">
        {/* Logo y título */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center space-x-2 px-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">UESVALLE</h1>
                <p className="text-xs text-gray-500">Sistema de Activos</p>
              </div>
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Navegación principal */}
        <div className="px-3">
          <div className="space-y-1">
            {!isCollapsed && (
              <h2 className="mb-2 px-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
                Navegación
              </h2>
            )}
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                              (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full transition-all duration-200 relative group",
                    isCollapsed ? "justify-center px-2" : "justify-start",
                    isActive && "bg-primary/10 text-primary border-r-2 border-primary shadow-sm"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className={cn("h-4 w-4 transition-colors", isCollapsed ? "mr-0" : "mr-3")} />
                    {!isCollapsed && (
                      <span className="transition-opacity duration-300">{item.title}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item.title}
                      </div>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Sección inferior */}
        <div className="px-3">
          <div className="space-y-1">
            {!isCollapsed && (
              <h2 className="mb-2 px-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
                Configuración
              </h2>
            )}
            <Button 
              asChild 
              variant="ghost" 
              className={cn(
                "w-full transition-all duration-200 relative group",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
            >
              <Link href="/configuracion">
                <Settings className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && <span>Configuración</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    Configuración
                  </div>
                )}
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Spacer para empujar el contenido hacia abajo */}
        <div className="flex-1"></div>

        <Separator />

        {/* Información del usuario */}
        {!isCollapsed ? (
          <div className="px-3">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Usuario Admin</p>
                <p className="text-xs text-gray-600 truncate">admin@uesvalle.gov.co</p>
                <p className="text-xs text-primary font-medium">Administrador</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm group relative">
              <span className="text-white font-medium text-xs">U</span>
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                <div className="font-medium">Usuario Admin</div>
                <div className="text-gray-300">Administrador</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Botón de logout */}
        <div className="px-3 pt-2 pb-4">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 relative group",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
          >
            <LogOut className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                Cerrar Sesión
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}