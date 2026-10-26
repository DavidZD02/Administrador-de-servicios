// src/services/services.service.js
export default class ServicesService {
  constructor(repository) {
    this.repository = repository;
  }

  async getServicesPaginated(query = {}) {
    const {
      category,
      available,
      page = 1,
      limit = 10,
      sortBy = "name",
      order = "asc",
    } = query;

    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (available !== undefined) {
      filter.available = available === "true";
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const { services, total } = await this.repository.getPaginated(filter, {
      sort,
      skip,
      limit: limitNum,
    });
    const totalPages = Math.ceil(total / limitNum);
    return {
      services,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasPrevPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
    };
  }

  async getServices(filters = {}) {
    let services = await this.repository.getAll();

    if (filters.category) {
      services = services.filter(
        (service) => service.category === filters.category,
      );
    }

    if (filters.available) {
      services = services.filter(
        (service) => service.available === (filters.available === "true"),
      );
    }

    return services;
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
