import Service from "./models/service.model.js";

export default class ServicesDAO {
  async getAll() {
    return await Service.find();
  }

  async getById(id) {
    try {
      return await Service.findById(id);
    } catch (error) {
      return null
    }
  }

  async create(serviceData) {
    return await Service.create(serviceData);
  }

  async update(id, serviceData) {
    return await Service.findByIdAndUpdate(id, serviceData, { new: true });
  }

  async delete(id) {
    const delService = await Service.findByIdAndDelete(id);
    if (!delService) {
      return null;
    }

    return { message: `Servicio con id ${id} eliminado correctamente` };
  }
}
