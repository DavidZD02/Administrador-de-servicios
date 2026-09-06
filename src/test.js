import { BookingManager } from "./managers/BookingManager.js";

const bookingManager = new BookingManager();

// const booking = {
//   id: 2,
//   clientName: "Juan",
//   clientEmail: "dao",
//   date: "2026-09-05",
//   time: "",
//   status: ""
// };

// await bookingManager.createBooking(booking);
// const bookings = await bookingManager.getBookings();

const boo = await bookingManager.addServiceToBooking(3,2)