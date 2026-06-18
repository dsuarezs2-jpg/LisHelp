# FrontMind-AI

Sistema inteligente de análisis de interfaces de usuario con IA.

## 📋 Descripción

FrontMind-AI es una aplicación que combina React en el frontend con agentes Python en el backend para analizar y mejorar interfaces de usuario.

## 📂 Estructura del Proyecto

```
.
├── frontmind-ai/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
├── vite.config.js            # Configuración Vite (con Tailwind CSS)
├── package.json              # Dependencias del proyecto
├── render.yaml               # Configuración para Render
└── eslint.config.js          # Configuración ESLint
```

## 🚀 Instalación Local

### Prerequisites
- Node.js 18.17.0 o superior
- npm 9.6.7 o superior

### Frontend (React + Vite)

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo (localhost:5173)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🌐 Desplegar en Render

### Opción 1: Conectar desde GitHub (Recomendado)

1. **Ir a [render.com](https://render.com)**
2. **Crear una nueva cuenta o iniciar sesión**
3. **Hacer clic en "New +" → "Web Service"**
4. **Conectar con GitHub:**
   - Autorizar Render a acceder a tus repositorios
   - Seleccionar `Rosas04/FrontMind-AI`

5. **Configurar el servicio:**
   ```
   Name: frontmind-ai
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run preview -- --host
   Plan: Free
   ```

6. **Variables de entorno:**
   - No requiere variables adicionales por ahora

7. **Hacer clic en "Create Web Service"**

### Opción 2: Deploy Manual

```bash
# 1. Instalar Render CLI (opcional)
npm install -g @render/cli

# 2. Autenticarse
render login

# 3. Hacer deploy
render deploy
```

## 📖 Scripts Disponibles

```bash
npm run dev       # Desarrollo local en http://localhost:5173
npm run build     # Build para producción (carpeta dist/)
npm run preview   # Preview del build producción
npm run lint      # Verificar errores con ESLint
```

## 🔧 Configuración de Render

El archivo `render.yaml` contiene la configuración automática:

```yaml
services:
  - type: web
    name: frontmind-ai
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run preview
```

## 🎯 Rutas Disponibles

- `/` - Redirige a dashboard
- `/dashboard` - Página principal del dashboard
- `/welcome` - Página de bienvenida

## 📦 Dependencias Principales

- **React** 18.3.1 - Librería UI
- **React Router DOM** 6.20.0 - Enrutamiento
- **Vite** 5.4.1 - Build tool
- **Tailwind CSS** 4.0.0 - Utilidades CSS

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# El puerto 3000 está en uso, Vite usará otro puerto automáticamente
```

### Build falla en Render
- Verificar que `package.json` existe en la raíz
- Verificar que no hay conflictos de merge sin resolver
- Revisar los logs en el dashboard de Render

## 📝 Notas Importantes

- La carpeta `node_modules` está en `.gitignore`
- La carpeta `dist/` es generada al hacer build
- En Render, el comando de build instala dependencias automáticamente
- El proyecto usa Node.js 18.17.0 como versión recomendada

## 👨‍💻 Próximos Pasos

1. **Conectar con Backend (Python)**
   - Crear API en FastAPI o Flask
   - Configurar CORS para comunicación con frontend

2. **Agregar más funcionalidades**
   - Páginas de análisis
   - Componentes interactivos
   - Integración con servicios IA

3. **Mejorar estilos**
   - Personalizar tema Tailwind
   - Agregar animaciones
   - Responsive design

## 📞 Soporte

Para reportar problemas o sugerencias, abre un Issue en GitHub.
