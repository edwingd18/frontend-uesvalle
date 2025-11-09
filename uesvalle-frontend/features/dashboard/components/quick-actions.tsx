import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Package,
  Wrench,
  Users,
  BarChart3,
  Plus,
  AlertTriangle,
  Clock,
  Activity
} from "lucide-react"

const quickActions = [
  {
    href: "/inventario/nuevo",
    icon: Package,
    title: "Registrar Activo",
    description: "Agregar nuevo equipo",
    color: "text-orange-600 bg-orange-100",
  },
  {
    href: "/mantenimientos/nuevo",
    icon: Wrench,
    title: "Programar Mantenimiento",
    description: "Agendar revisión",
    color: "text-sky-600 bg-sky-100",
  },
  {
    href: "/usuarios",
    icon: Users,
    title: "Gestionar Usuarios",
    description: "Administrar accesos",
    color: "text-green-600 bg-green-100",
  },
  {
    href: "/reportes",
    icon: BarChart3,
    title: "Ver Reportes",
    description: "Análisis y métricas",
    color: "text-slate-600 bg-slate-100",
  },
]

const recentActivity = [
  {
    type: "success",
    title: "Activo registrado exitosamente",
    description: "UESV-PC-2024-156 • Computador HP ProDesk",
    time: "Hace 15 minutos",
    user: "Juan Pérez",
    color: "bg-green-500",
  },
  {
    type: "info",
    title: "Mantenimiento completado",
    description: "UESV-IMP-2023-089 • Impresora Canon",
    time: "Hace 2 horas",
    user: "María González",
    color: "bg-sky-500",
  },
  {
    type: "warning",
    title: "Traslado realizado",
    description: "UESV-TAB-2024-034 de Cali a Palmira",
    time: "Hace 4 horas",
    user: "Carlos Ruiz",
    color: "bg-orange-500",
  },
  {
    type: "info",
    title: "Usuario creado",
    description: "tecnico.palmira@uesvalle.gov.co",
    time: "Hace 1 día",
    user: "Admin",
    color: "bg-slate-500",
  },
]

interface QuickActionsProps {
  userRole?: string
}

export function QuickActions({ userRole = "admin" }: QuickActionsProps) {
  // Filtrar acciones según el rol del usuario
  const filteredActions = quickActions.filter(action => {
    if (userRole === "responsable") {
      return action.href !== "/usuarios" // Responsables no pueden gestionar usuarios
    }
    return true
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Accesos directos a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {filteredActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent/50 transition-colors group p-4"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-sm font-medium leading-tight">{action.title}</div>
                      <div className="text-xs text-muted-foreground leading-tight">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Alertas rápidas */}
          <div className="mt-6 pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Alertas Pendientes
              </h4>
              <Badge variant="destructive" className="text-xs">
                3 críticas
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm bg-red-50 p-2 rounded-md">
                <span className="text-gray-700">Mantenimientos vencidos</span>
                <Badge variant="destructive" className="text-xs">5</Badge>
              </div>
              <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-md">
                <span className="text-gray-700">Garantías por vencer</span>
                <Badge variant="outline" className="text-xs">12</Badge>
              </div>
              <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-md">
                <span className="text-gray-700">Activos sin responsable</span>
                <Badge variant="secondary" className="text-xs">3</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Actividad Reciente
            <Badge variant="outline" className="text-xs">
              Últimas 24h
            </Badge>
          </CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 group hover:bg-accent/30 p-2 rounded-lg transition-colors">
                <div className={`flex-shrink-0 w-2 h-2 ${activity.color} rounded-full mt-2`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.time} por {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/5" asChild>
            <Link href="/actividad">
              Ver toda la actividad
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}