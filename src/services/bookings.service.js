export default class BookingsService {
  constructor(repository, servicesService) {
    this.repository = repository;
    this.servicesService = servicesService;
  }

  async getBookingById(id) {
    return this.repository.getById(id);
  }

  async createBooking(bookingData) {
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

    const newBooking = {
      ...bookingData,
      services: bookingData.services ?? [],
    };

    return this.repository.create(newBooking);
  }

  async addServiceToBooking(bookingId, serviceId) {
    const booking = await this.repository.getById(bookingId);
    if (!booking) {
      throw new Error(`No se encontro el booking con id: ${bookingId}`);
    }

    const service = await this.servicesService.getServiceById(serviceId);
    if (!service) {
      throw new Error(`No se encontro el servicio con id: ${serviceId}`);
    }

    const existService = booking.services.findIndex(
      (es) => es.service === parseInt(serviceId),
    );

    if (existService !== -1) {
      booking.services[existService].quantity += 1;
    } else {
      booking.services.push({ service: parseInt(serviceId), quantity: 1 });
    }

    return this.repository.update(bookingId, booking);
  }
}
