# Administrador-de-servicios

## Descripción

Proyecto en Node.js con ESM que implementa la clase `ServiceManager`, encargada de gestionar los servicios de un sistema de turnos y reservas (crear, consultar, actualizar y eliminar servicios). Los datos se almacenan en un archivo JSON local (`src/data/services.json`) y las variables de configuración se validan al iniciar la aplicación.

## Instalación
1. Clonar el repositorio:

```bash
   git clone https://github.com/DavidZD02/Administrador-de-servicios.git
```

2. Instalar las dependencias:

```bash
   npm install
```

3. Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```bash
   cp .env.example .env
```

   Y completar los valores necesarios (ver sección "Variables de entorno").

## Variables de entorno

| Variable   | Descripción                                   | Ejemplo       |
|------------|------------------------------------------------|---------------|
| `PORT`     | Puerto en el que corre la aplicación            | `8080`        |
| `NODE_ENV` | Entorno de ejecución (`development`/`production`) | `development` |

Si falta alguna variable requerida, la aplicación no arrancará y mostrará un mensaje de error indicando cuál falta.

## Ejecución

```bash
npm run dev
```

Esto arranca el servidor Express en el puerto configurado (`http://localhost:8080` por defecto).

## Recurso: `services`

Cada servicio tiene la siguiente forma:

```js
{
  id: Number,          // generado automáticamente, no se recibe como parámetro
  name: String,        // nombre del servicio
  description: String, // descripción del servicio
  duration: Number,    // duración en minutos
  price: Number,       // precio del servicio
  category: String,    // categoría a la que pertenece
  available: Boolean   // si el servicio está disponible actualmente
}
```

## Endpoints de la API

Base URL: `http://localhost:8080/api/services`

### `GET /api/services`

Devuelve todos los servicios. Acepta filtros opcionales por query params, combinables entre sí:

- `?category=Barba` — filtra por categoría
- `?available=true` — filtra por disponibilidad

**Respuesta (200):**
```json
{
  "status": "success",
  "services": [
    {
      "id": 1,
      "name": "Corte clásico",
      "description": "Corte de cabello tradicional con acabado a tijera y máquina.",
      "duration": 45,
      "price": 150,
      "category": "Corte de cabello",
      "available": true
    }
  ]
}
```

### `GET /api/services/:sid`

Devuelve el servicio con el `id` indicado.

**Respuesta (200):**
```json
{
  "status": "success",
  "services": { "id": 1, "name": "Corte clásico", "...": "..." }
}
```

**Respuesta (404) — el servicio no existe:**
```json
{
  "status": "error",
  "message": "Servicio no encontrado"
}
```

### `POST /api/services`

Crea un nuevo servicio. El `id` se genera automáticamente; todos los demás campos son obligatorios.

**Body de ejemplo:**
```json
{
  "name": "Corte de cabello",
  "description": "Corte de cabello para hombres y mujeres",
  "duration": 30,
  "price": 20,
  "category": "Cabello",
  "available": true
}
```

**Respuesta (201):**
```json
{
  "status": "success",
  "services": {
    "id": 4,
    "name": "Corte de cabello",
    "description": "Corte de cabello para hombres y mujeres",
    "duration": 30,
    "price": 20,
    "category": "Cabello",
    "available": true
  }
}
```

**Respuesta (400) — faltan campos requeridos:**
```json
{
  "status": "error",
  "message": "Faltan los siguientes campos requeridos: description, duration"
}
```

### `PUT /api/services/:sid`

Actualiza un servicio existente. No permite modificar el `id`, aunque se envíe en el body.

**Body de ejemplo:**
```json
{ "price": 25 }
```

**Respuesta (200):**
```json
{
  "status": "success",
  "payload": { "id": 1, "price": 25, "...": "..." }
}
```

**Respuesta (404) — el servicio no existe:**
```json
{
  "status": "error",
  "message": "Servicio con id 1 no encontrado"
}
```

### `DELETE /api/services/:sid`

Elimina el servicio con el `id` indicado.

**Respuesta (200):**
```json
{
  "status": "success",
  "message": "Servicio con id 3 eliminado correctamente"
}
```

**Respuesta (404) — el servicio no existe:**
```json
{
  "status": "error",
  "message": "Servicio con id 3 no encontrado"
}
```

## Estructura del proyecto

```
src/
  config/env.config.js       # validación de variables de entorno
  managers/ServiceManager.js # lógica de negocio del recurso services
  routes/services.router.js  # rutas REST del recurso services
  data/services.json         # datos iniciales
  app.js                     # configuración de la app Express
  server.js                  # arranque del servidor
package.json
.env.example
.gitignore
README.md
```
