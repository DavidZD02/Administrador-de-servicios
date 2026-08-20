import {env} from "./src/config/env.config.js";
import ServiceManager from "./src/managers/ServiceManager.js";

const manager = new ServiceManager();
const port = env.PORT;
const node_env = env.NODE_ENV;

console.log(`Servidor corriendo en el puerto ${port} en modo ${node_env}`);

console.log("Servicios antes de agregar un servicio:", manager.getServices());
console.log("Servicios iniciales:", manager.addService({
    name: "Corte de cabello",
    description: "Corte de cabello para hombres y mujeres",
    duration: 30,
    price: 20,
    category: "Cabello",
    available: true
}));
console.log("Servicios después de agregar un servicio:", manager.getServices());
console.log("Servicio con id 1:", manager.getServiceById(1));
console.log("Actualizando servicio con id 1:", manager.updateService(1, { price: 25 }));
console.log("Servicios después de actualizar un servicio:", manager.getServices());
console.log("Eliminando servicio con id 1:", manager.deleteService(1));
console.log("Servicios después de eliminar un servicio:", manager.getServices());
