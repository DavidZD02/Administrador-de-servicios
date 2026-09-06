import fs from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BookingManager {
  constructor(serviceManager) {
    const filePath = path.join(__dirname, "../data/bookings.json");
    this.filePath = filePath;
    this.serviceManager = serviceManager;
  }

  async readBookings() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.log(error.message);
      return [];
    }
  }

  async writeBookings(bookings) {
    await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2));
  }

  async getBookings() {
    const bookings = await this.readBookings();
    return bookings;
  }

  async getBookingById(id) {
    const bookings = await this.readBookings();
    const booking = bookings.find((booking) => booking.id === Number(id));

    if (!booking) {
      return null;
    }
    return booking;
  }

  async createBooking(bookingData) {
    const bookings = await this.getBookings();

    const requiredFields = [
      "clientName",
      "clientEmail",
      "date",
      "time",
      "status",
    ];
    const missing = [];

    for (const field of requiredFields) {
      if (bookingData[field] === undefined) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Faltan los siguientes campos requeridos: ${missing.join(", ")}`,
      );
    }

    const ids = bookings.map((booking) => booking.id);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;

    const newBooking = {
      ...bookingData,
      id: newId,
      services: bookingData.services ?? [],
    };

    bookings.push(newBooking);

    await this.writeBookings(bookings);

    return newBooking;
  }

  async addServiceToBooking(bookingId, serviceId) {
    const bookings = await this.getBookings();
    const bookingIndex = bookings.findIndex(
      (bookingIndex) => bookingIndex.id === parseInt(bookingId),
    );

    if (bookingIndex == -1) {
      throw new Error(`No se encontro el booking con id: ${bookingId}`);
    }

    const service = this.serviceManager.getServiceById(serviceId);

    if (!service) {
      throw new Error(`No se encontro el servicio con id: ${serviceId}`);
    }

    const booking = bookings[bookingIndex];
    const existService = booking.services.findIndex(
      (existService) => existService.service === parseInt(serviceId),
    );

    if (existService != -1) {
      booking.services[existService].quantity += 1;
    } else {
      const newServicetoBooking = {
        service: parseInt(serviceId),
        quantity: 1,
      };
      booking.services.push(newServicetoBooking);
    }

    await this.writeBookings(bookings);
    return booking;
  }
}
