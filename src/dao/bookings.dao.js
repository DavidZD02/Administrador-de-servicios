// src/dao/bookings.dao.js
import Booking from "./models/booking.model.js";

export default class BookingsDAO {
  async getAll() {
    return await Booking.find().lean();
  }

  async getById(id) {
    try {
      return await Booking.findById(id);
    } catch (error) {
      return null;
    }
  }

  async getByIdPopulated(id) {
  try {
    return await Booking.findById(id).populate("services.service").lean();
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
