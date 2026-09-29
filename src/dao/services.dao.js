// src/dao/services.dao.js
import fs from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ServicesDAO {
  constructor() {
    this.filePath = path.join(__dirname, "../data/services.json");
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

  async getAll() {
    return await this.readServices();
  }

  async getById(id) {
    const services = await this.readServices();
    const service = services.find((s) => s.id === Number(id));
    return service ?? null;
  }

  async create(serviceData) {
    const services = await this.readServices();
    const ids = services.map((service) => service.id);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;
    const newService = { ...serviceData, id: newId };
    services.push(newService);
    await this.writeServices(services);
    return newService ?? null;
  }

  async update(id, serviceData) {
    const services = await this.readServices();
    id = parseInt(id);
    const index = services.findIndex((service) => service.id === id);
    if (index === -1) {
        return null
    }

    services[index] = { ...services[index], ...serviceData, id };

    await this.writeServices(services);

    return services[index];
  }

  async delete(id) {
    const services = await this.readServices();

    id = parseInt(id);
    const index = services.findIndex((service) => service.id === id);
    if (index === -1) {
        return null
    }

    services.splice(index, 1);

    await this.writeServices(services);

    return { message: `Servicio con id ${id} eliminado correctamente` };
  }
}
