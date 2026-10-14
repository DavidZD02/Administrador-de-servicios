# Sistema Backend de Turnos y Reservas

## Descripción

API REST construida con Node.js, Express y MongoDB (a través de Mongoose), que forma parte del Sistema Backend de Turnos y Reservas. Gestiona dos recursos principales:
 
- **`services`**: los servicios disponibles para reservar.
- **`bookings`**: las reservas que crean los clientes, cada una asociada a uno o más servicios.

Ofrece tres formas de interactuar con esos recursos:
 
- **API REST** (`/api/...`): endpoints JSON para crear, consultar, actualizar y eliminar.
- **Vistas del servidor** (`/views/...`): páginas HTML renderizadas con **Handlebars**, que muestran datos reales de la base de datos.
- **Tiempo real** con **Socket.io**: cuando se crea un servicio, las vistas abiertas en el navegador se actualizan sin recargar la página.

Ambos recursos persisten en una base de datos **MongoDB Atlas**, gestionada a través de **Mongoose** como ODM (Object Data Modeling). El proyecto originalmente persistía los datos en archivos JSON (`src/data/services.json` y `src/data/bookings.json`) usando `fs`, y fue migrado a MongoDB manteniendo exactamente el mismo comportamiento externo de la API.

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
| `MONGO_URI` | Cadena de conexión a tu cluster de MongoDB Atlas  | `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/turnos-reservas` |


Si falta alguna variable requerida, la aplicación no arrancará y mostrará un mensaje de error indicando cuál falta.

## Ejecución

```bash
npm run dev
```

Esto conecta a MongoDB y arranca el servidor Express en el puerto configurado (`http://localhost:8080` por defecto). Si todo sale bien, verás en consola:

```
Conexión a MongoDB exitosa
Servidor corriendo en http://localhost:8080 🚀
```

Rutas principales:
 
- API: `http://localhost:8080/api/services` y `http://localhost:8080/api/bookings`
- Vistas: `http://localhost:8080/views/services` y `http://localhost:8080/views/bookings`

## Arquitectura del proyecto

El código se organiza en capas con responsabilidades definidas. Cada capa solo conoce a la capa inmediatamente inferior — nunca "salta" niveles ni conoce los detalles internos de las capas de abajo.
 
| Capa | Responsabilidad |
|------|-------------------|
| **Routers** (`src/routes/`) | Definen las URLs y métodos HTTP, y delegan cada endpoint a su función controller correspondiente. No contienen lógica de negocio. |
| **Controllers** (`src/controllers/`) | Leen `req.params`, `req.query` y `req.body`, llaman al service correspondiente, y arman la respuesta con `res.status().json()`. No acceden directamente a la base de datos ni contienen reglas de negocio. |
| **Services** (`src/services/`) | Contienen la lógica de negocio: validaciones de campos requeridos, reglas como "si el servicio ya está en la reserva, incrementar `quantity` en vez de duplicarlo", y la decisión de qué error lanzar. No conocen `req` ni `res`, ni saben cómo se persisten los datos. |
| **Repositories** (`src/repositories/`) | Actúan como intermediarios entre el Service y el DAO. Ofrecen métodos de acceso a datos (`getAll`, `getById`, `create`, `update`, `delete`) sin ninguna regla de negocio. No saben qué tecnología de persistencia hay por debajo. |
| **DAO** (`src/dao/`) — *Data Access Object* | La única capa que sabe que los datos viven en MongoDB. Usa los modelos de Mongoose (`src/dao/models/`) para consultar y persistir documentos. No contiene ninguna lógica de negocio ni validación de reglas del dominio. |
| **Modelos de Mongoose** (`src/dao/models/`) | Definen el `Schema` de cada colección (`services`, `bookings`, `messages`): forma de los documentos, tipos de datos y validaciones básicas (`required`, `ref`, etc.). |
 
La migración de `fs` a MongoDB solo modificó la capa **DAO**; Routers, Controllers, Services y Repositories se mantuvieron intactos.

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
  "payload": [
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
  "payload": { "id": 1, "name": "Corte clásico", "...": "..." }
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
  "payload": {
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

## Vistas con Handlebars
 
Las vistas son páginas HTML renderizadas en el servidor con **Handlebars** (`express-handlebars`). Los datos nunca están escritos a mano en las plantillas: siempre provienen de MongoDB a través de las capas `controller → service → repository → DAO → model`.
 
| Ruta | Descripción |
|------|--------------|
| `GET /views/services` | Listado de servicios con nombre, descripción, duración, precio, categoría y disponibilidad. |
| `GET /views/bookings` | Listado de reservas con id, cliente, fecha, hora y estado. |
 
Configuración (en `src/app.js`):
 
- Motor de vistas: `app.engine("handlebars", engine())` y `app.set("view engine", "handlebars")`.
- Carpeta de plantillas: `src/views/`, con el layout `layouts/main.handlebars` que envuelve todas las páginas.
- Archivos estáticos (`src/public/`): se sirven con `express.static`, por lo que `public/css/styles.css` y `public/js/socket.js` quedan disponibles como `/css/styles.css` y `/js/socket.js`.
Los controllers de vistas (`src/controllers/views.controller.js`) solo llaman al service correspondiente y renderizan la plantilla; no contienen lógica de negocio.
 
> Nota: los métodos `getAll` de los DAO usan `.lean()` para devolver objetos planos de JavaScript. Sin esto, Handlebars bloquea el acceso a las propiedades de los documentos de Mongoose ("not an own property") y la vista se muestra vacía.
 
## Tiempo real con Socket.io
 
Socket.io se configura en `src/server.js`: se crea sobre el servidor HTTP que devuelve `app.listen(...)`, y la instancia `io` se guarda en la app con `app.set("io", io)` para que los controllers puedan acceder a ella mediante `req.app.get("io")`.
 
| Evento | Cuándo se emite | Datos |
|--------|------------------|-------|
| `service:created` | Al crear un servicio con éxito (`POST /api/services`). No se emite si la validación falla. | El servicio recién creado. |
 
En el navegador, `src/public/js/socket.js` se conecta con `io()` y escucha `service:created`: al recibirlo, construye una nueva tarjeta con el mismo formato que renderiza Handlebars y la agrega al contenedor `#services-list`, **sin recargar la página**. Para probarlo, abre `/views/services` en el navegador y crea un servicio con Postman.

## Capas por recurso

- **`services`**
  - `ServicesDAO`: usa el modelo `Service` de Mongoose — `getAll` (`find`), `getById` (`findById`), `create` (`create`), `update` (`findByIdAndUpdate` con `{ new: true }`), `delete` (`findByIdAndDelete`).
  - `ServicesRepository`: intermediario entre el Service y el DAO, mismos métodos que el DAO.
  - `ServicesService`: reglas de negocio — validación de campos requeridos en la creación, y decisión de qué error lanzar cuando un `id` no existe.
- **`bookings`**
  - `BookingsDAO`: usa el modelo `Booking` de Mongoose — `create`, `getById` (`findById`), `update` (`findByIdAndUpdate` con `{ new: true }`).
  - `BookingsRepository`: intermediario entre el Service y el DAO, mismos métodos que el DAO.
  - `BookingsService`: reglas de negocio — validación de campos requeridos, forzar `services: []` por defecto, y la regla de incrementar `quantity` al agregar un servicio repetido (comparando `ObjectId` con `.equals()`). Recibe una instancia de `ServicesService` para validar que los servicios existan antes de agregarlos a una reserva.


## Estructura del proyecto

## Estructura del proyecto
 
```
src/
  config/
    env.config.js
    database.config.js
  controllers/
    services.controller.js
    bookings.controller.js
    views.controller.js
  services/
    services.service.js
    bookings.service.js
  repositories/
    services.repository.js
    bookings.repository.js
  dao/
    services.dao.js
    bookings.dao.js
    models/
      service.model.js
      booking.model.js
      message.model.js
  routes/
    services.router.js
    bookings.router.js
    views.router.js
  views/
    layouts/
      main.handlebars
    services.handlebars
    bookings.handlebars
  public/
    css/
      styles.css
    js/
      socket.js
  app.js
  server.js
package.json
.env.example
.gitignore
README.md
```


