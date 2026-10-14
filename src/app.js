import express from "express";
import { engine } from 'express-handlebars';
import createServiceRouter from "./routes/services.router.js";
import createBookingRouter from "./routes/bookings.router.js";
import createViewsRouter from "./routes/views.router.js";

import ServicesDAO from "./dao/services.dao.js";
import ServicesRepository from "./repositories/services.repository.js";
import ServicesService from "./services/services.service.js";

import BookingsDAO from "./dao/bookings.dao.js";
import BookingsRepository from "./repositories/bookings.repository.js";
import BookingsService from "./services/bookings.service.js";

const servicesDAO = new ServicesDAO();
const servicesRepository = new ServicesRepository(servicesDAO);
const service = new ServicesService(servicesRepository);

const bookingsDAO = new BookingsDAO();
const bookingsRepository = new BookingsRepository(bookingsDAO);
const booking = new BookingsService(bookingsRepository, service);

const app = express();
app.use(express.json());
app.use(express.static("./src/public"));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

app.use("/views", createViewsRouter(service, booking));
app.use("/api/services", createServiceRouter(service));
app.use("/api/bookings", createBookingRouter(booking));

export default app;
