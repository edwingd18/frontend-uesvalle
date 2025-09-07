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

      {/* Métricas principales mejoradas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activos</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,245</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600 font-medium">+12.3%</p>
              <p className="text-xs text-gray-500 ml-2">vs mes pasado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En Mantenimiento</CardTitle>
            <Wrench className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">23</div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '18.5%'}}></div>
              </div>
              <span className="text-xs text-gray-500 ml-2">1.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Disponibles</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,187</div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '95.3%'}}></div>
              </div>
              <span className="text-xs text-gray-500 ml-2">95.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Alertas Activas</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="flex items-center mt-2">
              <XCircle className="h-3 w-3 text-red-500 mr-1" />
              <p className="text-xs text-red-600 font-medium">3 críticas</p>
              <p className="text-xs text-gray-500 ml-2">• 5 moderadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de activos por sede */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Activos por Sede
            </CardTitle>
            <CardDescription>
              Distribución de equipos en las diferentes sedes de UESVALLE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Cali - Sede Principal</span>
                </div>
                <span className="text-sm font-medium">456 activos</span>
              </div>
              <Progress value={65} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Palmira</span>
                </div>
                <span className="text-sm font-medium">298 activos</span>
              </div>
              <Progress value={42} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tuluá</span>
                </div>
                <span className="text-sm font-medium">187 activos</span>
              </div>
              <Progress value={27} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Buga</span>
                </div>
                <span className="text-sm font-medium">142 activos</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </CardContent>
        </Card>

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

      {/* Acciones rápidas y actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Accesos directos a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/inventario/nuevo">
                  <Package className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Registrar Activo</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/mantenimientos/nuevo">
                  <Wrench className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Programar Mantenimiento</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/usuarios">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Gestionar Usuarios</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/reportes">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Ver Reportes</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Activo registrado exitosamente</p>
                  <p className="text-xs text-gray-600">UESV-PC-2024-156 • Computador HP ProDesk</p>
                  <p className="text-xs text-gray-500">Hace 15 minutos por Juan Pérez</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mantenimiento completado</p>
                  <p className="text-xs text-gray-600">UESV-IMP-2023-089 • Impresora Canon</p>
                  <p className="text-xs text-gray-500">Hace 2 horas por María González</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Traslado realizado</p>
                  <p className="text-xs text-gray-600">UESV-TAB-2024-034 de Cali a Palmira</p>
                  <p className="text-xs text-gray-500">Hace 4 horas por Carlos Ruiz</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Usuario creado</p>
                  <p className="text-xs text-gray-600">tecnico.palmira@uesvalle.gov.co</p>
                  <p className="text-xs text-gray-500">Hace 1 día por Admin</p>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-primary">
              Ver toda la actividad
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}