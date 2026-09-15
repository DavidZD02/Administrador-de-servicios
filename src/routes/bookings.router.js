import { Router } from "express";
import { addServiceToBooking, createBooking, getBookingById } from "../controllers/bookings.controller.js";

export default function createBookingRouter(bookingManager) {
  const router = Router();

  router.get("/:bid", getBookingById(bookingManager));
  router.post("/", createBooking(bookingManager));
  router.post("/:bid/services/:sid", addServiceToBooking(bookingManager));

  return router;
}
