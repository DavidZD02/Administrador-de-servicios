import { Router } from "express";
import { createService, deleteService, getServiceById, getServices, updateService } from "../controllers/services.controller.js";

export default function createServiceRouter(serviceManager) {
  const router = Router();

  router.get("/", getServices(serviceManager));
  router.get("/:sid", getServiceById(serviceManager));
  router.post("/", createService(serviceManager));
  router.put("/:sid", updateService(serviceManager));
  router.delete("/:sid", deleteService(serviceManager));

  return router;
}
