import fs from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ServiceManager {
  constructor() {
    const filePath = path.join(__dirname, "../data/services.json");
    this.filePath = filePath;
  }

  async readServices() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.log(error.message);
      return [];
    }
  }

  async writeServices(services) {
    await fs.writeFile(this.filePath, JSON.stringify(services, null, 2));
  }

  async getServices() {
    const services = await this.readServices();
    return services;
  }

  async getServiceById(id) {
    const services = await this.readServices();
    const service = services.find((service) => service.id === Number(id));

    if (!service) {
      return null;
    }
    return service;
  }

  async addService(serviceData) {
    const services = await this.getServices();
    const requiredFields = [
      "name",
      "description",
      "duration",
      "price",
      "category",
      "available",
    ];
    const missing = [];

    for (const field of requiredFields) {
      if (serviceData[field] === undefined) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Faltan los siguientes campos requeridos: ${missing.join(", ")}`,
      );
    }

    const ids = services.map((service) => service.id);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;

    const newService = { ...serviceData, id: newId };

    services.push(newService);

    await this.writeServices(services);

    return newService;
  }

  async updateService(id, updatedData) {
    const services = await this.getServices();
    id = parseInt(id);
    const index = services.findIndex((service) => service.id === id);

    if (index === -1) {
      throw new Error(`Servicio con id ${id} no encontrado`);
    }

    services[index] = { ...services[index], ...updatedData, id };

    await this.writeServices(services);

    return services[index];
  }

  async deleteService(id) {
    const services = await this.getServices();

    id = parseInt(id);
    const index = services.findIndex((service) => service.id === id);

    if (index === -1) {
      throw new Error(`Servicio con id ${id} no encontrado`);
    }

    services.splice(index, 1);

    await this.writeServices(services);

    return { message: `Servicio con id ${id} eliminado correctamente` };
  }
}

export default ServiceManager;
