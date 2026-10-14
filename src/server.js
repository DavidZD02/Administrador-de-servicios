import app from "./app.js";
import { env } from "./config/env.config.js";
import { connectDB } from './config/database.config.js';
import { Server } from "socket.io";

const PORT = env.PORT;

await connectDB();

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});

const io = new Server(httpServer);
app.set("io", io);
