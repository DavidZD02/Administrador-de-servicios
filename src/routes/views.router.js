import { Router } from "express";
import { getServicesView } from "../controllers/views.controller.js";
import { getBookingsView } from "../controllers/views.controller.js";

export default function createViewsRouter(serviceManager, bookingManager) {
  const router = Router();

  router.get("/services", getServicesView(serviceManager));
  router.get("/bookings", getBookingsView(bookingManager));

  return router;
}