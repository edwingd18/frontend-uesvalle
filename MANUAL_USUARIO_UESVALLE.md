# MANUAL DE USUARIO

## Sistema de Gestión de Activos Tecnológicos UESVALLE

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Universidad del Valle de México - UESVALLE**

---

## TABLA DE CONTENIDO

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Acceso a la Plataforma](#acceso-a-la-plataforma)
4. [Uso General de la Interfaz](#uso-general-de-la-interfaz)
5. [Manual del Técnico](#manual-del-técnico)
6. [Manual del Administrador](#manual-del-administrador)
7. [Generación de Reportes](#generación-de-reportes)
8. [Buenas Prácticas de Uso](#buenas-prácticas-de-uso)
9. [Solución de Problemas](#solución-de-problemas)
10. [Contacto y Soporte](#contacto-y-soporte)

---

## 1. INTRODUCCIÓN

### ¿Qué es la aplicación?

El Sistema de Gestión de Activos Tecnológicos de UESVALLE es una plataforma web diseñada para administrar, controlar y dar seguimiento a todos los activos tecnológicos de la universidad. Permite gestionar el inventario, programar y registrar mantenimientos, controlar traslados entre sedes, y generar reportes detallados.

### ¿Para quién está hecha?

Esta aplicación está diseñada para dos tipos de usuarios principales:

- **Técnicos:** Personal encargado del mantenimiento y gestión operativa de los activos
- **Administradores:** Personal con permisos completos para gestionar usuarios, aprobar traslados y supervisar todas las operaciones

### Objetivo del manual

Este manual tiene como propósito guiar al usuario en el uso correcto del Sistema de Gestión de Activos de UESVALLE, explicando las funciones disponibles según el rol asignado dentro de la plataforma.

### Alcance de la herramienta

El sistema permite:

- Gestión completa del inventario de activos tecnológicos
- Registro y seguimiento de mantenimientos preventivos y correctivos
- Control de traslados de activos entre sedes
- Planificación anual de mantenimientos
- Gestión de usuarios y permisos (solo administradores)
- Generación de reportes en PDF y Excel
- Dashboard con métricas y estadísticas en tiempo real

---

## 2. REQUISITOS DEL SISTEMA

### Navegador recomendado

- **Google Chrome** (versión 90 o superior) - Recomendado
- **Mozilla Firefox** (versión 88 o superior)
- **Microsoft Edge** (versión 90 o superior)
- **Safari** (versión 14 o superior)

### Resolución de pantalla

- **Mínima:** 1366 x 768 píxeles
- **Recomendada:** 1920 x 1080 píxeles o superior
- Compatible con dispositivos móviles y tablets

### Conectividad

- Conexión a internet estable
- Velocidad mínima recomendada: 5 Mbps

### Credenciales necesarias

- Usuario y contraseña proporcionados por el administrador del sistema
- Rol asignado (Técnico o Administrador)

---

## 3. ACCESO A LA PLATAFORMA

### URL de acceso

**Entorno de desarrollo/local:**

```
http://localhost:3001
```

**Entorno de producción:**

```
https://uesvalle-activos.com (URL a definir en producción)
```

### Pantalla de Login

1. Ingrese a la URL del sistema
2. Se mostrará la pantalla de inicio de sesión
3. Ingrese su **correo electrónico** institucional
4. Ingrese su **contraseña**
5. Haga clic en el botón **"Iniciar Sesión"**

**Captura recomendada:** Pantalla de login con campos de usuario y contraseña

### Mensajes de error comunes en login

| Error                    | Causa                            | Solución                                   |
| ------------------------ | -------------------------------- | ------------------------------------------ |
| "Credenciales inválidas" | Usuario o contraseña incorrectos | Verifique sus datos e intente nuevamente   |
| "Usuario no encontrado"  | El correo no está registrado     | Contacte al administrador                  |
| "Cuenta bloqueada"       | Múltiples intentos fallidos      | Contacte al administrador para desbloquear |
| "Error de conexión"      | Sin conexión al servidor         | Verifique su conexión a internet           |

### Recuperación de credenciales

Si olvidó su contraseña:

1. Contacte al administrador del sistema
2. Proporcione su correo institucional
3. El administrador restablecerá su contraseña
4. Recibirá las nuevas credenciales por correo electrónico

---

## 4. USO GENERAL DE LA INTERFAZ

Esta sección aplica para todos los usuarios, independientemente de su rol.

### 4.1 Menú lateral (Sidebar)

El menú lateral es la barra de navegación principal del sistema. Contiene:

**Sección de Navegación:**

- **Dashboard:** Vista general con métricas y estadísticas
- **Inventario:** Gestión de activos tecnológicos
- **Mantenimientos:** Registro y seguimiento de mantenimientos
- **Planificación:** Planificación anual de mantenimientos
- **Traslados:** Control de movimientos de activos entre sedes
- **Usuarios:** Gestión de usuarios (solo visible para administradores)

**Sección de Configuración:**

- **Configuración:** Ajustes del sistema y preferencias

**Información del usuario:**

- Muestra su nombre completo
- Muestra su correo electrónico
- Muestra su rol (Administrador, Sysman o Técnico)
- Avatar con iniciales

**Botón de Cerrar Sesión:**

- Ubicado en la parte inferior del menú
- Cierra la sesión actual y regresa al login

**Captura recomendada:** Vista completa del menú lateral con todas las opciones

### 4.2 Barra superior

La barra superior contiene:

- Título de la sección actual
- Botón para colapsar/expandir el menú lateral (icono de flechas)
- Breadcrumbs (ruta de navegación)

### 4.3 Elementos comunes de la interfaz

#### Iconos principales

| Icono        | Significado               |
| ------------ | ------------------------- |
| 📊 Dashboard | Vista general del sistema |
| 📦 Package   | Inventario de activos     |
| 🔧 Wrench    | Mantenimientos            |
| 📅 Calendar  | Planificación             |
| ↔️ Arrows    | Traslados                 |
| 👥 Users     | Gestión de usuarios       |
| ⚙️ Settings  | Configuración             |
| 🚪 Logout    | Cerrar sesión             |

#### Botones de acción comunes

- **Crear/Nuevo:** Botón naranja con icono "+" para agregar nuevos registros
- **Editar:** Icono de lápiz para modificar registros existentes
- **Ver:** Icono de ojo para visualizar detalles
- **Eliminar:** Icono de papelera para eliminar registros
- **Exportar:** Botones para descargar PDF o Excel

#### Tablas de datos

Todas las tablas del sistema incluyen:

- **Paginación:** Navegación entre páginas de resultados
- **Búsqueda:** Campo de búsqueda rápida en la parte superior
- **Filtros:** Opciones para filtrar por diferentes criterios
- **Ordenamiento:** Clic en encabezados de columna para ordenar
- **Acciones:** Columna con botones de acción para cada registro

**Captura recomendada:** Ejemplo de tabla con datos, mostrando paginación y filtros

#### Formularios

Los formularios del sistema incluyen:

- Campos obligatorios marcados con asterisco (\*)
- Validación en tiempo real
- Mensajes de error descriptivos
- Botones "Guardar" y "Cancelar"
- Campos de selección (dropdowns) para opciones predefinidas
- Campos de fecha con calendario desplegable

**Captura recomendada:** Ejemplo de formulario de creación/edición

#### Filtros

Los filtros permiten refinar los resultados mostrados:

1. Haga clic en el botón "Filtros" o en los campos de filtro
2. Seleccione los criterios deseados (sede, categoría, estado, etc.)
3. Los resultados se actualizan automáticamente
4. Use "Limpiar filtros" para restablecer

#### Notificaciones

El sistema muestra notificaciones tipo "toast" en la esquina superior derecha:

- **Verde:** Operación exitosa
- **Rojo:** Error o problema
- **Amarillo:** Advertencia
- **Azul:** Información

---

## 5. MANUAL DEL TÉCNICO

Este manual está dirigido a usuarios con rol de **Técnico**.

### 5.1 Visualizar Inventario

El módulo de inventario permite consultar todos los activos tecnológicos de la universidad.

#### Acceder al inventario

1. Haga clic en **"Inventario"** en el menú lateral
2. Se mostrará la tabla con todos los activos

#### Información mostrada

La tabla de inventario muestra:

- **Código:** Identificador único del activo
- **Nombre:** Descripción del activo
- **Categoría:** Tipo de activo (Computadora, Impresora, Proyector, etc.)
- **Marca y Modelo:** Información del fabricante
- **Sede:** Ubicación actual del activo
- **Estado:** Operativo, En mantenimiento, Fuera de servicio, etc.
- **Fecha de adquisición:** Cuándo se adquirió el activo
- **Acciones:** Botones para ver detalles

#### Filtrar activos

Para filtrar el inventario:

1. **Por sede:**

   - Seleccione la sede en el filtro correspondiente
   - Solo se mostrarán activos de esa sede

2. **Por categoría:**

   - Seleccione el tipo de activo (Computadora, Impresora, etc.)
   - La tabla se actualizará automáticamente

3. **Por estado:**

   - Filtre por: Operativo, En mantenimiento, Fuera de servicio
   - Útil para identificar activos que requieren atención

4. **Búsqueda rápida:**
   - Use el campo de búsqueda para encontrar por código o nombre
   - La búsqueda es instantánea

**Captura recomendada:** Tabla de inventario con filtros aplicados

#### Ver detalles de un activo

1. Haga clic en el botón "Ver" (icono de ojo) en la fila del activo
2. Se abrirá un modal con información detallada:
   - Especificaciones técnicas
   - Historial de mantenimientos
   - Historial de traslados
   - Documentos adjuntos (si aplica)

### 5.2 Registrar Mantenimientos

Los técnicos pueden registrar mantenimientos preventivos y correctivos realizados a los activos.

#### Tipos de mantenimiento

1. **Preventivo:** Mantenimiento programado para prevenir fallas
2. **Correctivo:** Reparación de un activo con falla o problema

#### Crear un nuevo mantenimiento

1. Vaya a **"Mantenimientos"** en el menú lateral
2. Haga clic en el botón **"Nuevo Mantenimiento"**
3. Complete el formulario:

**Campos obligatorios:**

- **Activo:** Seleccione el activo del dropdown
- **Tipo:** Preventivo o Correctivo
- **Fecha de ejecución:** Cuándo se realizó el mantenimiento
- **Descripción:** Detalle de las actividades realizadas
- **Estado:** Completado, Pendiente, En proceso

**Campos opcionales:**

- **Observaciones:** Notas adicionales
- **Costo:** Si aplica
- **Técnico responsable:** Se asigna automáticamente
- **Próximo mantenimiento:** Fecha sugerida para el siguiente

4. Haga clic en **"Guardar"**
5. El sistema confirmará el registro exitoso

**Captura recomendada:** Formulario de registro de mantenimiento

#### Ver historial de mantenimientos

1. En la tabla de mantenimientos, puede ver todos los registros
2. Use filtros para buscar por:

   - Activo específico
   - Tipo de mantenimiento
   - Fecha
   - Estado
   - Sede

3. Haga clic en "Ver detalles" para información completa

#### Editar un mantenimiento

1. Localice el mantenimiento en la tabla
2. Haga clic en el botón "Editar" (icono de lápiz)
3. Modifique los campos necesarios
4. Haga clic en "Guardar cambios"

**Nota:** Solo puede editar mantenimientos que usted haya registrado o que estén asignados a usted.

**Captura recomendada:** Vista de historial de mantenimientos con filtros

### 5.3 Registrar Traslados

Los traslados permiten documentar el movimiento de activos entre sedes o ubicaciones.

#### Crear una solicitud de traslado

1. Vaya a **"Traslados"** en el menú lateral
2. Haga clic en **"Nuevo Traslado"**
3. Complete el formulario:

**Información del traslado:**

- **Activo:** Seleccione el activo a trasladar
- **Sede origen:** Se completa automáticamente según ubicación actual
- **Sede destino:** Seleccione la nueva ubicación
- **Fecha programada:** Cuándo se realizará el traslado
- **Motivo:** Razón del traslado
- **Responsable del traslado:** Técnico encargado

4. Haga clic en **"Crear Traslado"**
5. El traslado quedará en estado "Pendiente" hasta ser aprobado

**Captura recomendada:** Formulario de creación de traslado

#### Estados de un traslado

- **Pendiente:** Esperando aprobación del administrador
- **Aprobado:** Autorizado para ejecutarse
- **En tránsito:** El activo está siendo trasladado
- **Completado:** Traslado finalizado exitosamente
- **Rechazado:** No autorizado por el administrador

#### Confirmar un traslado completado

1. Localice el traslado aprobado en la tabla
2. Una vez ejecutado físicamente el traslado
3. Haga clic en "Completar traslado"
4. Confirme la acción
5. El sistema actualizará la ubicación del activo automáticamente

**Reglas importantes:**

- No puede trasladar activos en mantenimiento
- No puede trasladar activos fuera de servicio sin autorización especial
- Debe esperar aprobación del administrador antes de ejecutar el traslado físico

**Captura recomendada:** Tabla de traslados con diferentes estados

### 5.4 Ver Notificaciones y Pendientes

El dashboard muestra alertas y tareas pendientes.

#### Tipos de notificaciones

1. **Mantenimientos próximos:**

   - Activos que requieren mantenimiento preventivo pronto
   - Se muestran con 7 días de anticipación

2. **Activos fuera de servicio:**

   - Lista de equipos que requieren atención urgente
   - Priorizados por antigüedad del problema

3. **Traslados pendientes:**

   - Traslados aprobados que debe ejecutar
   - Traslados en espera de confirmación

4. **Alertas del sistema:**
   - Mensajes importantes del administrador
   - Actualizaciones del sistema

#### Acceder a notificaciones

1. Vaya al **Dashboard**
2. Revise las tarjetas de notificaciones
3. Haga clic en "Ver detalles" para más información
4. Tome acción según corresponda

**Captura recomendada:** Dashboard con notificaciones y alertas

### 5.5 Consultar Reportes

Los técnicos pueden generar reportes de sus actividades.

#### Reportes disponibles para técnicos

1. **Reporte de mantenimientos realizados:**

   - Filtrar por rango de fechas
   - Ver solo sus mantenimientos o todos
   - Exportar a PDF o Excel

2. **Reporte de activos por sede:**

   - Inventario de la sede asignada
   - Estado de cada activo
   - Próximos mantenimientos programados

3. **Reporte de traslados:**
   - Traslados ejecutados
   - Traslados pendientes
   - Historial completo

#### Generar un reporte

1. Vaya a la sección correspondiente (Mantenimientos, Inventario, etc.)
2. Aplique los filtros deseados
3. Haga clic en el botón **"Exportar"**
4. Seleccione el formato (PDF o Excel)
5. El archivo se descargará automáticamente

**Captura recomendada:** Botones de exportación y ejemplo de reporte generado

---

## 6. MANUAL DEL ADMINISTRADOR

Este manual está dirigido a usuarios con rol de **Administrador**.

Los administradores tienen acceso a todas las funciones de los técnicos, más funciones exclusivas de gestión.

### 6.1 Gestión de Usuarios

Los administradores pueden crear, editar y gestionar usuarios del sistema.

#### Acceder a gestión de usuarios

1. Haga clic en **"Usuarios"** en el menú lateral
2. Se mostrará la tabla con todos los usuarios registrados

#### Crear un nuevo usuario

1. Haga clic en **"Nuevo Usuario"**
2. Complete el formulario:

**Información personal:**

- **Nombre completo:** Nombre del usuario
- **Correo electrónico:** Email institucional (será el usuario de login)
- **Teléfono:** Número de contacto
- **Sede asignada:** Ubicación principal del usuario

**Información de acceso:**

- **Rol:** Seleccione Administrador, Sysman o Técnico
- **Contraseña:** Contraseña inicial (el usuario puede cambiarla después)
- **Estado:** Activo o Inactivo

3. Haga clic en **"Crear Usuario"**
4. El sistema enviará las credenciales al correo del usuario

**Captura recomendada:** Formulario de creación de usuario

#### Roles disponibles

| Rol         | Permisos                                                                   |
| ----------- | -------------------------------------------------------------------------- |
| **ADMIN**   | Acceso completo al sistema, gestión de usuarios, aprobación de traslados   |
| **SYSMAN**  | Gestión operativa, sin permisos de usuarios                                |
| **TECNICO** | Registro de mantenimientos, consulta de inventario, solicitud de traslados |

#### Editar un usuario

1. Localice el usuario en la tabla
2. Haga clic en el botón "Editar"
3. Modifique los campos necesarios:

   - Cambiar rol
   - Actualizar información de contacto
   - Cambiar sede asignada
   - Activar/desactivar cuenta

4. Haga clic en **"Guardar cambios"**

#### Bloquear/Habilitar usuarios

Para desactivar temporalmente un usuario:

1. Edite el usuario
2. Cambie el estado a "Inactivo"
3. El usuario no podrá iniciar sesión

Para reactivar:

1. Edite el usuario
2. Cambie el estado a "Activo"

#### Restablecer contraseña

1. Localice el usuario en la tabla
2. Haga clic en "Restablecer contraseña"
3. El sistema generará una nueva contraseña temporal
4. Se enviará al correo del usuario

**Captura recomendada:** Tabla de gestión de usuarios con acciones

### 6.2 Gestión Avanzada de Activos

Los administradores pueden crear, editar y dar de baja activos.

#### Crear un nuevo activo

1. Vaya a **"Inventario"**
2. Haga clic en **"Nuevo Activo"**
3. Complete el formulario:

**Información básica:**

- **Código:** Identificador único (puede ser generado automáticamente)
- **Nombre:** Descripción del activo
- **Categoría:** Tipo de equipo
- **Marca y Modelo:** Información del fabricante
- **Número de serie:** Serial del equipo

**Información de ubicación:**

- **Sede:** Ubicación actual
- **Edificio/Área:** Ubicación específica
- **Responsable:** Usuario asignado

**Información de adquisición:**

- **Fecha de adquisición:** Cuándo se compró
- **Costo:** Valor del activo
- **Proveedor:** Empresa vendedora
- **Garantía:** Fecha de vencimiento

**Estado inicial:**

- **Estado:** Operativo (por defecto)
- **Condición:** Nuevo, Usado, Reacondicionado

4. Haga clic en **"Crear Activo"**

**Captura recomendada:** Formulario de creación de activo

#### Editar un activo

1. Localice el activo en el inventario
2. Haga clic en "Editar"
3. Modifique los campos necesarios
4. Guarde los cambios

**Nota:** Algunos campos como el código no pueden modificarse después de la creación.

#### Cambiar estado de un activo

Los estados disponibles son:

- **Operativo:** Funcionando correctamente
- **En mantenimiento:** Temporalmente fuera de servicio
- **Fuera de servicio:** No funcional, requiere reparación
- **Dado de baja:** Retirado permanentemente del inventario
- **En garantía:** Enviado al proveedor

Para cambiar el estado:

1. Edite el activo
2. Seleccione el nuevo estado
3. Agregue observaciones explicando el cambio
4. Guarde

#### Dar de baja un activo

Para retirar permanentemente un activo:

1. Edite el activo
2. Cambie el estado a "Dado de baja"
3. Complete el formulario de baja:

   - Motivo de la baja
   - Fecha de baja
   - Destino (reciclaje, donación, desecho)
   - Documentación de respaldo

4. Confirme la acción
5. El activo ya no aparecerá en el inventario activo

**Captura recomendada:** Formulario de edición de activo con opciones de estado

### 6.3 Aprobación de Traslados

Los administradores deben aprobar todas las solicitudes de traslado antes de su ejecución.

#### Flujo completo de aprobación

1. **Solicitud creada por técnico:**

   - El técnico crea la solicitud de traslado
   - Estado: "Pendiente"
   - Aparece en la bandeja del administrador

2. **Revisión del administrador:**

   - Vaya a **"Traslados"**
   - Filtre por estado "Pendiente"
   - Revise los detalles de la solicitud:
     - Activo a trasladar
     - Origen y destino
     - Motivo del traslado
     - Técnico responsable

3. **Aprobar o rechazar:**

   **Para aprobar:**

   - Haga clic en "Aprobar"
   - Agregue comentarios si es necesario
   - Confirme la acción
   - Estado cambia a "Aprobado"
   - El técnico puede ejecutar el traslado

   **Para rechazar:**

   - Haga clic en "Rechazar"
   - **Obligatorio:** Indique el motivo del rechazo
   - Confirme la acción
   - El técnico recibirá una notificación

4. **Seguimiento:**
   - Monitoree traslados aprobados
   - Verifique que se completen en tiempo
   - Revise confirmaciones de los técnicos

**Captura recomendada:** Vista de aprobación de traslados con opciones

#### Validaciones del sistema

El sistema valida automáticamente:

- El activo no esté en mantenimiento
- El activo no tenga otro traslado pendiente
- La sede destino exista y esté activa
- El técnico tenga permisos en ambas sedes

### 6.4 Gestión de Planificación Anual

La planificación anual permite programar mantenimientos preventivos para todo el año.

#### Acceder a planificación

1. Haga clic en **"Planificación"** en el menú lateral
2. Se mostrará el calendario anual de mantenimientos

#### Crear una planificación anual

1. Haga clic en **"Nueva Planificación"**
2. Seleccione el año a planificar
3. Configure los parámetros:

**Por sede:**

- Seleccione cada sede
- Defina frecuencia de mantenimientos preventivos
- Asigne técnicos responsables

**Por categoría de activo:**

- Computadoras: cada 3 meses
- Impresoras: cada 6 meses
- Proyectores: cada 4 meses
- Servidores: cada mes
- Etc.

4. El sistema generará automáticamente el calendario
5. Revise y ajuste fechas si es necesario
6. Haga clic en **"Guardar Planificación"**

**Captura recomendada:** Vista de planificación anual con calendario

#### Revisar estado de planificación

El dashboard de planificación muestra:

- **Mantenimientos programados:** Total del año
- **Mantenimientos completados:** Ejecutados hasta la fecha
- **Mantenimientos pendientes:** Por realizar
- **Mantenimientos vencidos:** No realizados en fecha programada
- **Porcentaje de cumplimiento:** Por sede y global

#### Ajustar planificación

Para modificar fechas programadas:

1. Localice el mantenimiento en el calendario
2. Haga clic en "Editar"
3. Cambie la fecha
4. Agregue justificación del cambio
5. Guarde

#### Descargar reportes de planificación

Reportes disponibles:

1. **Reporte anual completo:** Toda la planificación del año
2. **Reporte por sede:** Planificación específica de una sede
3. **Reporte de cumplimiento:** Estadísticas de ejecución
4. **Reporte de mantenimientos vencidos:** Alertas de incumplimiento

Para descargar:

1. Seleccione el tipo de reporte
2. Aplique filtros (sede, mes, categoría)
3. Haga clic en "Exportar PDF" o "Exportar Excel"

**Captura recomendada:** Dashboard de planificación con métricas

### 6.5 Dashboard General del Administrador

El dashboard del administrador muestra métricas globales del sistema.

#### Métricas principales

**Inventario:**

- Total de activos registrados
- Activos por estado (gráfico circular)
- Activos por sede (gráfico de barras)
- Activos por categoría
- Valor total del inventario

**Mantenimientos:**

- Mantenimientos del mes actual
- Preventivos vs Correctivos (comparativa)
- Mantenimientos por sede
- Técnicos más activos
- Costo promedio de mantenimientos

**Traslados:**

- Traslados pendientes de aprobación
- Traslados en tránsito
- Traslados completados este mes
- Sedes con más movimientos

**Usuarios:**

- Total de usuarios activos
- Usuarios por rol
- Última actividad

#### Indicadores históricos

El dashboard incluye gráficos de tendencias:

- Evolución del inventario (últimos 12 meses)
- Tendencia de mantenimientos
- Comparativa año actual vs año anterior
- Proyecciones de costos

#### Alertas del administrador

Notificaciones importantes:

- Activos sin mantenimiento en más de 6 meses
- Garantías próximas a vencer
- Activos fuera de servicio por más de 30 días
- Traslados pendientes de aprobación por más de 7 días
- Usuarios inactivos

**Captura recomendada:** Dashboard completo del administrador con gráficos y métricas

---

## 7. GENERACIÓN DE REPORTES

El sistema permite exportar información en dos formatos principales.

### 7.1 Exportar a PDF

Los reportes en PDF son ideales para:

- Presentaciones formales
- Documentación oficial
- Archivo físico

#### Características del PDF

- Encabezado con logo de UESVALLE
- Fecha y hora de generación
- Filtros aplicados
- Tablas formateadas
- Pie de página con número de página
- Firma digital (opcional)

#### Cómo generar un PDF

1. Vaya a la sección deseada (Inventario, Mantenimientos, etc.)
2. Aplique los filtros necesarios
3. Haga clic en el botón **"Exportar PDF"**
4. El archivo se descargará automáticamente
5. Nombre del archivo: `reporte_[seccion]_[fecha].pdf`

**Captura recomendada:** Botón de exportación PDF y preview del documento

### 7.2 Exportar a Excel

Los reportes en Excel son ideales para:

- Análisis de datos
- Manipulación de información
- Gráficos personalizados
- Integración con otros sistemas

#### Características del Excel

- Múltiples hojas (si aplica)
- Formato de tabla
- Filtros automáticos
- Columnas ajustadas
- Formato de fechas y números
- Colores para mejor visualización

#### Cómo generar un Excel

1. Vaya a la sección deseada
2. Aplique los filtros necesarios
3. Haga clic en el botón **"Exportar Excel"**
4. El archivo se descargará automáticamente
5. Nombre del archivo: `reporte_[seccion]_[fecha].xlsx`

**Captura recomendada:** Archivo Excel abierto con datos del sistema

### 7.3 Tipos de reportes disponibles

#### Reportes de Inventario

- **Inventario completo:** Todos los activos del sistema
- **Inventario por sede:** Activos de una sede específica
- **Inventario por categoría:** Agrupado por tipo de activo
- **Activos por estado:** Filtrado por condición
- **Valorización de activos:** Incluye costos y depreciación

#### Reportes de Mantenimientos

- **Mantenimientos realizados:** Por rango de fechas
- **Mantenimientos por técnico:** Actividad de cada usuario
- **Mantenimientos por activo:** Historial completo
- **Costos de mantenimiento:** Análisis financiero
- **Mantenimientos preventivos vs correctivos:** Comparativa

#### Reportes de Traslados

- **Traslados ejecutados:** Por período
- **Traslados pendientes:** Requieren atención
- **Historial de movimientos:** Por activo
- **Traslados por sede:** Origen y destino

#### Reportes de Planificación

- **Planificación anual:** Calendario completo
- **Cumplimiento de planificación:** Estadísticas
- **Mantenimientos vencidos:** Alertas
- **Proyección de costos:** Estimados del año

#### Reportes de Usuarios (solo administradores)

- **Usuarios activos:** Lista completa
- **Actividad por usuario:** Acciones realizadas
- **Usuarios por rol:** Distribución
- **Historial de accesos:** Auditoría

---

## 8. BUENAS PRÁCTICAS DE USO

Para garantizar el correcto funcionamiento del sistema y la integridad de los datos, siga estas recomendaciones:

### 8.1 Mantenimiento de datos actualizados

✅ **Hacer:**

- Registrar mantenimientos inmediatamente después de ejecutarlos
- Actualizar el estado de los activos en tiempo real
- Confirmar traslados tan pronto se completen físicamente
- Revisar y actualizar información de contacto periódicamente

❌ **Evitar:**

- Dejar registros pendientes por días
- Registrar múltiples mantenimientos de forma retroactiva
- Olvidar actualizar estados de activos

### 8.2 Confirmación oportuna de traslados

✅ **Hacer:**

- Esperar aprobación antes de ejecutar traslados físicos
- Confirmar en el sistema inmediatamente después del traslado
- Verificar que el activo llegó en buenas condiciones
- Documentar cualquier incidencia durante el traslado

❌ **Evitar:**

- Trasladar activos sin aprobación
- Dejar traslados sin confirmar por días
- Omitir documentación de problemas

### 8.3 Registro completo de mantenimientos

✅ **Hacer:**

- Describir detalladamente las actividades realizadas
- Incluir observaciones relevantes
- Registrar costos cuando aplique
- Programar el próximo mantenimiento preventivo
- Adjuntar evidencia fotográfica si es posible

❌ **Evitar:**

- Descripciones vagas como "se arregló"
- Omitir información de costos
- No programar mantenimientos futuros

### 8.4 Revisión periódica del dashboard

**Para técnicos:**

- Revisar notificaciones diariamente
- Verificar mantenimientos próximos cada semana
- Consultar traslados pendientes regularmente

**Para administradores:**

- Revisar dashboard general semanalmente
- Aprobar/rechazar traslados dentro de 48 horas
- Monitorear cumplimiento de planificación mensualmente
- Revisar métricas de rendimiento cada mes

### 8.5 Seguridad y privacidad

✅ **Hacer:**

- Cerrar sesión al terminar de usar el sistema
- No compartir credenciales con otros usuarios
- Cambiar contraseña periódicamente
- Reportar actividad sospechosa inmediatamente
- Usar contraseñas seguras (mínimo 8 caracteres, mayúsculas, números)

❌ **Evitar:**

- Dejar sesiones abiertas en computadoras compartidas
- Usar contraseñas simples o predecibles
- Compartir su usuario con compañeros

### 8.6 Uso eficiente de filtros y búsquedas

✅ **Hacer:**

- Usar filtros para encontrar información rápidamente
- Combinar múltiples filtros para resultados precisos
- Limpiar filtros después de usarlos
- Usar la búsqueda rápida para activos específicos

❌ **Evitar:**

- Navegar manualmente por páginas de resultados
- Dejar filtros aplicados que confundan búsquedas posteriores

---

## 9. SOLUCIÓN DE PROBLEMAS

Esta sección cubre los problemas más comunes y sus soluciones.

### 9.1 Problemas de acceso

#### "No tengo permisos para acceder a esta sección"

**Causa:** Su rol no tiene autorización para esa funcionalidad.

**Solución:**

1. Verifique su rol en el perfil de usuario
2. Si necesita acceso, contacte al administrador
3. El administrador puede ajustar su rol si es necesario

#### "Sesión expirada"

**Causa:** Ha estado inactivo por más de 2 horas.

**Solución:**

1. Haga clic en "Aceptar"
2. Será redirigido al login
3. Ingrese sus credenciales nuevamente
4. Sus datos no guardados se habrán perdido

**Prevención:** Guarde su trabajo frecuentemente.

#### "Credenciales inválidas" al intentar login

**Causa:** Usuario o contraseña incorrectos.

**Solución:**

1. Verifique que está usando su correo institucional completo
2. Verifique que no tiene Bloq Mayús activado
3. Si olvidó su contraseña, contacte al administrador
4. Después de 5 intentos fallidos, la cuenta se bloqueará temporalmente

### 9.2 Problemas con tablas y datos

#### "No carga la tabla" o "Cargando indefinidamente"

**Causa:** Problema de conexión o error del servidor.

**Solución:**

1. Verifique su conexión a internet
2. Refresque la página (F5)
3. Limpie caché del navegador
4. Si persiste, contacte soporte técnico

#### "No aparece el activo que busco"

**Causa:** Filtros aplicados o activo no registrado.

**Solución:**

1. Haga clic en "Limpiar filtros"
2. Use la búsqueda por código exacto
3. Verifique que el activo esté registrado en el sistema
4. Si es administrador, verifique que no esté dado de baja

#### "La tabla muestra datos antiguos"

**Causa:** Caché del navegador.

**Solución:**

1. Refresque la página (F5)
2. Si no funciona, use Ctrl + F5 (recarga forzada)
3. Cierre y abra el navegador

### 9.3 Problemas al crear registros

#### "No me deja crear mantenimiento"

**Posibles causas y soluciones:**

1. **Campos obligatorios vacíos:**

   - Revise que todos los campos con asterisco (\*) estén completos
   - El sistema mostrará en rojo los campos faltantes

2. **Activo no disponible:**

   - Verifique que el activo esté en estado "Operativo"
   - No puede registrar mantenimiento en activos dados de baja

3. **Fecha inválida:**

   - La fecha no puede ser futura (para mantenimientos completados)
   - Use el calendario para seleccionar la fecha correcta

4. **Sin permisos:**
   - Verifique que su rol permita crear mantenimientos
   - Contacte al administrador si necesita permisos

#### "Error al guardar" o "No se pudo crear el registro"

**Causa:** Error de validación o problema del servidor.

**Solución:**

1. Revise todos los campos del formulario
2. Verifique mensajes de error específicos
3. Intente nuevamente en unos minutos
4. Si persiste, tome captura de pantalla y contacte soporte

### 9.4 Problemas con traslados

#### "No puedo crear traslado para este activo"

**Posibles causas:**

1. **Activo en mantenimiento:**

   - No se pueden trasladar activos en mantenimiento
   - Espere a que se complete el mantenimiento

2. **Traslado pendiente:**

   - El activo ya tiene un traslado en proceso
   - Complete o cancele el traslado anterior

3. **Activo fuera de servicio:**
   - Requiere autorización especial del administrador
   - Contacte al administrador para casos excepcionales

#### "Mi traslado fue rechazado"

**Solución:**

1. Revise los comentarios del administrador
2. Corrija el motivo del rechazo
3. Cree una nueva solicitud con la información correcta

### 9.5 Problemas con reportes

#### "El PDF no se descarga"

**Solución:**

1. Verifique que su navegador permita descargas
2. Revise la carpeta de descargas
3. Desactive bloqueadores de ventanas emergentes
4. Intente con otro navegador

#### "El Excel está vacío o incompleto"

**Causa:** Filtros muy restrictivos o error de exportación.

**Solución:**

1. Verifique los filtros aplicados
2. Asegúrese de que hay datos para exportar
3. Intente exportar sin filtros
4. Si persiste, contacte soporte

### 9.6 Problemas de rendimiento

#### "El sistema está lento"

**Solución:**

1. Cierre pestañas innecesarias del navegador
2. Limpie caché y cookies
3. Verifique su conexión a internet
4. Cierre otras aplicaciones que consuman recursos
5. Si el problema es generalizado, puede ser mantenimiento del servidor

#### "Las imágenes no cargan"

**Solución:**

1. Refresque la página
2. Verifique su conexión a internet
3. Limpie caché del navegador
4. Intente con otro navegador

### 9.7 Problemas específicos del administrador

#### "No puedo eliminar un usuario"

**Causa:** El usuario tiene registros asociados.

**Solución:**

1. No elimine, mejor desactive el usuario
2. Cambie el estado a "Inactivo"
3. El usuario no podrá acceder pero se mantiene el historial

#### "No aparece la opción de Usuarios en el menú"

**Causa:** Su rol no es Administrador.

**Solución:**

1. Verifique su rol en el perfil
2. Solo los administradores ven esta opción
3. Contacte a otro administrador si necesita ese acceso

---

## 10. CONTACTO Y SOPORTE

### Área de Tecnologías de la Información - UESVALLE

### Canales de soporte

#### Soporte Técnico General

- **Correo:** soporte.ti@uesvalle.edu.mx
- **Teléfono:** +52 (XXX) XXX-XXXX Ext. 1234
- **Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM

#### Soporte para Administradores

- **Correo:** admin.activos@uesvalle.edu.mx
- **Teléfono:** +52 (XXX) XXX-XXXX Ext. 1235

#### Reportar problemas críticos

- **Correo urgente:** urgente.ti@uesvalle.edu.mx
- **WhatsApp:** +52 (XXX) XXX-XXXX (solo emergencias)

### Responsables del sistema

**Coordinador de TI:**

- Nombre: [Nombre del Coordinador]
- Correo: coordinador.ti@uesvalle.edu.mx
- Extensión: 1200

**Administrador del Sistema:**

- Nombre: [Nombre del Administrador]
- Correo: admin.sistema@uesvalle.edu.mx
- Extensión: 1201

**Desarrollador/Soporte Técnico:**

- Nombre: [Nombre del Desarrollador]
- Correo: dev.activos@uesvalle.edu.mx
- Extensión: 1202

### Proceso de reporte de incidencias

1. **Identifique el problema:**

   - Describa qué estaba haciendo
   - Qué error apareció
   - Tome captura de pantalla si es posible

2. **Clasifique la urgencia:**

   - **Crítico:** El sistema no funciona, bloquea operaciones
   - **Alto:** Funcionalidad importante no disponible
   - **Medio:** Problema que tiene solución alternativa
   - **Bajo:** Mejora o consulta general

3. **Contacte al canal apropiado:**

   - Crítico/Alto: Teléfono o WhatsApp
   - Medio/Bajo: Correo electrónico

4. **Proporcione información:**

   - Su nombre y rol
   - Descripción detallada del problema
   - Pasos para reproducir el error
   - Capturas de pantalla
   - Navegador y versión que usa
   - Fecha y hora del incidente

5. **Seguimiento:**
   - Recibirá un número de ticket
   - Tiempo de respuesta según prioridad:
     - Crítico: 1 hora
     - Alto: 4 horas
     - Medio: 24 horas
     - Bajo: 48 horas

### Recursos adicionales

**Portal de ayuda:**

- URL: https://ayuda.uesvalle.edu.mx/activos
- Tutoriales en video
- Preguntas frecuentes (FAQ)
- Documentación técnica

**Capacitación:**

- Sesiones de capacitación mensuales
- Solicite capacitación personalizada
- Material de entrenamiento disponible en el portal

### Actualizaciones del sistema

El sistema se actualiza regularmente:

- **Mantenimiento programado:** Primer domingo de cada mes, 2:00 AM - 6:00 AM
- **Actualizaciones menores:** Se notifican con 48 horas de anticipación
- **Actualizaciones mayores:** Se notifican con 1 semana de anticipación

**Notificaciones:**

- Recibirá correos sobre mantenimientos programados
- Revise el banner de notificaciones en el sistema
- Suscríbase al boletín de actualizaciones

### Sugerencias y mejoras

Su opinión es importante para mejorar el sistema:

**Envíe sus sugerencias a:**

- Correo: mejoras.activos@uesvalle.edu.mx
- Formulario en línea: https://uesvalle.edu.mx/sugerencias

**Incluya:**

- Descripción de la mejora propuesta
- Beneficio esperado
- Prioridad sugerida
- Ejemplos o mockups (opcional)

Todas las sugerencias son revisadas mensualmente por el equipo de desarrollo.

---

## ANEXOS

### Anexo A: Glosario de términos

- **Activo:** Bien tecnológico registrado en el sistema
- **Mantenimiento Preventivo:** Mantenimiento programado para prevenir fallas
- **Mantenimiento Correctivo:** Reparación de un activo con falla
- **Traslado:** Movimiento de un activo entre ubicaciones
- **Sede:** Ubicación física de la universidad
- **Dashboard:** Panel de control con métricas y estadísticas
- **Rol:** Nivel de permisos asignado a un usuario
- **Estado:** Condición actual de un activo
- **Planificación:** Programación anual de mantenimientos

### Anexo B: Atajos de teclado

| Atajo     | Función                            |
| --------- | ---------------------------------- |
| F5        | Refrescar página                   |
| Ctrl + F5 | Recarga forzada (limpia caché)     |
| Ctrl + F  | Buscar en página                   |
| Esc       | Cerrar modal/diálogo               |
| Tab       | Navegar entre campos de formulario |
| Enter     | Confirmar acción/Enviar formulario |

### Anexo C: Códigos de estado de activos

| Código | Estado            | Descripción                       |
| ------ | ----------------- | --------------------------------- |
| OP     | Operativo         | Funcionando correctamente         |
| MT     | En Mantenimiento  | Temporalmente fuera de servicio   |
| FS     | Fuera de Servicio | No funcional, requiere reparación |
| GA     | En Garantía       | Enviado al proveedor              |
| DB     | Dado de Baja      | Retirado permanentemente          |
| RE     | Reservado         | Asignado para uso específico      |

### Anexo D: Categorías de activos

- **Computadoras:** Desktop, Laptop, All-in-One
- **Impresoras:** Láser, Inyección de tinta, Multifuncional
- **Proyectores:** Corto alcance, Largo alcance, Interactivos
- **Servidores:** Físicos, Virtuales
- **Equipos de Red:** Switches, Routers, Access Points
- **Periféricos:** Teclados, Mouse, Monitores, Webcams
- **Equipos de Audio/Video:** Cámaras, Micrófonos, Bocinas
- **Otros:** Tablets, Lectores de código, UPS

### Anexo E: Frecuencias recomendadas de mantenimiento

| Categoría            | Mantenimiento Preventivo |
| -------------------- | ------------------------ |
| Computadoras         | Cada 3 meses             |
| Servidores           | Cada mes                 |
| Impresoras           | Cada 6 meses             |
| Proyectores          | Cada 4 meses             |
| Equipos de Red       | Cada 6 meses             |
| Aires Acondicionados | Cada 3 meses             |
| UPS                  | Cada 6 meses             |

---

## CONTROL DE VERSIONES

| Versión | Fecha          | Autor              | Cambios                    |
| ------- | -------------- | ------------------ | -------------------------- |
| 1.0     | Noviembre 2025 | Equipo TI UESVALLE | Versión inicial del manual |
