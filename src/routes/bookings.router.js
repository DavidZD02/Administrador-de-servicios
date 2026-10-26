import { Router } from "express";
import { addServiceToBooking, createBooking, getBookingById } from "../controllers/bookings.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema, addServiceToBookingParamsSchema } from "../schemas/booking.schema.js";

export default function createBookingRouter(bookingManager) {
  const router = Router();

  router.get("/:bid", getBookingById(bookingManager));
  router.post("/", validate(createBookingSchema), createBooking(bookingManager));
  router.post("/:bid/services/:sid", validate(addServiceToBookingParamsSchema, "params"), addServiceToBooking(bookingManager),);

  return router;
}
