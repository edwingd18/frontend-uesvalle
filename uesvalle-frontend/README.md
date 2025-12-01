# UESVALLE - Sistema de Gestión de Activos

Sistema web para la gestión integral de activos, mantenimientos, traslados y usuarios de la Universidad del Valle - Sede Cali.

## Descripción del Proyecto

UESVALLE es una aplicación web moderna desarrollada con Next.js 15 que permite administrar de manera eficiente:

- **Inventario de Activos**: Registro, consulta y gestión de activos institucionales
- **Mantenimientos**: Planificación y seguimiento de mantenimientos preventivos y correctivos
- **Traslados**: Control de movimientos de activos entre sedes y ubicaciones
- **Usuarios**: Gestión de usuarios con roles diferenciados (Admin, SysMan, Responsable, Técnico)
- **Planificación**: Programación y calendario de actividades de mantenimiento
- **Dashboard**: Visualización de métricas y estadísticas del sistema

## Tecnologías Principales

- **Framework**: Next.js 15.5.2 con App Router
- **UI**: React 19, Tailwind CSS 4, Radix UI
- **Gestión de Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack Table
- **Gráficos**: Chart.js, Recharts
- **HTTP Client**: Axios
- **Exportación**: jsPDF, XLSX

## Requisitos Previos

- Node.js 20 o superior
- pnpm (recomendado) o npm
- Archivo `.env.local` con las variables de entorno necesarias

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd uesvalle-frontend
```

2. Instalar dependencias:

```bash
pnpm install
```

3. Configurar variables de entorno:

```bash
# Crear archivo .env.local con:
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Ejecución

### Modo Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3001](http://localhost:3001)

**Nota**: El servidor de desarrollo se ejecuta en el puerto 3001 (configurado en `package.json`) para evitar conflictos con otras aplicaciones.

### Modo Producción

```bash
pnpm build
pnpm start
```

## Consideraciones Técnicas

### Enrutamiento

El proyecto utiliza el **App Router** de Next.js 15 con las siguientes características:

- **Rutas Públicas**: `/login` - Accesible sin autenticación
- **Rutas Protegidas**: Todas las rutas bajo `/(dashboard)` requieren autenticación
- **Protección por Rol**: Algunas rutas como `/usuarios` están protegidas adicionalmente por rol mediante el componente `RoleGuard`
- **Middleware**: El archivo `middleware.ts` maneja redirecciones básicas (la autenticación se gestiona en el cliente)

### Autenticación

El sistema de autenticación funciona de la siguiente manera:

1. **Login**: El usuario ingresa credenciales en `/login`
2. **Token JWT**: El backend retorna un token JWT que se almacena en `localStorage` mediante Zustand
3. **AuthGuard**: Componente que envuelve las rutas protegidas y verifica la autenticación
4. **RoleGuard**: Componente adicional para proteger rutas específicas por rol de usuario
5. **Persistencia**: El estado de autenticación persiste entre recargas usando `zustand/persist`

**Flujo de autenticación**:

```
Usuario → Login → API Backend → Token JWT → localStorage → AuthGuard → Dashboard
```

**Archivos clave**:

- `shared/store/auth-store.ts` - Estado global de autenticación
- `shared/services/auth-service.ts` - Servicios de API para autenticación
- `shared/components/auth/auth-guard.tsx` - Protección de rutas autenticadas
- `shared/components/auth/role-guard.tsx` - Protección de rutas por rol

### Comunicación con el Backend

La aplicación se comunica con el backend mediante Axios con las siguientes configuraciones:

**Variables de Entorno**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Configuración de Axios**:

- Base URL configurada desde `NEXT_PUBLIC_API_URL`
- Interceptores para agregar el token JWT en cada petición
- Manejo centralizado de errores HTTP
- Timeout configurado para evitar peticiones colgadas

**Estructura de Servicios**:

```
shared/services/
├── auth-service.ts           # Autenticación y usuarios
├── inventario-service.ts     # Gestión de activos
├── mantenimientos-service.ts # Mantenimientos
├── traslados-service.ts      # Traslados de activos
└── api-client.ts            # Cliente Axios configurado
```

**Ejemplo de petición**:

```typescript
// El token se agrega automáticamente en los headers
const response = await apiClient.get("/activos");
// Headers: { Authorization: 'Bearer <token>' }
```

### Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Opcional: Configuración adicional
# NEXT_PUBLIC_APP_ENV=development
```

**Importante**:

- Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente
- Reiniciar el servidor de desarrollo después de modificar variables de entorno
- No commitear el archivo `.env.local` (está en `.gitignore`)

## Estructura del Proyecto

```
uesvalle-frontend/
├── app/                    # App Router de Next.js
│   ├── (dashboard)/       # Rutas protegidas del dashboard
│   ├── auth/              # Rutas de autenticación
│   └── login/             # Página de inicio de sesión
├── features/              # Módulos por funcionalidad
│   ├── dashboard/
│   ├── inventario/
│   ├── mantenimientos/
│   ├── planificacion/
│   ├── traslados/
│   └── usuarios/
├── shared/                # Código compartido
│   ├── components/        # Componentes reutilizables
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios API
│   ├── store/            # Estado global (Zustand)
│   └── types/            # Tipos TypeScript
├── components/           # Componentes UI base (shadcn)
└── public/              # Archivos estáticos
```

## Roles de Usuario

- **ADMIN**: Acceso completo al sistema
- **SYSMAN**: Gestión de usuarios y configuración del sistema
- **RESPONSABLE**: Gestión de activos y mantenimientos de su sede
- **TECNICO**: Ejecución de mantenimientos asignados

## Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo en el puerto 3001
- `pnpm build` - Genera el build de producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta el linter de código

## Características Principales

- Autenticación basada en JWT con roles
- Protección de rutas por rol de usuario
- Interfaz responsive y moderna
- Exportación de reportes en PDF y Excel
- Gestión de estados con Zustand y persistencia en localStorage
- Validación de formularios con Zod
- Tablas interactivas con filtrado y ordenamiento
- Gráficos y visualizaciones de datos

## Solución de Problemas Comunes

### El servidor no inicia

```bash
# Verificar que el puerto 3001 esté disponible
# En Windows:
netstat -ano | findstr :3001

# Limpiar caché de Next.js
rm -rf .next
pnpm dev
```

### Error de conexión con el backend

1. Verificar que el backend esté ejecutándose en `http://localhost:3000`
2. Confirmar que `NEXT_PUBLIC_API_URL` esté correctamente configurado en `.env.local`
3. Revisar la consola del navegador para errores CORS

### Problemas de autenticación

1. Limpiar `localStorage` del navegador
2. Verificar que el token JWT sea válido
3. Revisar que el backend esté retornando el token correctamente

### Errores de TypeScript

```bash
# Regenerar tipos
pnpm build

# Verificar configuración
cat tsconfig.json
```