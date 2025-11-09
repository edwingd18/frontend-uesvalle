import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  Wrench,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Plus,
  BarChart3,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Nuevos componentes mejorados
import { MetricsCard } from '@/features/dashboard/components/metrics-card'
import { InteractiveChart } from '@/features/dashboard/components/interactive-chart'
import { QuickActions } from '@/features/dashboard/components/quick-actions'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido de nuevo, <span className="font-medium text-primary">Admin</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      {/* Métricas principales con componentes mejorados */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Activos"
          value="1,245"
          icon={Package}
          trend={{
            value: "+12.3%",
            isPositive: true,
            label: "vs mes pasado"
          }}
          badge={{
            text: "Activo",
            variant: "outline"
          }}
        />

        <MetricsCard
          title="En Mantenimiento"
          value="23"
          icon={Wrench}
          description="1.8% del total"
          badge={{
            text: "Urgente",
            variant: "destructive"
          }}
        />

        <MetricsCard
          title="Disponibles"
          value="1,187"
          icon={CheckCircle}
          trend={{
            value: "95.3%",
            isPositive: true,
            label: "operativos"
          }}
        />

        <MetricsCard
          title="Alertas Activas"
          value="8"
          icon={AlertTriangle}
          description="3 críticas • 5 moderadas"
          badge={{
            text: "Crítico",
            variant: "destructive"
          }}
        />
      </div>

      {/* Gráficas y estadísticas mejoradas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica interactiva con shadcn charts */}
        <InteractiveChart />

        {/* Próximos mantenimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Próximos Mantenimientos
            </CardTitle>
            <CardDescription>
              Equipos programados para revisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-shrink-0">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">UESV-PC-2023-089</p>
                  <p className="text-xs text-gray-600">Hoy • 14:30</p>
                  <p className="text-xs text-orange-600 font-medium">Mantenimiento preventivo</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">UESV-IMP-2024-012</p>
                  <p className="text-xs text-gray-600">Mañana • 09:00</p>
                  <p className="text-xs text-blue-600 font-medium">Revisión general</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">UESV-SRV-2023-004</p>
                  <p className="text-xs text-gray-600">15 Mar • 16:00</p>
                  <p className="text-xs text-gray-600 font-medium">Actualización sistema</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/mantenimientos">
                Ver todos los mantenimientos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas y actividad mejoradas */}
      <QuickActions userRole="admin" />
    </div>
  )
}