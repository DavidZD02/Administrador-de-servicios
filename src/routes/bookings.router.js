import { Router } from "express";

export default function createBookingRouter(bookingManager) {
  const router = Router();
  router.get("/:bid", async (req, res) => {
    const { bid } = req.params;
    const booking = await bookingManager.getBookingById(bid);
    if (!booking) {
      return res
        .status(404)
        .json({ status: "error", message: "Reserva no encontrada" });
    }
    res.status(200).json({ status: "success", payload: booking });
  });

  router.post("/", async (req, res) => {
    try {
      const booking = await bookingManager.createBooking(req.body);
      res.status(201).json({ status: "success", payload: booking });
    } catch (error) {
      res.status(400).json({ status: "error", message: error.message });
    }
  });

  router.post("/:bid/services/:sid", async (req, res) => {
    const { bid, sid } = req.params;
    try {
      const booking = await bookingManager.addServiceToBooking(bid, sid);
      res.status(201).json({ status: "success", payload: booking });
    } catch (error) {
      res.status(404).json({ status: "error", message: error.message });
    }
  });

  return router;
}
