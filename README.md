# Administrador-de-servicios

## Descripción

Proyecto en Node.js con ESM que implementa la clase `ServiceManager`, encargada de gestionar los servicios de un sistema de turnos y reservas (crear, consultar, actualizar y eliminar servicios). Los datos se almacenan en un archivo JSON local (`src/data/services.json`) y las variables de configuración se validan al iniciar la aplicación.

## Instalación
1. Clonar el repositorio:

```bash
   git clone https://github.com/DavidZD02/Administrador-de-servicios.git
   cd https://github.com/DavidZD02/Administrador-de-servicios
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
node app.js
```

Esto carga la configuración, valida las variables de entorno, instancia `ServiceManager` y ejecuta una demostración de sus métodos por consola.

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

## Uso de `ServiceManager`

```js
import ServiceManager from "./src/managers/ServiceManager.js";

const manager = new ServiceManager();
```

### `getServices()`

Devuelve todos los servicios registrados.

```js
const servicios = manager.getServices();
console.log(servicios);
```

### `getServiceById(id)`

Devuelve el servicio con el `id` indicado, o `null` si no existe.

```js
const servicio = manager.getServiceById(1);
console.log(servicio); // { id: 1, name: "Corte clásico", ... } o null
```

### `addService(serviceData)`

Agrega un nuevo servicio. El `id` se genera automáticamente. Todos los campos (`name`, `description`, `duration`, `price`, `category`, `available`) son obligatorios; si falta alguno, lanza un error.

```js
const nuevoServicio = manager.addService({
  name: "Corte de cabello",
  description: "Corte de cabello para hombres y mujeres",
  duration: 30,
  price: 20,
  category: "Cabello",
  available: true,
});

console.log(nuevoServicio); // incluye el id generado automáticamente
```

### `updateService(id, updatedData)`

Actualiza un servicio existente. No permite modificar el `id`. Lanza un error si el servicio no existe.

```js
const actualizado = manager.updateService(1, { price: 25 });
console.log(actualizado);
```

### `deleteService(id)`

Elimina el servicio con el `id` indicado. Lanza un error si no existe.

```js
const resultado = manager.deleteService(1);
console.log(resultado); // { message: "Servicio con id 1 eliminado correctamente" }
```
