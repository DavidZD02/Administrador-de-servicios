export const getServicesView = (serviceManager) => async (req, res) => {
  const services = await serviceManager.getServices();
  res.render("services", { services });
};

export const getBookingsView = (bookingManager) => async (req, res) => {
  const bookings = await bookingManager.getAllBookings();
  res.render("bookings", { bookings });
};