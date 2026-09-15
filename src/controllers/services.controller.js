export const getServices = (serviceManager) => async (req, res) => {
  let services = await serviceManager.getServices();
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

export const getServiceById = (serviceManager) => async (req, res) => {
  const { sid } = req.params;
  const service = await serviceManager.getServiceById(sid);
  if (!service) {
    return res
      .status(404)
      .json({ status: "error", message: "Servicio no encontrado" });
  }
  res.status(200).json({ status: "success", payload: service });
};

export const createService = (serviceManager) => async (req, res) => {
  const { name, description, duration, price, category, available } = req.body;
  try {
    const service = await serviceManager.addService(req.body);
    res.status(201).json({ status: "success", payload: service });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateService = (serviceManager) => async (req, res) => {
  const { sid } = req.params;
  try {
    const service = await serviceManager.updateService(sid, req.body);
    res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
};

export const deleteService = (serviceManager) => async (req, res) => {
  const { sid } = req.params;
  try {
    const service = await serviceManager.deleteService(sid);
    res.status(200).json({ status: "success", message: service.message });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
};

