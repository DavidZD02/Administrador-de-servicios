// src/services/services.service.js
export default class ServicesService {
  constructor(repository) {
    this.repository = repository;
  }

  async getServices() {
    return await this.repository.getAll();
  }

  async getServiceById(id) {
    return this.repository.getById(id);
  }

  async createService(serviceData) {
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

    return this.repository.create(serviceData);
  }

  async updateService(id, serviceData) {
    const updated = await this.repository.update(id, serviceData);
    if (updated === null) {
      throw new Error(`Servicio con id ${id} no encontrado`);
    }
    return updated;
  }

  async deleteService(id) {
    const deleted = await this.repository.delete(id);
    if (deleted === null) {
      throw new Error(`Servicio con id ${id} no encontrado`);
    }
    return deleted;
  }
}
