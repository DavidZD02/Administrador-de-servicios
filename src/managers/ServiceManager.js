import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServiceManager {
    constructor() {
        const rutaJson = path.join(__dirname, "../data/services.json");
        const contenido = fs.readFileSync(rutaJson, "utf-8");
        const datos = JSON.parse(contenido);
        this.services = datos;
    }

    getServices() {
        return this.services;
    }

    getServiceById(id) {
        id = parseInt(id);
        const resultado = this.services.find((service) => service.id === id);
        if (!resultado) {
            throw new Error(`Servicio con id ${id} no encontrado`);
        }
        return resultado;
    }

    addService(serviceData) {
        const requiredFields = ["name", "description", "duration", "price", "category", "available"];
        const missing = [];

        for (const field of requiredFields) {
            if (serviceData[field] === undefined) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            throw new Error(`Faltan los siguientes campos requeridos: ${missing.join(", ")}`);
        }

        const ids = this.services.map((service) => service.id);
        const maxId = ids.length > 0 ? Math.max(...ids) : 0;
        const newId = maxId + 1;

        const newService = { ...serviceData, id: newId };

        this.services.push(newService);

        return newService;
    }

    updateService(id, updatedData) {
        id = parseInt(id);
        const index = this.services.findIndex((service) => service.id === id);

        if (index === -1) {
            throw new Error(`Servicio con id ${id} no encontrado`);
        }

        this.services[index] = { ...this.services[index], ...updatedData, id };

        return this.services[index];

    }

    deleteService(id) {
        id = parseInt(id);
        const index = this.services.findIndex((service) => service.id === id);

        if (index === -1) {
            throw new Error(`Servicio con id ${id} no encontrado`);
        }
        
        this.services.splice(index, 1);

        return { message: `Servicio con id ${id} eliminado correctamente` };
    
    }
}

export default ServiceManager;