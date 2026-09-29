export const getServices = (service) => async (req, res) => {
  let services = await service.getServices();
  const { category, available } = req.query;

  if (category) {
    services = services.filter((service) => service.category == category);
  }

  if (available) {
    services = services.filter(
      (service) => service.available === (available === "true"),
    );
  }

  res.status(200).json({ status: "success", payload: services });
};

export const getServiceById = (service) => async (req, res) => {
  const { sid } = req.params;
  const serviceById = await service.getServiceById(sid);
  if (!serviceById) {
    return res
      .status(404)
      .json({ status: "error", message: "Servicio no encontrado" });
  }
  res.status(200).json({ status: "success", payload: serviceById });
};

export const createService = (service) => async (req, res) => {
  const { name, description, duration, price, category, available } = req.body;
  try {
    const newService = await service.createService(req.body);
    res.status(201).json({ status: "success", payload: newService });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateService = (service) => async (req, res) => {
  const { sid } = req.params;
  try {
    const upService = await service.updateService(sid, req.body);
    res.status(200).json({ status: "success", payload: upService });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
};

export const deleteService = (service) => async (req, res) => {
  const { sid } = req.params;
  try {
    const delService = await service.deleteService(sid);
    res.status(200).json({ status: "success", message: delService.message });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
};

