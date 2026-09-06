import express from "express";
import createServiceRouter from "./routes/services.router.js";
import createBookingRouter from "./routes/bookings.router.js";
import { ServiceManager } from "./managers/ServiceManager.js";
import { BookingManager } from "./managers/BookingManager.js";

const serviceManager = new ServiceManager();
const bookingManager = new BookingManager(serviceManager);

const app = express();
app.use(express.json());

app.use("/api/services", createServiceRouter(serviceManager));
app.use("/api/bookings", createBookingRouter(bookingManager));

export default app;
