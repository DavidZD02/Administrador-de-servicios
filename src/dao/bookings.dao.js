// src/dao/bookings.dao.js
import fs from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class BookingsDAO {
  constructor() {
    this.filePath = path.join(__dirname, "../data/bookings.json");
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

  async getById(id) {
    const bookings = await this.readBookings();
    const booking = bookings.find((s) => s.id === Number(id));
    return booking ?? null;
  }

  async create(bookingData) {
    const bookings = await this.readBookings();

    const ids = bookings.map((booking) => booking.id);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;

    const newBooking = { ...bookingData, id: newId };
    bookings.push(newBooking);
    await this.writeBookings(bookings);
    return newBooking ?? null;
  }

  async update(id, bookingData) {
    const bookings = await this.readBookings();
    id = parseInt(id);
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      return null;
    }
    bookings[index] = { ...bookings[index], ...bookingData, id };
    await this.writeBookings(bookings);
    return bookings[index];
  }
}
