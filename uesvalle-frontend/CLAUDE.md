# CONTEXTO DEL PROYECTO - SISTEMA UESVALLE

## 📋 INFORMACIÓN GENERAL
- **Proyecto**: Sistema de Gestión de Activos Tecnológicos
- **Entidad**: UESVALLE - Unidad Ejecutora de Saneamiento del Valle del Cauca
- **Tipo**: Proyecto de pasantía universitaria
- **Duración**: 2-3 semanas de desarrollo
- **Estado**: En desarrollo inicial
- **Enfoque actual**: Frontend únicamente con datos mock

## 🎯 OBJETIVO
Desarrollar una aplicación web para gestionar el inventario de activos tecnológicos de UESVALLE, que opera en múltiples municipios del Valle del Cauca. El sistema debe permitir control de inventario, mantenimientos, traslados y soporte técnico.

## 👥 USUARIOS Y ROLES

### 1. **Administrador**
- Control total del sistema
- Gestión de usuarios
- Acceso a reportes y auditoría
- Configuración del sistema

### 2. **Técnico**
- Registro de mantenimientos
- Gestión de tickets de soporte
- Registro de traslados
- Actualización de activos

### 3. **Responsable**
- Ver solo sus activos asignados
- Solicitar soporte técnico
- Ver historial de sus equipos

## 🚀 TECNOLOGÍAS UTILIZADAS

### Stack Principal
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm

### Librerías Instaladas
- **zustand**: Estado global (autenticación, filtros)
- **react-hook-form**: Manejo de formularios
- **zod**: Validación de esquemas
- **axios**: Cliente HTTP (para futuro backend)
- **lucide-react**: Iconos
- **react-hot-toast**: Notificaciones
- **date-fns**: Formateo de fechas
- **recharts**: Gráficas del dashboard
- **@tanstack/react-table**: Tablas avanzadas

## 📁 ARQUITECTURA DEL PROYECTO

### Estructura Feature-Based
```
uesvalle-frontend/
├── app/                      # Páginas y routing (Next.js App Router)
│   ├── (auth)/              # Grupo de rutas públicas (sin sidebar)
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Grupo de rutas protegidas (con sidebar)
│   │   ├── inventario/
│   │   ├── mantenimientos/
│   │   ├── usuarios/
│   │   └── layout.tsx
│   └── layout.tsx          # Root layout
│
├── features/               # Lógica de negocio por módulo
│   ├── auth/              # Autenticación
│   ├── inventario/        # Gestión de activos
│   ├── dashboard/         # Dashboard y métricas
│   └── mantenimientos/    # Mantenimientos
│
├── shared/                # Componentes y utilidades compartidas
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Sidebar, Header
│   │   └── common/       # Componentes reutilizables
│   └── lib/              # Utilidades
│
└── mocks/                # Datos de prueba JSON
```

### Principio de Separación
- **app/**: Solo páginas thin que importan componentes
- **features/**: Toda la lógica, hooks, servicios y componentes
- **shared/**: Código reutilizable entre features

## 📊 MÓDULOS PRINCIPALES

### 1. INVENTARIO (Prioridad Alta)
- **RF-014 a RF-020**: CRUD completo de activos
- Listado con filtros y paginación
- Formulario de registro/edición
- Hoja de vida del activo
- Cambio de estados

### 2. DASHBOARD (Prioridad Alta)
- **RF-008 a RF-013**: Paneles por rol
- Métricas: total activos, estados, mantenimientos mes
- Gráficas con recharts
- Accesos rápidos diferenciados

### 3. AUTENTICACIÓN (Prioridad Crítica)
- **RF-001 a RF-007**: Gestión de usuarios
- Login con validación @uesvalle.gov.co
- 3 roles diferenciados
- Perfil de usuario

### 4. MANTENIMIENTOS (Prioridad Media)
- **RF-021 a RF-025**: Gestión de mantenimientos
- Programar preventivos
- Registrar correctivos
- Historial y consultas

### 5. TRASLADOS (Prioridad Baja)
- **RF-026 a RF-028**: Registro de traslados
- Cambio de ubicación/responsable
- Generación de actas

## 🔑 REQUERIMIENTOS NO FUNCIONALES CLAVE

- **RNF-012**: Responsive (1366x768 desktop, 360x640 móvil)
- **RNF-002**: Tiempo respuesta <3 segundos consultas simples
- **RNF-004**: Paginación automática >50 registros
- **RNF-014**: Notificaciones toast auto-cierre 5 segundos
- **RNF-006**: Contraseñas mínimo 8 caracteres con complejidad

## 📝 DATOS MOCK

### Usuarios de prueba
```json
{
  "admin": "admin@uesvalle.gov.co / Admin123!",
  "tecnico": "tecnico@uesvalle.gov.co / Tecnico123!",
  "responsable": "responsable@uesvalle.gov.co / Resp123!"
}
```

### Estructura de Activo
```typescript
interface Activo {
  id: number
  placa: string  // Formato: UESV-TIPO-AÑO-CONSECUTIVO
  tipo: 'computador' | 'portatil' | 'tablet' | 'impresora' | 'router' | 'switch' | 'servidor' | 'ups' | 'monitor'
  marca: string
  modelo: string
  serial: string
  estado: 'bueno' | 'regular' | 'malo' | 'mantenimiento' | 'baja'
  responsable: string
  sede: string
  fechaAdquisicion: string
  valor: number
  garantiaHasta?: string
}
```

### Sedes principales
- Cali - Sede Principal
- Palmira
- Tuluá
- Buga
- Cartago

## 🎨 DECISIONES DE DISEÑO

1. **Sin backend real**: Todo con mocks y localStorage
2. **shadcn/ui**: Para componentes consistentes y profesionales
3. **Feature-based**: Arquitectura escalable y organizada
4. **Zustand**: Estado simple sin complejidad de Redux
5. **TypeScript**: Type safety en todo el proyecto

## 🚧 ESTADO ACTUAL DEL DESARROLLO

### ✅ Completado
- Setup inicial del proyecto
- Instalación de dependencias
- Estructura de carpetas básica

### 🔄 En Progreso
- [ ] Configuración de shadcn/ui
- [ ] Layout con sidebar
- [ ] Página de login
- [ ] Dashboard básico

### 📋 Pendiente
- [ ] CRUD de inventario
- [ ] Gestión de usuarios
- [ ] Mantenimientos
- [ ] Traslados
- [ ] Reportes

## 🎯 PRIORIDADES PARA APROBAR PASANTÍA

### Mínimo Viable (Semana 1)
1. ✅ Login funcionando con 3 roles
2. ✅ Dashboard diferenciado por rol
3. ✅ CRUD básico de inventario
4. ✅ Navegación con sidebar
5. ✅ Datos mock realistas

### Nice to Have (Semana 2-3)
6. ⭕ Gestión de usuarios
7. ⭕ Módulo de mantenimientos
8. ⭕ Filtros avanzados
9. ⭕ Exportación de datos

## 🔗 RUTAS PRINCIPALES

```
/login                     → Página de login
/                         → Dashboard (redirige según rol)
/inventario               → Listado de activos
/inventario/nuevo         → Crear activo
/inventario/[id]          → Detalle de activo
/inventario/[id]/editar   → Editar activo
/mantenimientos           → Listado de mantenimientos
/usuarios                 → Gestión de usuarios (solo admin)
/perfil                   → Perfil del usuario actual
```

## 🐛 CONSIDERACIONES Y LIMITACIONES

1. **Sin autenticación real**: Login con mocks, token en localStorage
2. **Sin persistencia real**: Datos en memoria/localStorage
3. **Sin backend**: Todas las operaciones son simuladas
4. **Tiempo limitado**: 2-3 semanas, priorizar funcionalidades core
5. **Para desarrollo**: No configurar producción compleja

## 💡 NOTAS IMPORTANTES

- El formato de placa institucional es: UESV-TIPO-AÑO-CONSECUTIVO
- Los correos deben ser @uesvalle.gov.co
- Fechas en formato colombiano: DD/MM/YYYY
- Moneda en pesos colombianos
- La entidad opera en múltiples municipios del Valle del Cauca
- Es un proyecto de pasantía, debe verse profesional pero no requiere complejidad enterprise

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo (cambiar al directorio uesvalle-frontend primero)
cd uesvalle-frontend
npm run dev

# Build
npm run build

# Start production
npm start

# Linting
npm run lint

# Agregar componente shadcn
npx shadcn-ui@latest add [component]
```

## 📂 ESTRUCTURA DE CARPETAS ACTUAL

```
uesvalle-frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Grupo de rutas públicas (login)
│   ├── (dashboard)/           # Grupo de rutas protegidas
│   │   ├── dashboard/         # Dashboard principal
│   │   └── layout.tsx        # Layout con sidebar
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Página principal (redirect a dashboard)
│
├── components/ui/             # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (otros componentes UI)
│
├── shared/                   # Componentes compartidos
│   └── components/
│       └── layout/
│           └── sidebar.tsx  # Componente Sidebar principal
│
├── lib/
│   └── utils.ts            # Utilidades (cn function, etc.)
│
└── mocks/                  # Datos de prueba (pendiente)
```

## 🔧 CONFIGURACIÓN TÉCNICA

### Package Manager
- **Usar**: `npm` (no pnpm como está documentado)
- El proyecto tiene `package-lock.json` en lugar de `pnpm-lock.yaml`

### Scripts disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm start` - Servidor de producción
- `npm run lint` - Linting con ESLint

### Componentes UI
- Instalado: shadcn/ui con múltiples componentes
- Configuración en `components.json`
- Tema y utilidades en `lib/utils.ts`

## 🏗️ PATRONES DE DESARROLLO

### Routing
- Next.js App Router con grupos de rutas:
  - `(auth)` - Login sin sidebar
  - `(dashboard)` - Rutas protegidas con sidebar

### Layout System
- Root layout: `app/layout.tsx` (fuentes Geist, metadata)
- Dashboard layout: `app/(dashboard)/layout.tsx` (sidebar responsive)
- Sidebar colapsible con estado local y mobile sheet

### Estado y datos
- Configurado Zustand para estado global (pendiente implementar)
- Datos mock en desarrollo (localStorage)
- Axios configurado para futuras llamadas API

---

*Este documento debe actualizarse conforme avanza el desarrollo del proyecto.*