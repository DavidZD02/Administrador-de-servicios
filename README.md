# Administrador-de-servicios

## Descripción

API REST construida con Node.js, Express y el sistema de archivos (`fs`), que forma parte del Sistema Backend de Turnos y Reservas. Gestiona dos recursos principales:

- **`services`**: los servicios disponibles para reservar.
- **`bookings`**: las reservas que crean los clientes, cada una asociada a uno o más servicios.

Ambos recursos persisten en archivos JSON (`src/data/services.json` y `src/data/bookings.json`), por lo que los datos **no se pierden al reiniciar el servidor**.

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

## Recurso: `bookings`

```js
{
  id: Number,           // generado automáticamente
  clientName: String,
  clientEmail: String,
  date: String,
  time: String,
  status: String,
  services: [
    { service: Number, quantity: Number } // idDelServicio, cantidad
  ]
}
```

### Endpoints

Base URL: `http://localhost:8080/api/bookings`

#### `POST /api/bookings`
Crea una reserva. Puede iniciarse con `services` vacío u omitido (por defecto `[]`).

**Body:**
```json
{
  "clientName": "Juan Pérez",
  "clientEmail": "juan@gmail.com",
  "date": "2026-09-10",
  "time": "08:00",
  "status": "Agendado"
}
```

**201:**
```json
{
  "status": "success",
  "payload": {
    "id": 1,
    "clientName": "Juan Pérez",
    "clientEmail": "juan@example.com",
    "date": "2026-09-10",
    "time": "08:00",
    "status": "Agendado",
    "services": []
  }
}
```

**400 (faltan campos):**
```json
{ "status": "error", "message": "Faltan los siguientes campos requeridos: clientEmail" }
```

#### `GET /api/bookings/:bid`
Devuelve una reserva por id.

**200:**
```json
{ "status": "success", "payload": { "id": 1, "clientName": "Juan Pérez", "...": "..." } }
```

**404:**
```json
{ "status": "error", "message": "Reserva no encontrada" }
```

#### `POST /api/bookings/:bid/services/:sid`
Agrega un servicio a una reserva existente. Valida que ambos (reserva y servicio) existan. Si el servicio ya estaba agregado, incrementa su `quantity` en vez de duplicarlo.

**201:**
```json
{
  "status": "success",
  "payload": {
    "id": 1,
    "clientName": "Juan Pérez",
    "services": [ { "service": 2, "quantity": 1 } ],
    "...": "..."
  }
}
```

**404 (reserva o servicio no existe):**
```json
{ "status": "error", "message": "No se encontro el booking con id: 99" }
```

## Estructura del proyecto

```
src/ app.js / server.js routes/       → services.router.js, bookings.router.js managers/     → ServiceManager.js, BookingManager.js data/         → services.json, bookings.json config/       → env.config.js package.json / .gitignore / README.md
```

## Managers

- **`ServiceManager`**: gestiona `services.json` — `getServices`, `getServiceById`, `addService`, `updateService`, `deleteService`.
- **`BookingManager`**: gestiona `bookings.json` — `createBooking`, `getBookingById`, `addServiceToBooking`. Recibe una instancia de `ServiceManager` para validar que los servicios existan antes de agregarlos a una reserva.
