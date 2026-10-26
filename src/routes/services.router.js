import { Router } from "express";
import { createService, deleteService, getServiceById, getServices, updateService } from "../controllers/services.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesQuerySchema,
} from "../schemas/service.schema.js";

export default function createServiceRouter(serviceManager) {
  const router = Router();

  router.get("/", validate(getServicesQuerySchema, "query"), getServices(serviceManager));
  router.post("/", validate(createServiceSchema), createService(serviceManager));
  router.put("/:sid", validate(updateServiceSchema), updateService(serviceManager));
  router.get("/:sid", getServiceById(serviceManager));
  router.delete("/:sid", deleteService(serviceManager));

  return router;
}
