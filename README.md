# 🎡 SpinLive - Ruleta Interactiva para TikTok Live

Una aplicación completa para crear y gestionar ruletas interactivas en transmisiones en vivo de TikTok, con panel de administración, WebSockets en tiempo real y integración con TikTok Live.

## � Características

- 🎯 **Ruleta Interactiva**: Animación HTML5 Canvas con giros realistas
- ⚙️ **Panel de Administración**: CRUD completo para ruletas y segmentos
- 🔄 **WebSockets**: Actualizaciones en tiempo real durante los giros
- � **Estadísticas**: Dashboard con métricas de uso
- 🎁 **Sistema de Premios**: Configuración de probabilidades personalizables
- 📱 **TikTok Integration**: Conexión automática con transmisiones en vivo
- 💾 **Base de Datos SQLite**: Persistencia de datos local

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 20.18.0 o superior
- **npm** o **yarn**
- **Git**

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd luckyslive
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto raíz
npm install

# Instalar dependencias del backend
cd apps/backend
npm install
cd ..

# Instalar dependencias del frontend
cd apps/frontend
npm install
cd ..
```

### 3. Configurar la Base de Datos

```bash
# Ir al directorio del backend
cd apps/backend

# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crea la base de datos SQLite)
npx prisma db push

# (Opcional) Sembrar datos de ejemplo
npx prisma db seed
```

### 4. Levantar los Servicios

#### Opción A: Usando npm scripts (Recomendado)

```bash
# Desde la raíz del proyecto, en terminales separadas:

# Terminal 1: Backend
npm run start:backend

# Terminal 2: Frontend
npm run start:frontend
```

#### Opción B: Levantar todo simultáneamente

```bash
# Levanta backend y frontend al mismo tiempo
npm run dev
```

### 5. Acceder a la Aplicación

- **🎡 Ruleta Interactiva**: http://localhost:4200
- **⚙️ Panel de Administración**: http://localhost:4200/admin
- **📊 API Backend**: http://localhost:3001

## 📖 Uso de la Aplicación

### Panel de Administración

1. **Accede** a http://localhost:4200/admin
2. **Crea una ruleta** haciendo clic en "Crear Nueva Ruleta"
3. **Agrega segmentos** con premios y probabilidades
4. **Configura TikTok** con tu username en la pestaña "Configuración"

### Configuración de TikTok

1. Ve a la pestaña **"Configuración"** en el admin panel
2. Ingresa tu **username de TikTok** (ej: "habanerosk")
3. Configura el **comando de chat** (por defecto: "!spin")
4. Configura el **regalo que activa giros** (por defecto: "Rose")
5. **Guarda la configuración**

### Usando en Live Stream

1. **Inicia tu transmisión** en TikTok
2. **Los espectadores escriben** "!spin" en el chat
3. **O envían el regalo** configurado (Rose)
4. **La ruleta gira automáticamente** y muestra el resultado

## 🛠️ Scripts Disponibles

### Proyecto Raíz
```bash
npm run start:backend     # Levanta solo el backend (puerto 3001)
npm run start:frontend    # Levanta solo el frontend (puerto 4200)
npm run dev              # Levanta backend y frontend simultáneamente
```

### Backend (apps/backend)
```bash
npm run start:dev        # Desarrollo con hot reload
npm run build           # Compilar para producción
npm run start:prod      # Ejecutar en modo producción
```

### Frontend (apps/frontend)
```bash
npm run start           # Servidor de desarrollo
npm run build           # Compilar para producción
```

## 🗄️ Base de Datos

### Estructura

- **Users**: Usuarios del sistema
- **Wheels**: Ruletas creadas
- **Segments**: Segmentos de cada ruleta (premios)
- **Spins**: Historial de giros realizados
- **Prizes**: Catálogo de premios disponibles

### Comandos Útiles

```bash
# Ver la base de datos
cd apps/backend
npx prisma studio

# Resetear la base de datos
npx prisma db push --force-reset

# Ver migraciones
npx prisma migrate status
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Crea un archivo `.env` en `apps/backend/`:

```env
DATABASE_URL="file:./dev.db"
TIKTOK_USERNAME="tu_usuario_tiktok"
NODE_ENV="development"
```

### Personalización

- **Probabilidades**: Cada segmento puede tener probabilidades del 0-1
- **Colores**: Personaliza los colores de los segmentos
- **Comandos**: Cambia los comandos de chat y regalos
- **Tiempo de giro**: Modifica la duración de la animación

## 📡 API Endpoints

### Ruletas
- `GET /wheels` - Obtener todas las ruletas
- `POST /wheels` - Crear nueva ruleta
- `GET /wheels/:id` - Obtener ruleta específica
- `PUT /wheels/:id` - Actualizar ruleta
- `DELETE /wheels/:id` - Eliminar ruleta

### Segmentos
- `POST /wheels/:id/segments` - Agregar segmento a ruleta

### Giros
- `POST /wheels/:id/spin` - Girar una ruleta específica
- `POST /wheels/trigger-spin` - Girar la ruleta por defecto

### TikTok
- `GET /tiktok/config` - Obtener configuración
- `POST /tiktok/config` - Actualizar configuración
- `POST /tiktok/reconnect` - Reconectar con TikTok

## � Solución de Problemas

### Error de Puerto Ocupado
```bash
# Matar procesos en puertos específicos
lsof -ti:3001 | xargs kill -9
lsof -ti:4200 | xargs kill -9
```

### Error de Base de Datos
```bash
cd apps/backend
rm prisma/dev.db
npx prisma db push
```

### TikTok No Se Conecta
- Verifica que el username sea correcto
- Asegúrate de que estés en live stream
- Revisa los logs del backend

### Frontend No Carga
```bash
cd apps/frontend
rm -rf node_modules
npm install
npm run start
```

## � Desarrollo

### Estructura del Proyecto
```
luckyslive/
├── apps/
│   ├── backend/          # API NestJS
│   │   ├── src/
│   │   │   ├── modules/  # Módulos de la aplicación
│   │   │   └── main.ts   # Punto de entrada
│   │   └── prisma/       # Base de datos
│   └── frontend/         # Frontend Express
│       └── src/
│           ├── index.html    # Ruleta interactiva
│           └── admin.html    # Panel de administración
├── package.json
└── README.md
```

### Agregar Nuevas Funcionalidades

1. **Backend**: Crea nuevos módulos en `apps/backend/src/modules/`
2. **Frontend**: Modifica los archivos HTML y JavaScript
3. **Base de datos**: Actualiza el schema en `prisma/schema.prisma`

## 📄 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo y modificarlo.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## � Soporte

Si tienes problemas:
1. Revisa la sección de "Solución de Problemas"
2. Verifica los logs en la consola del navegador (F12)
3. Revisa los logs del backend en la terminal

---

**¡Disfruta creando experiencias interactivas en tus live streams!** 🎉