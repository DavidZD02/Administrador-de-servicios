# Administrador-de-servicios

## Descripción

Aplicación backend construida con Node.js, Express, MongoDB (a través de Mongoose), Handlebars, Socket.io y Zod, que forma parte del Sistema Backend de Turnos y Reservas. Gestiona dos recursos principales:

- **`services`**: los servicios disponibles para reservar.
- **`bookings`**: las reservas que crean los clientes, cada una asociada a uno o más servicios.

Ofrece tres formas de interactuar con esos recursos:

- **API REST** (`/api/...`): endpoints JSON para crear, consultar, actualizar y eliminar, con **filtros, paginación y ordenamiento** en servicios, **validación de datos** con Zod y consulta de reservas con **`populate`**.
- **Vistas del servidor** (`/views/...`): páginas HTML renderizadas con **Handlebars**, que muestran datos reales de la base de datos.
- **Tiempo real** con **Socket.io**: cuando se crea un servicio, las vistas abiertas en el navegador se actualizan sin recargar la página.

Ambos recursos persisten en una base de datos **MongoDB Atlas**, gestionada a través de **Mongoose** como ODM (Object Data Modeling). El proyecto originalmente persistía los datos en archivos JSON usando `fs`, y fue migrado a MongoDB manteniendo el mismo comportamiento externo de la API. Las vistas, Socket.io, las validaciones y las consultas avanzadas se agregaron sin alterar la arquitectura en capas.

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

   Y completar los valores necesarios (ver sección "Variables de entorno"), incluyendo tu cadena de conexión de MongoDB Atlas en `MONGO_URI`.

## Variables de entorno

| Variable    | Descripción                                        | Ejemplo                                                          |
|-------------|------------------------------------------------------|-------------------------------------------------------------------|
| `PORT`      | Puerto en el que corre la aplicación                  | `8080`                                                             |
| `NODE_ENV`  | Entorno de ejecución (`development`/`production`)     | `development`                                                      |
| `MONGO_URI` | Cadena de conexión a tu cluster de MongoDB Atlas       | `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/turnos-reservas` |

Si falta alguna variable requerida, la aplicación no arrancará y mostrará un mensaje de error indicando cuál falta.

> Si la conexión a Atlas falla con un error de "IP not whitelisted", agrega tu IP actual en *Network Access* dentro de MongoDB Atlas.

## Ejecución

```bash
npm start      # arranque normal
npm run dev    # arranque en modo desarrollo (reinicia al guardar cambios)
```

Esto conecta a MongoDB y arranca el servidor Express (con Socket.io) en el puerto configurado (`http://localhost:8080` por defecto). Si todo sale bien, verás en consola:

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
| **Routers** (`src/routes/`) | Definen las URLs y métodos HTTP, y delegan cada endpoint a su función controller correspondiente. Conectan el middleware de validación correspondiente antes del controller, pero no contienen lógica de negocio ni reglas de validación. Hay routers para la API (`services`, `bookings`) y uno para las vistas (`views`). |
| **Middlewares** (`src/middlewares/`) | Funciones que corren antes del controller. `validate.middleware.js` aplica un esquema de Zod sobre el `body`, los `params` o la `query`, y responde `400` si los datos son inválidos, cortando el flujo antes de llegar a la base de datos. |
| **Schemas** (`src/schemas/`) | Definen, con Zod, cómo debe verse un dato válido para cada operación (crear/actualizar servicio, consultar servicios, crear reserva, agregar servicio a reserva). |
| **Controllers** (`src/controllers/`) | Leen `req.params`, `req.query` y `req.body`, llaman al service correspondiente, y arman la respuesta: JSON con `res.json()` en la API, o HTML con `res.render()` en las vistas. No acceden directamente a la base de datos ni contienen reglas de negocio. |
| **Services** (`src/services/`) | Contienen la lógica de negocio: valores por defecto de paginación, armado de filtros y ordenamiento, cálculo de metadatos de paginación, reglas como "si el servicio ya está en la reserva, incrementar `quantity` en vez de duplicarlo", y la decisión de qué error lanzar. No conocen `req` ni `res`, ni saben cómo se persisten los datos. |
| **Repositories** (`src/repositories/`) | Actúan como intermediarios entre el Service y el DAO. Ofrecen métodos de acceso a datos sin ninguna regla de negocio. No saben qué tecnología de persistencia hay por debajo. |
| **DAO** (`src/dao/`) — *Data Access Object* | La única capa que sabe que los datos viven en MongoDB. Usa los modelos de Mongoose (`src/dao/models/`) para consultar y persistir documentos (`find`, `sort`, `skip`, `limit`, `populate`, etc.). No contiene lógica de negocio. |
| **Modelos de Mongoose** (`src/dao/models/`) | Definen el `Schema` de cada colección (`services`, `bookings`, `messages`): forma de los documentos, tipos de datos y validaciones básicas (`required`, `ref`, etc.). |

Las **vistas** (`src/views/`) y los archivos estáticos (`src/public/`) pertenecen a la capa de presentación: los controllers de vistas reutilizan los mismos services que la API, así que no duplican lógica.

## Recurso: `services`

Cada servicio tiene la siguiente forma:

```js
{
  _id: ObjectId,       // generado automáticamente por MongoDB
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

Devuelve los servicios con filtros, paginación y ordenamiento. Todos los parámetros son opcionales y combinables entre sí:

| Query param | Descripción | Valores permitidos | Por defecto |
|-------------|--------------|---------------------|--------------|
| `category`  | Filtra por categoría (coincidencia exacta). | Cualquier texto | — |
| `available` | Filtra por disponibilidad. | `true` o `false` | — |
| `page`      | Número de página. | Entero ≥ 1 | `1` |
| `limit`     | Resultados por página. | Entero entre 1 y 100 | `10` |
| `sortBy`    | Campo por el cual ordenar. | `name`, `price`, `duration`, `category` | `name` |
| `order`     | Dirección del orden. | `asc` o `desc` | `asc` |

**Ejemplos:**

```
GET /api/services                                         # primera página, 10 resultados, por nombre
GET /api/services?category=Cabello                         # solo la categoría "Cabello"
GET /api/services?available=true                           # solo servicios disponibles
GET /api/services?limit=5&page=2                           # segunda página de 5 resultados
GET /api/services?sortBy=price&order=desc                  # del más caro al más barato
GET /api/services?category=Cabello&available=true&sortBy=price&order=asc&page=1&limit=3
```

**Respuesta (200):**
```json
{
  "status": "success",
  "payload": [
    {
      "_id": "6abc23ec2571570c39008388",
      "name": "Corte clásico",
      "description": "Corte de cabello tradicional con acabado a tijera y máquina.",
      "duration": 45,
      "price": 150,
      "category": "Corte de cabello",
      "available": true
    }
  ],
  "total": 12,
  "page": 2,
  "limit": 5,
  "totalPages": 3,
  "hasPrevPage": true,
  "hasNextPage": true
}
```

| Campo de metadatos | Significado |
|--------------------|--------------|
| `total`       | Total de servicios que cumplen el filtro (no solo los de la página). |
| `page`        | Página actual. |
| `limit`       | Resultados por página. |
| `totalPages`  | Total de páginas (`ceil(total / limit)`). |
| `hasPrevPage` | `true` si existe una página anterior. |
| `hasNextPage` | `true` si existe una página siguiente. |

**Respuesta (400) — query param inválido** (por ejemplo `?limit=500` o `?sortBy=otraCosa`):
```json
{
  "status": "error",
  "message": "limit: El límite máximo es 100 resultados por página"
}
```

### `GET /api/services/:sid`

Devuelve el servicio con el `_id` indicado.

**Respuesta (200):**
```json
{
  "status": "success",
  "payload": { "_id": "6abc23ec2571570c39008388", "name": "Corte clásico", "...": "..." }
}
```

**Respuesta (404) — el servicio no existe (o el id no es válido):**
```json
{
  "status": "error",
  "message": "Servicio no encontrado"
}
```

### `POST /api/services`

Crea un nuevo servicio. El `_id` lo genera MongoDB automáticamente; todos los demás campos son obligatorios y se validan antes de llegar a la base de datos. Al crearse con éxito, además de responder, el servidor emite el evento de Socket.io `service:created` (ver sección "Tiempo real").

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
    "_id": "6abc23ec2571570c39008388",
    "name": "Corte de cabello",
    "description": "Corte de cabello para hombres y mujeres",
    "duration": 30,
    "price": 20,
    "category": "Cabello",
    "available": true,
    "__v": 0
  }
}
```

**Respuesta (400) — datos inválidos:**
```json
{
  "status": "error",
  "message": "price: El precio del servicio debe ser un número, duration: La duración del servicio debe ser un número"
}
```

### `PUT /api/services/:sid`

Actualiza un servicio existente. Acepta uno o varios campos; se validan con las mismas reglas que la creación, y es obligatorio enviar al menos uno.

**Body de ejemplo:**
```json
{ "price": 25 }
```

**Respuesta (200):**
```json
{
  "status": "success",
  "payload": { "_id": "6abc23ec2571570c39008388", "price": 25, "...": "..." }
}
```

**Respuesta (400) — body vacío o datos inválidos:**
```json
{
  "status": "error",
  "message": "Debes enviar al menos un campo para actualizar"
}
```

**Respuesta (404) — el servicio no existe:**
```json
{
  "status": "error",
  "message": "Servicio con id 6abc23ec2571570c39008388 no encontrado"
}
```

### `DELETE /api/services/:sid`

Elimina el servicio con el `_id` indicado.

**Respuesta (200):**
```json
{
  "status": "success",
  "message": "Servicio con id 6abc23ec2571570c39008388 eliminado correctamente"
}
```

**Respuesta (404) — el servicio no existe:**
```json
{
  "status": "error",
  "message": "Servicio con id 6abc23ec2571570c39008388 no encontrado"
}
```

## Recurso: `bookings`

```js
{
  _id: ObjectId,         // generado automáticamente por MongoDB
  clientName: String,
  clientEmail: String,
  date: String,
  time: String,
  status: String,
  services: [
    { service: ObjectId, quantity: Number } // referencia al _id del servicio, cantidad
  ]
}
```

Cada elemento de `services` **guarda solo la referencia** al documento de la colección `services` (`ObjectId`, `ref: "services"`), nunca el servicio completo. Los datos completos se obtienen al consultar, con `populate`.

### Endpoints

Base URL: `http://localhost:8080/api/bookings`

#### `POST /api/bookings`
Crea una reserva. Puede iniciarse con `services` vacío u omitido (por defecto `[]`). Si se envían servicios, cada uno se indica con su `ObjectId` y una cantidad (por defecto `1`).

**Body:**
```json
{
  "clientName": "Juan Pérez",
  "clientEmail": "juan@gmail.com",
  "date": "2026-09-10",
  "time": "08:00",
  "status": "Agendado",
  "services": [
    { "service": "6abc23ec2571570c39008388", "quantity": 2 }
  ]
}
```

**201:**
```json
{
  "status": "success",
  "payload": {
    "_id": "6abc24812571570c39008389",
    "clientName": "Juan Pérez",
    "clientEmail": "juan@gmail.com",
    "date": "2026-09-10",
    "time": "08:00",
    "status": "Agendado",
    "services": [
      { "service": "6abc23ec2571570c39008388", "quantity": 2, "_id": "6abc24e12571570c3900838a" }
    ],
    "__v": 0
  }
}
```

**400 (datos inválidos):**
```json
{ "status": "error", "message": "clientEmail: El correo electrónico del cliente no es válido" }
```

#### `GET /api/bookings/:bid`
Devuelve una reserva por `_id`, **con los datos completos de cada servicio asociado** (se usa `populate("services.service")`). Los servicios siguen guardados en la base de datos solo como referencias; `populate` únicamente completa la información al consultar.

**200:**
```json
{
  "status": "success",
  "payload": {
    "_id": "6abc24812571570c39008389",
    "clientName": "Juan Pérez",
    "clientEmail": "juan@gmail.com",
    "date": "2026-09-10",
    "time": "08:00",
    "status": "Agendado",
    "services": [
      {
        "service": {
          "_id": "6abc23ec2571570c39008388",
          "name": "Corte de cabello",
          "description": "Corte de cabello para hombres y mujeres",
          "duration": 30,
          "price": 20,
          "category": "Cabello",
          "available": true
        },
        "quantity": 2,
        "_id": "6abc24e12571570c3900838a"
      }
    ],
    "__v": 0
  }
}
```

**404 (la reserva no existe o el id no es válido):**
```json
{ "status": "error", "message": "Reserva no encontrada" }
```

#### `POST /api/bookings/:bid/services/:sid`
Agrega un servicio a una reserva existente. Valida que `:bid` y `:sid` tengan formato de `ObjectId`, y que ambos recursos existan. Si el servicio ya estaba agregado, incrementa su `quantity` en vez de duplicarlo (comparando los `ObjectId` con `.equals()`). Lo que se persiste son solo referencias, no el servicio completo.

**201:**
```json
{
  "status": "success",
  "payload": {
    "_id": "6abc24812571570c39008389",
    "clientName": "Juan Pérez",
    "services": [
      { "service": "6abc23ec2571570c39008388", "quantity": 1, "_id": "6abc24e12571570c3900838a" }
    ],
    "...": "..."
  }
}
```

**400 (ids con formato inválido):**
```json
{ "status": "error", "message": "bid: El ID debe ser un ObjectId válido" }
```

**404 (reserva o servicio no existe):**
```json
{ "status": "error", "message": "No se encontro el booking con id: 6abc24812571570c39008399" }
```

## Validaciones (Zod)

Las validaciones se aplican con **Zod** a través del middleware `validate` (`src/middlewares/validate.middleware.js`), configurado en los routers. Corren **antes** del controller, así que los datos inválidos nunca llegan a MongoDB. Los esquemas viven en `src/schemas/`, separados de las rutas y de los modelos.

Cuando los datos no son válidos, la API responde `400` con un mensaje que indica el campo y el motivo (varios errores se separan con comas):

```json
{ "status": "error", "message": "campo: motivo del error" }
```

| Operación | Esquema | Reglas principales |
|-----------|----------|----------------------|
| Crear servicio (`POST /api/services`) | `createServiceSchema` | `name`, `description` y `category`: texto no vacío. `duration`: entero ≥ 1. `price`: número ≥ 0. `available`: booleano. Todos obligatorios. |
| Actualizar servicio (`PUT /api/services/:sid`) | `updateServiceSchema` | Mismas reglas, pero todos los campos son opcionales; se exige **al menos uno**. |
| Consultar servicios (`GET /api/services`) | `getServicesQuerySchema` | `available`: `true`/`false`. `page`: entero ≥ 1. `limit`: entero entre 1 y 100. `sortBy`: `name`, `price`, `duration` o `category`. `order`: `asc` o `desc`. |
| Crear reserva (`POST /api/bookings`) | `createBookingSchema` | `clientName`: texto no vacío. `clientEmail`: correo válido. `date`: formato `AAAA-MM-DD` y fecha real. `time`: formato `HH:mm`. `status`: `Agendado`, `Confirmado` o `Cancelado`. `services` (opcional): lista de `{ service: ObjectId, quantity: entero ≥ 1 }`. |
| Agregar servicio a reserva (`POST /api/bookings/:bid/services/:sid`) | `addServiceToBookingParamsSchema` | `bid` y `sid`: `ObjectId` válidos (24 caracteres hexadecimales). |

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
  - `ServicesDAO`: usa el modelo `Service` de Mongoose — `getAll` (`find().lean()`, usado por las vistas), `getPaginated` (`find` con filtro, `sort`, `skip` y `limit`, más `countDocuments` para el total), `getById` (`findById`), `create`, `update` (`findByIdAndUpdate` con `{ new: true }`), `delete` (`findByIdAndDelete`).
  - `ServicesRepository`: intermediario entre el Service y el DAO, mismos métodos que el DAO.
  - `ServicesService`: reglas de negocio — `getServicesPaginated` arma el filtro, el orden y el `skip`, aplica los valores por defecto y calcula los metadatos de paginación; también la validación de campos requeridos en la creación y la decisión de qué error lanzar cuando un `id` no existe.
- **`bookings`**
  - `BookingsDAO`: usa el modelo `Booking` de Mongoose — `getAll` (`find().lean()`), `create`, `getById` (`findById`, sin `populate`, usado internamente al agregar servicios), `getByIdPopulated` (`findById` con `populate("services.service")`, usado por la consulta pública de una reserva), `update` (`findByIdAndUpdate` con `{ new: true }`).
  - `BookingsRepository`: intermediario entre el Service y el DAO, mismos métodos que el DAO.
  - `BookingsService`: reglas de negocio — validación de campos requeridos, forzar `services: []` por defecto, y la regla de incrementar `quantity` al agregar un servicio repetido (comparando `ObjectId` con `.equals()`). Recibe una instancia de `ServicesService` para validar que los servicios existan antes de agregarlos a una reserva.

Los DAO manejan además el caso de un `id` con formato inválido (`CastError` de Mongoose): lo capturan con `try/catch` en `getById` y `getByIdPopulated` y devuelven `null`, para que la API siga respondiendo `404` en vez de un error `500`.

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
  middlewares/
    validate.middleware.js
  schemas/
    service.schema.js
    booking.schema.js
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