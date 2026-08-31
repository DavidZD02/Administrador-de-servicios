import { Router } from "express";
import ServicesManager from "../managers/ServiceManager.js";

const router = Router();
const servicesMan = new ServicesManager();

router.get("/", (req, res) => {
  let services = servicesMan.getServices();
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
});

router.get("/:sid", (req, res) => {
  const { sid } = req.params;
  const service = servicesMan.getServiceById(sid);
  if (!service) {
    return res
      .status(404)
      .json({ status: "error", message: "Servicio no encontrado" });
  }
  res.status(200).json({ status: "success", payload: service });
});

router.post("/", (req, res) => {
  const { name, description, duration, price, category, available } = req.body;
  try {
    const service = servicesMan.addService(req.body);
    res.status(201).json({ status: "success", payload: service });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

router.put("/:sid", (req, res) => {
  const { sid } = req.params;
  try {
    const service = servicesMan.updateService(sid, req.body);
    res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

router.delete("/:sid", (req, res) => {
  const { sid } = req.params;
  try {
    const service = servicesMan.deleteService(sid);
    res.status(200).json({ status: "success", message: service.message });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

export default router;
