export const createBooking = (booking) => async (req, res) => {
  try {
    const newBooking = await booking.createBooking(req.body);
    res.status(201).json({ status: "success", payload: newBooking });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getBookingById = (booking) => async (req, res) => {
  const { bid } = req.params;
  const bookingById = await booking.getBookingById(bid);
  if (!bookingById) {
    return res
      .status(404)
      .json({ status: "error", message: "Reserva no encontrada" });
  }
  res.status(200).json({ status: "success", payload: bookingById });
};

export const addServiceToBooking = (booking) => async (req, res) => {
  const { bid, sid } = req.params;
  try {
    const newBooking = await booking.addServiceToBooking(bid, sid);
    res.status(201).json({ status: "success", payload: newBooking });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
};
