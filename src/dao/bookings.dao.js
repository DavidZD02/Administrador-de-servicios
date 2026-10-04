// src/dao/bookings.dao.js
import Booking from "./models/booking.model.js";

export default class BookingsDAO {
  async getById(id) {
    try {
      return await Booking.findById(id);
    } catch (error) {
      return null;
    }
  }

  async create(bookingData) {
    return await Booking.create(bookingData);
  }

  async update(id, bookingData) {
    return await Booking.findByIdAndUpdate(id, bookingData, { new: true });
  }
}
